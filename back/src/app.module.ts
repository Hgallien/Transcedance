import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmFactory } from './orm.config';
import { UserModule } from './user/user.module';
import { GameManagerService } from './pong/game-manager.service';
import { ConfigModule } from '@nestjs/config';
import { LoginModule } from './login/login.module';
import { AppGateway } from './app.gateway';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), '..', 'front', '.env'),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmFactory,
      inject: [ConfigService],
    }),
    UserModule,
    LoginModule,
  ],
  controllers: [],
  providers: [GameManagerService, AppGateway],
})
export class AppModule {}
