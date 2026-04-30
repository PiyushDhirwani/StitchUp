import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadAudio(
    file: Express.Multer.File,
  ): Promise<{ url: string; public_id: string }> {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only audio files (webm, mp4, ogg, mp3, wav) are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Audio file must be under 10MB');
    }

    try {
      const result = await this.uploadToCloudinary(file.buffer);
      this.logger.log(`Audio uploaded: ${result.public_id}`);
      return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      this.logger.error(`Audio upload failed: ${error.message}`);
      throw new BadRequestException('Audio upload failed');
    }
  }

  private uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'stitchup/audio',
          resource_type: 'video', // Cloudinary treats audio as "video" resource type
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
