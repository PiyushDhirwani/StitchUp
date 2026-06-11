import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const url = configService.get<string>('DATABASE_URL');
  const base: TypeOrmModuleOptions = {
    type: 'postgres',
    entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
    logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
    ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  };

  if (url) {
    return {
      ...base,
      url,
      extra: {
        max: 1,
      },
    };
  }

  return {
    ...base,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_NAME', 'postgres'),
  };
};
