import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication, path = '/') => {
  const config = new DocumentBuilder()
    .setTitle('Advanced Stock Price Checker')
    .build();
  const api = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, api);
};
