import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DtoValidationPipe } from './common/dto-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new DtoValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
