import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { UserTailor } from '../../entities/user-tailor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserConsumer, UserTailor])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
