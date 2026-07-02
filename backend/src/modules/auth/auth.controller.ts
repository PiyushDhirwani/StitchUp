import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterConsumerDto } from './dto/register-consumer.dto';
import { RegisterTailorDto } from './dto/register-tailor.dto';
import { RequestOtpDto, VerifyOtpDto, LoginPasswordDto } from './dto/login.dto';

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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile_picture', maxCount: 1 },
        { name: 'documents', maxCount: 5 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Register a new tailor — profile picture and at least one KYC document are mandatory. Account stays in pending KYC until admin approval (24-48h).',
  })
  @ApiResponse({ status: 201, description: 'Tailor registered, KYC pending' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async registerTailor(
    @Body() dto: RegisterTailorDto,
    @UploadedFiles()
    files?: {
      profile_picture?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.authService.registerTailor(dto, files);
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

  @Post('login/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async loginWithPassword(@Body() dto: LoginPasswordDto) {
    return this.authService.loginWithPassword(dto.email, dto.password);
  }
}
