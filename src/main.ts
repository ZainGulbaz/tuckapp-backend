import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { join } from 'path';

console.log(process.env.GLOBAL_PREFIX);

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useStaticAssets(join(__dirname, '..', 'client/uploads/driver/lisence'));
  app.useStaticAssets(join(__dirname, '..', 'client/uploads/driver/truck'));
  app.useStaticAssets(join(__dirname, '..', 'client/uploads/customer'));

  app.useGlobalPipes(new ValidationPipe({ whitelist: false }));
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX);
  app.enableCors();
  await app.listen(3000);
}

main();
