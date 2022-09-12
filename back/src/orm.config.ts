import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Match } from './matchHistory/match.entity';
import { Channel } from './channelManager/channel.entity';
import { ConfigService } from '@nestjs/config';

export function typeOrmFactory(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    username: config.get('POSTGRES_USER'),
    password: config.get('POSTGRES_PASSWORD'),
    port: 5432,
    host: config.get('POSTGRES_ADDRESS'),
    database: 'postgres',
    synchronize: true,
    entities: [User, Channel, Match],
  };
}
