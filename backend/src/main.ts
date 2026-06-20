import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  app.enableCors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: corsOrigin !== '*',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StitchUp API')
    .setDescription('Consumer-to-Tailor Stitching Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Debug', 'Debug & Testing Utilities')
    .addTag('Auth', 'Authentication & Registration')
    .addTag('Users', 'User Profile Management')
    .addTag('Templates', 'Template & Clothing Types')
    .addTag('Pricing', 'Pricing Calculations & Config')
    .addTag('Orders', 'Order Management')
    .addTag('Reviews', 'Ratings & Reviews')
    .addTag('Appointments', 'Appointment Scheduling')
    .addTag('Notifications', 'User Notifications')
    .addTag('Support', 'Support Tickets')
    .addTag('Shipping', 'Shiprocket Shipping & Delivery')
    .addTag('Webhooks', 'External Webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Health check — outside global prefix so Render/load balancers can reach it
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 StitchUp API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap();
