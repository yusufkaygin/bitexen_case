import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const { SERVER_PORT, SERVER_DOMAIN, AMQP_SERVER } = process.env;

async function main() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [AMQP_SERVER],
      queue: 'wallet_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  // ------------------------------------------------------------------------

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: `http://${SERVER_DOMAIN}:${SERVER_PORT}`,
    credentials: true,
  });
  app.use(cookieParser());

  // -------------------------------- swagger --------------------------------

  const config = new DocumentBuilder()
    .setTitle('Bitexen Case')
    .setDescription(
      'This document is the map of the study provided by Bitexen.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('my-api', app, document);

  // --------------------------------------------------------------------------

  await app.listen(SERVER_PORT || 3000);
}

main();
