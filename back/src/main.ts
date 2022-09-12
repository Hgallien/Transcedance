import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SocketAdapter } from './socket.adapter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000, '0.0.0.0');
}
bootstrap();
