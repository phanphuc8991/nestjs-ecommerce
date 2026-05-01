import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './core/all-exceptions.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 1. Prefix
  app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'), { exclude: [''] });
  
  // 2. Register Global Filter 
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. Register Global Pipe
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true,
    }),
  );

  // Config CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/${configService.get('GLOBAL_PREFIX')}`);
}
bootstrap();