import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.fromName = this.configService.get<string>('SMTP_FROM_NAME', 'StitchUp');
    this.fromEmail = this.configService.get<string>('SMTP_USER', 'onboarding@resend.dev');
  }

  async sendOtp(to: string, otp: string): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
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
      this.logger.error(`Failed to send OTP email to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendGeneric(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }
}
