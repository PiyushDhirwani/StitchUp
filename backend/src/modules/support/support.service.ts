import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../../entities/support-ticket.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { EmailService } from '../../common/services/email.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepo: Repository<SupportTicket>,
    private cloudinaryService: CloudinaryService,
    private emailService: EmailService,
  ) {}

  async createTicket(
    dto: CreateTicketDto,
    currentUser: any,
    attachment?: Express.Multer.File,
  ) {
    let attachmentUrls: string[] = [];

    if (attachment) {
      const uploaded = await this.cloudinaryService.uploadImage(
        attachment,
        'stitchup/support-attachments',
      );
      attachmentUrls = [uploaded.url];
    }

    const ticket = this.ticketRepo.create({
      order_id: dto.order_id || undefined,
      raised_by: currentUser.id,
      raised_by_type: currentUser.role === 'tailor' ? 'tailor' : 'consumer',
      ticket_type: dto.ticket_type,
      subject: dto.subject,
      description: dto.description,
      attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      priority: dto.priority || 'medium',
      ticket_status: 'open',
    });

    const saved = await this.ticketRepo.save(ticket);

    // Send confirmation email in background (non-blocking)
    this.sendTicketConfirmationEmail(dto.email, saved).catch((err) =>
      this.logger.warn(`Failed to send ticket confirmation email: ${err.message}`),
    );

    return {
      message: 'Support ticket created successfully',
      data: {
        ticket_id: saved.id,
        ticket_type: saved.ticket_type,
        subject: saved.subject,
        priority: saved.priority,
        ticket_status: saved.ticket_status,
        attachments: saved.attachments,
        created_at: saved.created_at,
      },
    };
  }

  async getMyTickets(userId: number, status?: string) {
    const where: any = { raised_by: userId };
    if (status) where.ticket_status = status;

    const tickets = await this.ticketRepo.find({
      where,
      order: { created_at: 'DESC' },
    });

    return {
      data: tickets.map((t) => ({
        id: t.id,
        ticket_type: t.ticket_type,
        subject: t.subject,
        priority: t.priority,
        ticket_status: t.ticket_status,
        order_id: t.order_id,
        created_at: t.created_at,
        updated_at: t.updated_at,
        resolved_at: t.resolved_at,
      })),
      total: tickets.length,
    };
  }

  async getTicketDetails(ticketId: number, userId: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, raised_by: userId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return { data: ticket };
  }

  async resolveTicket(ticketId: number, userId: number, resolutionNotes?: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, raised_by: userId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    ticket.ticket_status = 'resolved';
    ticket.resolved_at = new Date();
    if (resolutionNotes) ticket.resolution_notes = resolutionNotes;
    ticket.resolution_type = 'self_resolved';
    await this.ticketRepo.save(ticket);
    return { message: 'Ticket marked as resolved', data: { id: ticket.id, ticket_status: 'resolved', resolved_at: ticket.resolved_at } };
  }

  private async sendTicketConfirmationEmail(
    email: string,
    ticket: SupportTicket,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0d9488; margin-bottom: 8px;">StitchUp Support</h2>
        <p style="color: #374151; font-size: 16px;">Your support ticket has been received.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Ticket ID:</strong> #${ticket.id}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Subject:</strong> ${ticket.subject}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Type:</strong> ${ticket.ticket_type.replace(/_/g, ' ')}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Priority:</strong> ${ticket.priority}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">We'll review your concern and get back to you shortly.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">This is an automated email from StitchUp. Please do not reply directly.</p>
      </div>
    `;
    await this.emailService.sendGeneric(
      email,
      `StitchUp Support — Ticket #${ticket.id} Received`,
      html,
    );
  }
}
