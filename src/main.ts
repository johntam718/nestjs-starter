import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api")
  const PORT = 3333;
  await app.listen(PORT);
  console.log(`listening to port ${PORT}`)
}
bootstrap();
