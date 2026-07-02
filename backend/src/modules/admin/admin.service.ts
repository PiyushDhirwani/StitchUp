import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTailor } from '../../entities/user-tailor.entity';
import { TailorVerification } from '../../entities/tailor-verification.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserTailor) private tailorRepo: Repository<UserTailor>,
    @InjectRepository(TailorVerification) private verificationRepo: Repository<TailorVerification>,
    private cloudinaryService: CloudinaryService,
    private emailService: EmailService,
  ) {}

  async listTailorsByKycStatus(status = 'pending') {
    const tailors = await this.tailorRepo.find({
      where: { verification_status: status },
      relations: ['user', 'verifications'],
      order: { created_at: 'ASC' },
    });

    return {
      data: tailors.map((t) => ({
        tailor_id: t.id,
        user_id: t.user_id,
        name: `${t.user?.first_name || ''} ${t.user?.last_name || ''}`.trim(),
        email: t.user?.email,
        phone_number: t.user?.phone_number,
        profile_picture_url: t.user?.profile_picture_url,
        shop_name: t.shop_name,
        city: t.city,
        state: t.state,
        aadhar_number: t.aadhar_number,
        years_of_experience: t.years_of_experience,
        kyc_status: t.verification_status,
        registered_at: t.created_at,
        documents: (t.verifications || []).map((v) => ({
          id: v.id,
          type: v.verification_type,
          status: v.status,
          submitted_at: v.submitted_at,
          // 30-min expiring signed URL for private KYC docs
          url: this.cloudinaryService.getExpiringUrl(v.document_url, 1800),
        })),
      })),
      total: tailors.length,
    };
  }

  async reviewTailorKyc(
    tailorId: number,
    action: 'approve' | 'reject',
    adminUserId: number,
    reason?: string,
  ) {
    const tailor = await this.tailorRepo.findOne({
      where: { id: tailorId },
      relations: ['user', 'verifications'],
    });
    if (!tailor) throw new NotFoundException('Tailor not found');

    if (tailor.verification_status === 'approved' && action === 'approve') {
      throw new BadRequestException('Tailor KYC is already approved');
    }
    if (action === 'reject' && !reason) {
      throw new BadRequestException('A reason is required when rejecting KYC');
    }

    const approved = action === 'approve';
    tailor.verification_status = approved ? 'approved' : 'rejected';
    tailor.is_verified = approved;
    await this.tailorRepo.save(tailor);

    const now = new Date();
    for (const doc of tailor.verifications || []) {
      if (doc.status !== 'pending') continue;
      doc.status = approved ? 'verified' : 'rejected';
      doc.verified_at = now;
      doc.verified_by = adminUserId;
      if (!approved) doc.rejection_reason = reason ?? '';
      await this.verificationRepo.save(doc);
    }

    if (tailor.user?.email) {
      const subject = approved
        ? 'StitchUp — Your KYC is approved!'
        : 'StitchUp — Your KYC needs attention';
      const html = approved
        ? `<p>Congratulations! Your tailor account has been verified. You can now accept orders on StitchUp.</p>`
        : `<p>Your KYC verification was not approved.</p><p><strong>Reason:</strong> ${reason}</p><p>Please log in and re-submit valid documents.</p>`;
      this.emailService
        .sendGeneric(tailor.user.email, subject, html)
        .catch((err) => this.logger.warn(`KYC email failed: ${err.message}`));
    }

    return {
      message: `Tailor KYC ${approved ? 'approved' : 'rejected'}`,
      data: {
        tailor_id: tailor.id,
        kyc_status: tailor.verification_status,
        reviewed_at: now,
      },
    };
  }
}
