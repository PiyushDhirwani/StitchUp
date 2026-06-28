import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE', 'postgres');
  const entities = [__dirname + '/../entities/**/*.entity{.ts,.js}'];
  const synchronize = configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';
  const logging = configService.get<string>('DB_LOGGING', 'false') === 'true';

  if (dbType === 'mysql') {
    return {
      type: 'mysql',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 3306),
      username: configService.get<string>('DB_USERNAME', 'root'),
      password: configService.get<string>('DB_PASSWORD', ''),
      database: configService.get<string>('DB_NAME', 'stitchup_db'),
      entities,
      synchronize,
      logging,
      charset: 'utf8mb4',
      extra: { charset: 'utf8mb4_unicode_ci' },
    };
  }

  const url = configService.get<string>('DATABASE_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  if (url) {
    return {
      type: 'postgres',
      url,
      entities,
      synchronize,
      logging,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      extra: { max: 2, connectionTimeoutMillis: 10000 },
    };
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_NAME', 'postgres'),
    entities,
    synchronize,
    logging,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    extra: { max: 2, connectionTimeoutMillis: 10000 },
  };
};
