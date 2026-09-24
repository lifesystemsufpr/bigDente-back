import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import { AppController } from '../src/app.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => app.close());

  it('/api/health (GET)', () => {
    const httpServer = app.getHttpServer() as Server;

    return request(httpServer).get('/api/health').expect(200, {
      status: 'ok',
    });
  });
});
