import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { UserTailor } from '../../entities/user-tailor.entity';
import { TailorVerification } from '../../entities/tailor-verification.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserConsumer, UserTailor, TailorVerification])],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryService],
  exports: [UsersService],
})
export class UsersModule {}
