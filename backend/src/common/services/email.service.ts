import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { promises as dns } from 'dns';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {}

  // Render free tier has no IPv6 outbound and smtp.gmail.com resolves to IPv6
  // first, so we resolve the IPv4 address ourselves and pin TLS to the hostname.
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);

    let connectHost = host;
    try {
      const [ipv4] = await dns.resolve4(host);
      if (ipv4) connectHost = ipv4;
    } catch (err) {
      this.logger.warn(`IPv4 resolution failed for ${host}, using hostname: ${err.message}`);
    }

    this.transporter = nodemailer.createTransport({
      host: connectHost,
      port,
      secure: port === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: { servername: host },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    return this.transporter;
  }

  async sendOtp(to: string, otp: string): Promise<boolean> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
    const fromEmail = this.configService.get<string>('SMTP_USER');

    try {
      const transporter = await this.getTransporter();
      await transporter.sendMail({
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
      this.logger.log(`OTP email sent to ${to}`);
      return true;
    } catch (error) {
      this.transporter = null;
      this.logger.error(`Failed to send OTP email to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendGeneric(to: string, subject: string, html: string): Promise<boolean> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
    const fromEmail = this.configService.get<string>('SMTP_USER');

    try {
      const transporter = await this.getTransporter();
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.transporter = null;
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }
}
