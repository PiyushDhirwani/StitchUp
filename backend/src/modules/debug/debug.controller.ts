import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EmailService } from '../../common/services/email.service';

class TestEmailDto {
  @ApiProperty({ example: 'you@example.com' })
  @IsEmail()
  to: string;
}

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
}
