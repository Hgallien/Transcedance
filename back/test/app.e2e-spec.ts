import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /user', () => {
    const result: request.Test = request(app.getHttpServer())
      .get('/user')
      .expect(200)
      .expect([]);

    // I don't know why yet but it is REQUIRED to return
    return result;
  });

  it('GET / should yield 404', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });
});
