import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DtoValidationPipe } from './common/dto-validation.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { createServer } from 'http';

const isEnabled = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

async function bootstrap() {
  const httpsEnabled = isEnabled(process.env.HTTPS_ENABLED, true);
  const forceHttps = isEnabled(process.env.FORCE_HTTPS, true);
  const httpsPort = Number(process.env.HTTPS_PORT ?? process.env.PORT ?? 3443);
  const httpPort = Number(process.env.HTTP_PORT ?? 3000);
  const keyPath = process.env.SSL_KEY_PATH ?? join(process.cwd(), 'certs', 'localhost-key.pem');
  const certPath = process.env.SSL_CERT_PATH ?? join(process.cwd(), 'certs', 'localhost-cert.pem');
  const httpsOptions = httpsEnabled
    ? {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      }
    : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  app.set('trust proxy', 1);
  app.useGlobalPipes(new DtoValidationPipe());
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');

  if (forceHttps && !httpsEnabled) {
    app.use((request, response, next) => {
      if (request.secure || request.headers['x-forwarded-proto'] === 'https') {
        return next();
      }

      const host = request.headers.host ?? 'localhost';
      return response.redirect(308, `https://${host}${request.originalUrl}`);
    });
  }

  if (httpsEnabled) {
    app.use((_request, response, next) => {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    });
  }

  await app.listen(httpsPort);

  if (httpsEnabled && forceHttps && httpPort !== httpsPort) {
    createServer((request, response) => {
      const hostname = (request.headers.host ?? 'localhost').replace(/:\d+$/, '');
      const port = httpsPort === 443 ? '' : `:${httpsPort}`;
      response.writeHead(308, {
        Location: `https://${hostname}${port}${request.url ?? '/'}`,
        'Cache-Control': 'no-store',
      });
      response.end();
    }).listen(httpPort);
  }
}
bootstrap();
