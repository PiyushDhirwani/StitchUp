import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'stitchup',
  ): Promise<{ url: string; public_id: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and SVG images are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image must be under 5MB');
    }

    try {
      const result = await this.uploadToCloudinary(file.buffer, folder);
      this.logger.log(`Image uploaded: ${result.public_id}`);
      return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new BadRequestException('Image upload failed');
    }
  }

  /**
   * Uploads as a Cloudinary `private` asset: the plain delivery URL stops
   * working and access requires a time-limited signed URL (S3 presigned
   * equivalent). Returns a storage ref (`public_id.format`) — store that in
   * the DB instead of a URL.
   */
  async uploadPrivateImage(
    file: Express.Multer.File,
    folder: string = 'stitchup/private',
  ): Promise<{ ref: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and SVG images are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image must be under 5MB');
    }

    try {
      const result = await this.uploadToCloudinary(file.buffer, folder, 'private');
      this.logger.log(`Private image uploaded: ${result.public_id}`);
      return { ref: `${result.public_id}.${result.format}` };
    } catch (error) {
      this.logger.error(`Private upload failed: ${error.message}`);
      throw new BadRequestException('Image upload failed');
    }
  }

  /**
   * Builds a time-limited download URL for a private asset ref.
   * Legacy values that are already full URLs are returned unchanged.
   */
  getExpiringUrl(ref: string, expiresInSeconds = 900): string {
    if (!ref || ref.startsWith('http')) return ref;

    const lastDot = ref.lastIndexOf('.');
    const publicId = lastDot > 0 ? ref.slice(0, lastDot) : ref;
    const format = lastDot > 0 ? ref.slice(lastDot + 1) : 'jpg';

    return cloudinary.utils.private_download_url(publicId, format, {
      resource_type: 'image',
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}`);
    } catch (error) {
      this.logger.error(`Delete failed for ${publicId}: ${error.message}`);
    }
  }

  private uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    type: 'upload' | 'private' = 'upload',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          type,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
