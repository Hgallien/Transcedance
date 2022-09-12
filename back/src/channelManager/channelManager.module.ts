import { Module } from '@nestjs/common';
import { ChannelManagerService } from './channelManager.service';

@Module({
  providers: [ChannelManagerService],
})
export class ChannelManagerModule {}
