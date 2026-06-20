import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const logger = new Logger('RedisClient');

export const createRedisClient = (configService: ConfigService): Redis => {
  const url = configService.get<string>('REDIS_URL');

  const client = url
    ? new Redis(url)
    : new Redis({
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD', '') || undefined,
      });

  client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  client.on('connect', () => logger.log('Redis connected'));

  return client;
};

export const REDIS_CLIENT = 'REDIS_CLIENT';
