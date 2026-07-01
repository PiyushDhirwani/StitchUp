import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import * as net from 'net';
import { promises as dns } from 'dns';
import { EmailService } from '../../common/services/email.service';

class TestEmailDto {
  @ApiProperty({ example: 'you@example.com' })
  @IsEmail()
  to: string;
}

const tcpProbe = (host: string, port: number, timeoutMs = 5000): Promise<string> =>
  new Promise((resolve) => {
    const socket = net.connect({ host, port, family: 4 });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve('timeout');
    }, timeoutMs);
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve('open');
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      resolve(`error: ${err.message}`);
    });
  });

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test-email')
  @ApiOperation({ summary: 'Send a test OTP email to verify SMTP config' })
  async testEmail(@Body() dto: TestEmailDto) {
    const sent = await this.emailService.sendOtp(dto.to, '123456');
    return {
      success: sent,
      message: sent ? 'Email sent successfully' : 'Email failed — check server logs for error',
    };
  }

  @Get('smtp-verify')
  @ApiOperation({ summary: 'Test SMTP connection + auth without sending (DNS -> TCP -> TLS -> AUTH)' })
  async smtpVerify() {
    return this.emailService.verifyConnection();
  }

  @Get('net-test')
  @ApiOperation({ summary: 'Probe outbound connectivity to SMTP ports (diagnose host blocking)' })
  async netTest() {
    const host = 'smtp.gmail.com';
    let ipv4 = 'unresolved';
    try {
      [ipv4] = await dns.resolve4(host);
    } catch (err) {
      ipv4 = `resolve failed: ${err.message}`;
    }

    const [p465, p587, p443] = await Promise.all([
      tcpProbe(host, 465),
      tcpProbe(host, 587),
      tcpProbe('www.google.com', 443),
    ]);

    return {
      resolved_ipv4: ipv4,
      'smtp.gmail.com:465': p465,
      'smtp.gmail.com:587': p587,
      'www.google.com:443 (control)': p443,
    };
  }
}
