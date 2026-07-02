import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserTailor } from '../../entities/user-tailor.entity';
import { TailorVerification } from '../../entities/tailor-verification.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { EmailService } from '../../common/services/email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserTailor, TailorVerification]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService, CloudinaryService, EmailService],
})
export class AdminModule {}
