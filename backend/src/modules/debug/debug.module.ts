import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { EmailService } from '../../common/services/email.service';

@Module({
  controllers: [DebugController],
  providers: [EmailService],
})
export class DebugModule {}
