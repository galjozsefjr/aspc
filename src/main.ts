import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger/setup-swagger';
import { ConfigService } from '@nestjs/config';
import { Configuration } from './app.configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService<Configuration> = app.get(ConfigService);

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      enableDebugMessages: true,
    }),
  );
  app.enableShutdownHooks();

  process.on('uncaughtException', (error, source) => {
    logger.error({
      message: `Uncaught exception: ${error?.message}`,
      stack: error?.stack,
      source,
    });
  });

  setupSwagger(app, 'api-doc');

  try {
    const apiPort = config.get<string>('API_PORT') ?? 3000;
    const apiHost = config.get<string>('API_HOST') ?? '0.0.0.0';
    await app.listen(apiPort, apiHost, () => {
      logger.debug(
        `Application started in ${process.env.NODE_ENV} environment`,
      );
      logger.debug(`Service layer is listening on`);
    });
  } catch (err) {
    logger.error(err);
  }
}

void (async () => {
  await bootstrap();
})();
