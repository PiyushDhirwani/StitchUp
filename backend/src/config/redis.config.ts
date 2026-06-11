import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const createRedisClient = (configService: ConfigService): Redis => {
  const url = configService.get<string>('REDIS_URL');
  if (url) {
    return new Redis(url, { tls: url.startsWith('rediss://') ? {} : undefined } as any);
  }
  return new Redis({
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
    password: configService.get<string>('REDIS_PASSWORD', '') || undefined,
  });
};

export const REDIS_CLIENT = 'REDIS_CLIENT';
