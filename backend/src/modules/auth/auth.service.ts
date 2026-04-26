import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { UserTailor } from '../../entities/user-tailor.entity';
import { REDIS_CLIENT } from '../../config/redis.config';
import { ErrorCodes } from '../../common/constants/error-codes';
import { EmailService } from '../../common/services/email.service';
import { RegisterConsumerDto } from './dto/register-consumer.dto';
import { RegisterTailorDto } from './dto/register-tailor.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRole) private roleRepo: Repository<UserRole>,
    @InjectRepository(UserConsumer) private consumerRepo: Repository<UserConsumer>,
    @InjectRepository(UserTailor) private tailorRepo: Repository<UserTailor>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REDIS_CLIENT) private redis: Redis,
    private emailService: EmailService,
  ) {}

  async registerConsumer(dto: RegisterConsumerDto) {
    await this.checkDuplicates(dto.email, dto.phone_number);

    const role = await this.roleRepo.findOne({ where: { role_name: 'consumer' } });
    if (!role) throw new NotFoundException('Consumer role not found');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Cache registration data in Redis — no DB write yet
    const otp = this.generateOtp();
    const sessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS', 300);

    const sessionData = JSON.stringify({
      type: 'register_consumer',
      otp,
      email: dto.email,
      attempts: 0,
      created_at: new Date().toISOString(),
      registration: {
        user: {
          email: dto.email,
          phone_number: dto.phone_number,
          password_hash: passwordHash,
          first_name: dto.first_name,
          last_name: dto.last_name,
          role_id: role.id,
        },
        consumer: {
          address_line1: dto.address_line1,
          address_line2: dto.address_line2,
          city: dto.city,
          state: dto.state,
          postal_code: dto.postal_code,
          country: dto.country || 'India',
          bio: dto.bio,
          latitude: dto.latitude,
          longitude: dto.longitude,
          preferred_radius_km: dto.preferred_radius_km || 10,
        },
      },
    });
    await this.redis.setex(`otp:${sessionId}`, otpExpiry, sessionData);

    // Send OTP email
    const sent = await this.emailService.sendOtp(dto.email, otp);
    if (!sent) {
      this.logger.warn(`Email send failed for ${dto.email}, logging OTP to console`);
      this.logger.log(`[FALLBACK] OTP for ${dto.email}: ${otp}`);
    }

    return {
      message: 'Verification code sent to your email. Please verify to complete registration.',
      data: {
        email: dto.email,
        role: 'consumer',
        otp_expiry_seconds: otpExpiry,
        session_id: sessionId,
      },
    };
  }

  async registerTailor(dto: RegisterTailorDto) {
    await this.checkDuplicates(dto.email, dto.phone_number);

    const role = await this.roleRepo.findOne({ where: { role_name: 'tailor' } });
    if (!role) throw new NotFoundException('Tailor role not found');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Cache registration data in Redis — no DB write yet
    const otp = this.generateOtp();
    const sessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS', 300);

    const sessionData = JSON.stringify({
      type: 'register_tailor',
      otp,
      email: dto.email,
      attempts: 0,
      created_at: new Date().toISOString(),
      registration: {
        user: {
          email: dto.email,
          phone_number: dto.phone_number,
          password_hash: passwordHash,
          first_name: dto.first_name,
          last_name: dto.last_name,
          role_id: role.id,
        },
        tailor: {
          shop_name: dto.shop_name,
          shop_address_line1: dto.shop_address_line1,
          shop_address_line2: dto.shop_address_line2,
          city: dto.city,
          state: dto.state,
          postal_code: dto.postal_code,
          country: dto.country || 'India',
          latitude: dto.latitude,
          longitude: dto.longitude,
          business_type: dto.business_type,
          years_of_experience: dto.years_of_experience,
          bio: dto.bio,
          shop_registration_number: dto.shop_registration_number,
        },
      },
    });
    await this.redis.setex(`otp:${sessionId}`, otpExpiry, sessionData);

    // Send OTP email
    const sent = await this.emailService.sendOtp(dto.email, otp);
    if (!sent) {
      this.logger.warn(`Email send failed for ${dto.email}, logging OTP to console`);
      this.logger.log(`[FALLBACK] OTP for ${dto.email}: ${otp}`);
    }

    return {
      message: 'Verification code sent to your email. Please verify to complete registration.',
      data: {
        email: dto.email,
        role: 'tailor',
        otp_expiry_seconds: otpExpiry,
        session_id: sessionId,
      },
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, is_active: true },
    });
    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCodes.USER_NOT_FOUND,
        message: 'No account found with this email',
      });
    }

    const otpResult = await this.sendOtpEmail(user);

    return {
      message: 'Verification code sent to your email',
      data: {
        email: dto.email,
        otp_expiry_seconds: otpResult.otp_expiry_seconds,
        session_id: otpResult.session_id,
      },
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRaw = await this.redis.get(`otp:${dto.session_id}`);
    if (!otpRaw) {
      throw new UnauthorizedException({
        error_code: ErrorCodes.SESSION_EXPIRED,
        message: 'OTP session expired. Please request a new OTP.',
      });
    }

    const otpData = JSON.parse(otpRaw);
    const maxAttempts = this.configService.get<number>('MAX_OTP_ATTEMPTS', 5);

    if (otpData.attempts >= maxAttempts) {
      await this.redis.del(`otp:${dto.session_id}`);
      throw new UnauthorizedException({
        error_code: ErrorCodes.MAX_ATTEMPTS_EXCEEDED,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
      });
    }

    if (otpData.otp !== dto.otp || otpData.email !== dto.email) {
      otpData.attempts += 1;
      await this.redis.setex(
        `otp:${dto.session_id}`,
        await this.redis.ttl(`otp:${dto.session_id}`),
        JSON.stringify(otpData),
      );
      throw new UnauthorizedException({
        error_code: ErrorCodes.INVALID_OTP,
        message: `Invalid OTP. ${maxAttempts - otpData.attempts} attempts remaining.`,
      });
    }

    await this.redis.del(`otp:${dto.session_id}`);

    // Registration flow — persist to DB now
    if (otpData.type === 'register_consumer') {
      return this.completeConsumerRegistration(otpData.registration);
    }
    if (otpData.type === 'register_tailor') {
      return this.completeTailorRegistration(otpData.registration);
    }

    // Login flow — user already exists in DB
    const user = await this.userRepo.findOne({
      where: { id: otpData.user_id },
      relations: ['role', 'consumer_profile', 'tailor_profile'],
    });
    if (!user) throw new NotFoundException('User not found');

    user.last_login = new Date();
    user.is_verified = true;
    await this.userRepo.save(user);

    const roleName = user.role.role_name;
    const authToken = this.generateToken(user, roleName);
    const refreshToken = this.generateRefreshToken(user, roleName);

    return {
      message: 'Login successful',
      data: {
        user_id: user.id,
        email: user.email,
        phone_number: user.phone_number,
        first_name: user.first_name,
        role: roleName,
        consumer_id: user.consumer_profile?.id,
        tailor_id: user.tailor_profile?.id,
        last_login: user.last_login,
        auth_token: authToken,
        token_expiry_seconds: 86400,
        refresh_token: refreshToken,
      },
    };
  }

  private async completeConsumerRegistration(reg: any) {
    const user = Object.assign(new User(), reg.user, { is_verified: true });
    const savedUser = await this.userRepo.save(user);

    const consumer = Object.assign(new UserConsumer(), reg.consumer, { user_id: savedUser.id });
    const savedConsumer = await this.consumerRepo.save(consumer);

    const authToken = this.generateToken(savedUser, 'consumer');
    const refreshToken = this.generateRefreshToken(savedUser, 'consumer');

    return {
      message: 'Email verified. Consumer registered successfully.',
      data: {
        user_id: savedUser.id,
        consumer_id: savedConsumer.id,
        email: savedUser.email,
        phone_number: savedUser.phone_number,
        role: 'consumer',
        created_at: savedUser.created_at,
        auth_token: authToken,
        token_expiry_seconds: 86400,
        refresh_token: refreshToken,
      },
    };
  }

  private async completeTailorRegistration(reg: any) {
    const user = Object.assign(new User(), reg.user, { is_verified: true });
    const savedUser = await this.userRepo.save(user);

    const tailor = Object.assign(new UserTailor(), reg.tailor, { user_id: savedUser.id });
    const savedTailor = await this.tailorRepo.save(tailor);

    const authToken = this.generateToken(savedUser, 'tailor');
    const refreshToken = this.generateRefreshToken(savedUser, 'tailor');

    return {
      message: 'Email verified. Tailor registered successfully.',
      data: {
        user_id: savedUser.id,
        tailor_id: savedTailor.id,
        email: savedUser.email,
        phone_number: savedUser.phone_number,
        role: 'tailor',
        shop_name: savedTailor.shop_name,
        created_at: savedUser.created_at,
        auth_token: authToken,
        token_expiry_seconds: 86400,
        refresh_token: refreshToken,
      },
    };
  }

  private async checkDuplicates(email: string, phone: string) {
    const existingEmail = await this.userRepo.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException({
        error_code: ErrorCodes.EMAIL_EXISTS,
        message: 'Email already registered',
      });
    }
    const existingPhone = await this.userRepo.findOne({ where: { phone_number: phone } });
    if (existingPhone) {
      throw new ConflictException({
        error_code: ErrorCodes.PHONE_EXISTS,
        message: 'Phone number already registered',
      });
    }
  }

  private generateToken(user: User, role: string): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRY', '24h') as any,
      },
    );
  }

  private generateRefreshToken(user: User, role: string): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '30d') as any,
      },
    );
  }

  private async sendOtpEmail(user: User): Promise<{ otp_expiry_seconds: number; session_id: string }> {
    const otp = this.generateOtp();
    const sessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS', 300);

    const otpData = JSON.stringify({
      otp,
      email: user.email,
      user_id: user.id,
      attempts: 0,
      created_at: new Date().toISOString(),
    });
    await this.redis.setex(`otp:${sessionId}`, otpExpiry, otpData);

    const sent = await this.emailService.sendOtp(user.email, otp);
    if (!sent) {
      this.logger.warn(`Email send failed for ${user.email}, logging OTP to console`);
      this.logger.log(`[FALLBACK] OTP for ${user.email}: ${otp}`);
    }

    return { otp_expiry_seconds: otpExpiry, session_id: sessionId };
  }

  private generateOtp(): string {
    const length = this.configService.get<number>('OTP_LENGTH', 6);
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
  }
}
