import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { UserTailor } from '../../entities/user-tailor.entity';
import { REDIS_CLIENT, createRedisClient } from '../../config/redis.config';
import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, UserConsumer, UserTailor]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY', '24h') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => createRedisClient(configService),
      inject: [ConfigService],
    },
  ],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
