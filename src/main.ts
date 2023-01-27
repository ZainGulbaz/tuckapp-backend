import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function main() {
  const app = await NestFactory.create(AppModule, { logger: ["error","warn","log"] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX);
  await app.listen(3000);
}
main();
