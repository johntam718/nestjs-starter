import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true // extra body will be ignored
  }));
  app.setGlobalPrefix("api")
  const PORT = 3333;
  await app.listen(PORT);
  console.log(`listening to port ${PORT}`)
}
bootstrap();
