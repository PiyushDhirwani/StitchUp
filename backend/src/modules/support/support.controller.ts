import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Support')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @UseInterceptors(FileInterceptor('attachment', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new support / grievance ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  async createTicket(
    @Body() dto: CreateTicketDto,
    @CurrentUser() currentUser: any,
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    return this.supportService.createTicket(dto, currentUser, attachment);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get my support tickets' })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  async getMyTickets(
    @CurrentUser() currentUser: any,
    @Query('status') status?: string,
  ) {
    return this.supportService.getMyTickets(currentUser.id, status);
  }

  @Get('tickets/:ticketId')
  @ApiOperation({ summary: 'Get ticket details' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketDetails(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.supportService.getTicketDetails(ticketId, currentUser.id);
  }

  @Patch('tickets/:ticketId/resolve')
  @ApiOperation({ summary: 'Mark own ticket as resolved' })
  @ApiResponse({ status: 200, description: 'Ticket resolved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async resolveTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @CurrentUser() currentUser: any,
    @Body() body: { resolution_notes?: string },
  ) {
    return this.supportService.resolveTicket(ticketId, currentUser.id, body.resolution_notes);
  }
}
