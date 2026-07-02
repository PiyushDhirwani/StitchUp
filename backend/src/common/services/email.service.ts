import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { promises as dns } from 'dns';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private accessToken: string | null = null;
  private accessTokenExpiry = 0;

  constructor(private configService: ConfigService) {}

  // Render free tier blocks all outbound SMTP (25/465/587) but allows HTTPS,
  // so production sends via the Gmail REST API when OAuth creds are present.
  private get useGmailApi(): boolean {
    return Boolean(
      this.configService.get<string>('GMAIL_CLIENT_ID') &&
        this.configService.get<string>('GMAIL_CLIENT_SECRET') &&
        this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
    );
  }

  // ─── Gmail API path (HTTPS :443) ────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiry - 60_000) {
      return this.accessToken;
    }

    const started = Date.now();
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.configService.get<string>('GMAIL_CLIENT_ID', ''),
        client_secret: this.configService.get<string>('GMAIL_CLIENT_SECRET', ''),
        refresh_token: this.configService.get<string>('GMAIL_REFRESH_TOKEN', ''),
        grant_type: 'refresh_token',
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(`token refresh failed (${res.status}): ${JSON.stringify(body)}`);
    }

    this.accessToken = body.access_token as string;
    this.accessTokenExpiry = Date.now() + body.expires_in * 1000;
    this.logger.log(`[gmail-api] access token refreshed in ${Date.now() - started}ms`);
    return this.accessToken;
  }

  private buildMime(to: string, subject: string, html: string): string {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
    const fromEmail = this.configService.get<string>('SMTP_USER');
    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

    const message = [
      `From: "${fromName}" <${fromEmail}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
    ].join('\r\n');

    return Buffer.from(message).toString('base64url');
  }

  private async sendViaGmailApi(to: string, subject: string, html: string): Promise<void> {
    const token = await this.getAccessToken();
    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: this.buildMime(to, subject, html) }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      // Force a token refresh on the next attempt in case it was revoked
      if (res.status === 401) this.accessToken = null;
      throw new Error(`gmail send failed (${res.status}): ${body}`);
    }

    const body = await res.json();
    this.logger.log(`[gmail-api] message accepted (id=${body.id})`);
  }

  // ─── SMTP path (local dev) ──────────────────────────────────────────────

  private nodemailerLogger() {
    const fmt = (...args: unknown[]) =>
      args
        .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ');
    return {
      level: () => {},
      trace: (...a: unknown[]) => this.logger.verbose(`[smtp] ${fmt(...a)}`),
      debug: (...a: unknown[]) => this.logger.debug(`[smtp] ${fmt(...a)}`),
      info: (...a: unknown[]) => this.logger.log(`[smtp] ${fmt(...a)}`),
      warn: (...a: unknown[]) => this.logger.warn(`[smtp] ${fmt(...a)}`),
      error: (...a: unknown[]) => this.logger.error(`[smtp] ${fmt(...a)}`),
      fatal: (...a: unknown[]) => this.logger.error(`[smtp] ${fmt(...a)}`),
    };
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const debug = this.configService.get<string>('SMTP_DEBUG', 'true') === 'true';

    let connectHost = host;
    try {
      const [ipv4] = await dns.resolve4(host);
      if (ipv4) connectHost = ipv4;
      this.logger.log(`[smtp] resolved ${host} -> ${connectHost}`);
    } catch (err) {
      this.logger.warn(`[smtp] IPv4 resolution failed for ${host}: ${err.message}`);
    }

    this.logger.log(
      `[smtp] creating transport: host=${connectHost} port=${port} secure=${port === 465} user=${user}`,
    );

    this.transporter = nodemailer.createTransport({
      host: connectHost,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: { servername: host },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      logger: debug ? this.nodemailerLogger() : false,
      debug,
    });
    return this.transporter;
  }

  private describeError(error: any): string {
    const parts = [
      error.code && `code=${error.code}`,
      error.command && `command=${error.command}`,
      error.responseCode && `responseCode=${error.responseCode}`,
      error.response && `response=${error.response}`,
      `message=${error.message}`,
    ].filter(Boolean);
    return parts.join(' | ');
  }

  // Tests the active transport (Gmail API token or SMTP connection + auth).
  async verifyConnection(): Promise<{ ok: boolean; transport: string; detail: string; elapsed_ms: number }> {
    const started = Date.now();
    const transport = this.useGmailApi ? 'gmail-api' : 'smtp';
    try {
      if (this.useGmailApi) {
        await this.getAccessToken();
      } else {
        const transporter = await this.getTransporter();
        await transporter.verify();
      }
      const elapsed = Date.now() - started;
      this.logger.log(`[${transport}] verify OK in ${elapsed}ms`);
      return { ok: true, transport, detail: 'connection and auth OK', elapsed_ms: elapsed };
    } catch (error) {
      this.transporter = null;
      const detail = this.describeError(error);
      this.logger.error(`[${transport}] verify FAILED after ${Date.now() - started}ms: ${detail}`);
      return { ok: false, transport, detail, elapsed_ms: Date.now() - started };
    }
  }

  // ─── Public send methods ────────────────────────────────────────────────

  private async send(to: string, subject: string, html: string): Promise<boolean> {
    const started = Date.now();
    const transport = this.useGmailApi ? 'gmail-api' : 'smtp';
    this.logger.log(`[${transport}] send start: to=${to} subject=${subject}`);

    try {
      if (this.useGmailApi) {
        await this.sendViaGmailApi(to, subject, html);
      } else {
        const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
        const fromEmail = this.configService.get<string>('SMTP_USER');
        const transporter = await this.getTransporter();
        await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to, subject, html });
      }
      this.logger.log(`[${transport}] email sent to ${to} in ${Date.now() - started}ms`);
      return true;
    } catch (error) {
      this.transporter = null;
      this.logger.error(
        `[${transport}] send FAILED for ${to} after ${Date.now() - started}ms: ${this.describeError(error)}`,
      );
      return false;
    }
  }

  async sendOtp(to: string, otp: string): Promise<boolean> {
    return this.send(
      to,
      'StitchUp - Your Login Verification Code',
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">StitchUp</h2>
          <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    );
  }

  async sendGeneric(to: string, subject: string, html: string): Promise<boolean> {
    return this.send(to, subject, html);
  }
}
