import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterConsumerDto } from './dto/register-consumer.dto';
import { RegisterTailorDto } from './dto/register-tailor.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('consumer/register')
  @ApiOperation({ summary: 'Register a new consumer' })
  @ApiResponse({ status: 201, description: 'Consumer registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async registerConsumer(@Body() dto: RegisterConsumerDto) {
    return this.authService.registerConsumer(dto);
  }

  @Post('tailor/register')
  @ApiOperation({ summary: 'Register a new tailor' })
  @ApiResponse({ status: 201, description: 'Tailor registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async registerTailor(@Body() dto: RegisterTailorDto) {
    return this.authService.registerTailor(dto);
  }

  @Post('login/request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for login' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'Phone number not registered' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('login/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid OTP or session expired' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}
