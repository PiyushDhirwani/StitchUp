import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateConsumerProfileDto } from './dto/update-consumer-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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

  @Post('me/profile-picture')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload/replace own profile picture' })
  @ApiResponse({ status: 201, description: 'Profile picture updated' })
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.updateProfilePicture(currentUser.id, file);
  }

  @Post('tailor/documents')
  @UseGuards(RolesGuard)
  @Roles('tailor')
  @UseInterceptors(FilesInterceptor('documents', 5, { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Submit additional KYC documents (tailor). Re-submitting after rejection moves KYC back to pending.',
  })
  @ApiResponse({ status: 201, description: 'Documents submitted for review' })
  async uploadTailorDocuments(
    @UploadedFiles() documents: Express.Multer.File[],
    @Body('document_types') documentTypes: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.submitTailorDocuments(currentUser.id, documents, documentTypes);
  }

  @Get('tailor/documents')
  @UseGuards(RolesGuard)
  @Roles('tailor')
  @ApiOperation({ summary: 'List own KYC documents and their review status' })
  async listTailorDocuments(@CurrentUser() currentUser: any) {
    return this.usersService.listTailorDocuments(currentUser.id);
  }
}
