import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from '../../entities/support-ticket.entity';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket])],
  controllers: [SupportController],
  providers: [SupportService, CloudinaryService, EmailService],
  exports: [SupportService],
})
export class SupportModule {}
