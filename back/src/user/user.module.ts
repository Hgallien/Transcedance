import { Module } from '@nestjs/common';
import { ChannelManagerService } from '../channelManager/channelManager.service';
import { MatchHistoryService } from '../matchHistory/matchHistory.service';

import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';

import { User } from './entities/user.entity';
import { Match } from '../matchHistory/match.entity';
import { Channel } from '../channelManager/channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from '../chat/chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Channel, Match]), HttpModule],
  providers: [
    ChatService,
    MatchHistoryService,
    UserService,

    ChannelManagerService,
  ],
  exports: [
    UserService,
    ChatService,
    MatchHistoryService,
    ChannelManagerService,
  ],
})
export class UserModule {}
