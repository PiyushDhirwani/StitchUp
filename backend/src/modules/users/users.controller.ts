import { Controller, Get, Put, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateConsumerProfileDto } from './dto/update-consumer-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('details/:userId')
  @ApiOperation({ summary: 'Get user profile details' })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.getUserDetails(userId, currentUser);
  }

  @Put('details/:userId')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateConsumerProfileDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.updateUserProfile(userId, dto, currentUser);
  }
}
