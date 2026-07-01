import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { promises as dns } from 'dns';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {}

  // Adapts nodemailer's bunyan-style logger to Nest's logger so the full
  // SMTP conversation (connect, TLS, auth, send) shows up in Render logs.
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

  // Render free tier has no IPv6 outbound and smtp.gmail.com resolves to IPv6
  // first, so we resolve the IPv4 address ourselves and pin TLS to the hostname.
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const debug = this.configService.get<string>('SMTP_DEBUG', 'true') === 'true';

    const dnsStart = Date.now();
    let connectHost = host;
    try {
      const [ipv4] = await dns.resolve4(host);
      if (ipv4) connectHost = ipv4;
      this.logger.log(
        `[smtp] resolved ${host} -> ${connectHost} in ${Date.now() - dnsStart}ms`,
      );
    } catch (err) {
      this.logger.warn(
        `[smtp] IPv4 resolution failed for ${host}, using hostname: ${err.message}`,
      );
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

  // Tests DNS + TCP + TLS + AUTH without sending a mail.
  async verifyConnection(): Promise<{ ok: boolean; detail: string; elapsed_ms: number }> {
    const started = Date.now();
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      const elapsed = Date.now() - started;
      this.logger.log(`[smtp] verify OK in ${elapsed}ms (connection + auth accepted)`);
      return { ok: true, detail: 'SMTP connection and auth OK', elapsed_ms: elapsed };
    } catch (error) {
      this.transporter = null;
      const detail = this.describeError(error);
      this.logger.error(`[smtp] verify FAILED after ${Date.now() - started}ms: ${detail}`);
      return { ok: false, detail, elapsed_ms: Date.now() - started };
    }
  }

  async sendOtp(to: string, otp: string): Promise<boolean> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
    const fromEmail = this.configService.get<string>('SMTP_USER');
    const started = Date.now();
    this.logger.log(`[smtp] sendOtp start: to=${to}`);

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: 'StitchUp - Your Login Verification Code',
        html: `
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
      });
      this.logger.log(
        `[smtp] OTP email sent to ${to} in ${Date.now() - started}ms (messageId=${info.messageId}, response=${info.response})`,
      );
      return true;
    } catch (error) {
      this.transporter = null;
      this.logger.error(
        `[smtp] sendOtp FAILED for ${to} after ${Date.now() - started}ms: ${this.describeError(error)}`,
      );
      return false;
    }
  }

  async sendGeneric(to: string, subject: string, html: string): Promise<boolean> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
    const fromEmail = this.configService.get<string>('SMTP_USER');
    const started = Date.now();
    this.logger.log(`[smtp] sendGeneric start: to=${to} subject=${subject}`);

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(
        `[smtp] email sent to ${to} in ${Date.now() - started}ms (messageId=${info.messageId})`,
      );
      return true;
    } catch (error) {
      this.transporter = null;
      this.logger.error(
        `[smtp] sendGeneric FAILED for ${to} after ${Date.now() - started}ms: ${this.describeError(error)}`,
      );
      return false;
    }
  }
}
