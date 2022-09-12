import { Injectable } from '@nestjs/common';
import { Id, MuteUserFromServer } from 'backFrontCommon';
import { ChatEvent } from 'backFrontCommon';
import { User } from '../user/entities/user.entity';
import { ActiveUser } from '../user/user.service';
import { ChatError } from 'backFrontCommon';
import { ChannelCategory, ChatFeedbackDto } from 'backFrontCommon';
import * as bcrypt from 'bcrypt';
import { Server as IOServerBaseType } from 'socket.io';
import type { CreateChannelToServer } from 'backFrontCommon';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  BanUserFromServer,
  ChatMessageDto,
  ActiveUserConversationDto,
  ChannelSummary,
  ActiveChannelConversationDto,
  UserHistoryDto,
  ChannelUser,
  ChannelRights,
  GetChannelInfoToServer,
} from 'backFrontCommon';
import { ServerToClientEvents, ClientToServerEvents } from 'backFrontCommon';
import { Channel, BannedUser, MutedUser } from './channel.entity';
import { FileWatcherEventKind } from 'typescript';
type Server = IOServerBaseType<ClientToServerEvents, ServerToClientEvents>;

@Injectable()
export class ChannelManagerService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}
  private logger: Logger = new Logger('channelManagerService');

  isCreator(user: ActiveUser | User, channel: Channel): boolean {
    if (channel.creator === user.id) return true;
    else return false;
  }

  isAdmin(user: ActiveUser | User, channel: Channel): boolean {
    if (channel.admin.find((users) => user.id === users) != undefined)
      return true;
    else return false;
  }
  isBanned(user: ActiveUser | User, channel: Channel): boolean {
    const banInfo = channel.banned.find(
      (bannedList) => bannedList.userId === user.id,
    );
    const newDate = new Date();
    if (banInfo === undefined) return false;
    else {
      const unBanDate = new Date(banInfo!.unbanDate);
      if (unBanDate.getTime() > newDate.getTime()) return true;
      else {
        this.unBanUser(user, channel);
        return false;
      }
    }
  }
  isMuted(user: ActiveUser | User, channel: Channel): boolean {
    const muteInfo = channel.muted.find(
      (mutedList) => mutedList.userId === user.id,
    );
    const newDate = new Date();
    if (muteInfo === undefined) return false;
    else {
      const unMuteDate = new Date(muteInfo!.unmuteDate);
      if (unMuteDate.getTime() > newDate.getTime()) return true;
      else {
        channel;
        this.unMuteUser(user, channel);
        return false;
      }
    }
  }
  isMember(user: ActiveUser | User, channel: Channel): boolean {
    if (channel.member.find((users) => user.id === users) != undefined)
      return true;
    else return false;
  }
  async createChan(
    activeUser: ActiveUser | User,
    chanInfo: CreateChannelToServer,
  ): Promise<Channel> {
    if (chanInfo.category === ChannelCategory.PROTECTED) {
      const hash = await bcrypt.hash(chanInfo.password!, 10);
      return this.channelRepository.save(
        new Channel(chanInfo.channel, activeUser.id, chanInfo.category, hash),
      );
    } else
      return this.channelRepository.save(
        new Channel(chanInfo.channel, activeUser.id, chanInfo.category),
      );
    //return new ChatFeedbackDto(true);
  }

  newChatFeedbackDto(_success: boolean, _errorMessage?: string) {
    if (_errorMessage)
      return { success: _success, errorMessage: _errorMessage };
    else return { success: _success, errorMessage: undefined };
  }
  newChatMessageDto(
    _sender: Id,
    _content: string,
    _isMe: boolean,
  ): ChatMessageDto {
    return { sender: _sender, content: _content, isMe: _isMe };
  }

  newActiveUserConversationDto(
    _interlocutor: Id,
    _history: ChatMessageDto[],
  ): ActiveUserConversationDto {
    return { interlocutor: _interlocutor, history: _history };
  }
  newActiveChannelConversationDto(
    _channel: string,
    _history: ChatMessageDto[],
  ): ActiveChannelConversationDto {
    return { channel: _channel, history: _history };
  }

  newUserHistoryDto(
    _userHistory: ActiveUserConversationDto[],
    _channelHistory: ActiveChannelConversationDto[],
  ): UserHistoryDto {
    return { userHistory: _userHistory, channelHistory: _channelHistory };
  }
  leaveChannel(channel: Channel, user: ActiveUser | User) {
    if (user.id === channel.creator) channel.creator = -1;
    channel.member.splice(channel.member.indexOf(user.id), 1);
    if (this.isAdmin(user, channel))
      channel.admin.splice(channel.admin.indexOf(user.id), 1);
    if (channel.member.length === 0) this.deleteChannel(channel);
    this.channelRepository.update(channel.name!, {
      member: channel.member,
      admin: channel.admin,
      creator: channel.creator,
    });
  }
  async findChanByName(name: string): Promise<Channel | null> {
    return this.channelRepository.findOneBy({ name });
  }

  findChanAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }
  async joinChan(
    user: ActiveUser | User,
    channel: Channel,
    password?: string,
  ): Promise<ChatFeedbackDto> {
    if (channel.member.find((element) => element === user.id))
      return new ChatFeedbackDto(false, ChatError.ALREADY_IN_CHANNEL);
    if (channel.category === ChannelCategory.PRIVATE)
      return new ChatFeedbackDto(false, ChatError.CHANNEL_IS_PRIVATE);
    if (channel.category === ChannelCategory.PROTECTED) {
      if (!password || !(await bcrypt.compare(password, channel.passHash!)))
        return new ChatFeedbackDto(false, ChatError.WRONG_PASSWORD);
    }
    channel.member.push(user.id);
    this.channelRepository.update(channel.name!, { member: channel.member });
    return new ChatFeedbackDto(true);
  }

  async joinChanPrivate(
    user: ActiveUser | User,
    channel: Channel,
  ): Promise<ChatFeedbackDto> {
    channel.member.push(user.id);
    this.channelRepository.update(channel.name!, { member: channel.member });
    return new ChatFeedbackDto(true);
  }

  async setPassword(
    user: ActiveUser,
    channel: Channel,
    password: string,
  ): Promise<ChatFeedbackDto> {
    if (channel.creator != user.id)
      return new ChatFeedbackDto(false, ChatError.INSUFICIENT_PERMISSION);

    this.channelRepository.update(channel.name!, {
      category: ChannelCategory.PROTECTED,
    });
    this.channelRepository.update(channel.name!, {
      passHash: await bcrypt.hash(password, 10),
    });
    return new ChatFeedbackDto(true);
  }
  async setNewAdmin(
    sender: ActiveUser,
    target: User,
    channel: Channel,
  ): Promise<ChatFeedbackDto> {
    if (channel.creator != sender.id)
      return new ChatFeedbackDto(false, ChatError.INSUFICIENT_PERMISSION);
    if (channel.admin.find((element) => element === target.id) != undefined)
      return new ChatFeedbackDto(false, ChatError.ALREADY_ADMIN);
    channel.admin.push(target.id);
    this.channelRepository.update(channel.name!, { admin: channel.admin });
    return new ChatFeedbackDto(true);
  }
  async allChan() {
    FileWatcherEventKind;
  }
  msgToChannelVerif(
    channel: Channel | null,
    sender: ActiveUser | undefined,
  ): ChatFeedbackDto {
    if (!channel)
      return new ChatFeedbackDto(false, ChatError.CHANNEL_NOT_FOUND);
    if (!sender) return new ChatFeedbackDto(false, ChatError.U_DO_NOT_EXIST);
    if (channel.member.find((id) => id === sender.id) === undefined)
      return new ChatFeedbackDto(false, ChatError.NOT_IN_CHANNEL);
    if (this.isMuted(sender, channel))
      return new ChatFeedbackDto(false, ChatError.YOU_ARE_MUTED);
    if (this.isBanned(sender, channel))
      return new ChatFeedbackDto(false, ChatError.YOU_ARE_BANNED);
    return new ChatFeedbackDto(true);
  }

  banUser(
    sender: ActiveUser,
    target: User,
    channel: Channel,
    duration: number,
    wss: Server,
    targetActive?: ActiveUser,
  ): ChatFeedbackDto {
    const d = new Date();
    if (
      target.id === channel.creator ||
      !this.isAdmin(sender, channel) ||
      (sender.id != channel.creator && this.isAdmin(target, channel))
    )
      return new ChatFeedbackDto(false, ChatError.INSUFICIENT_PERMISSION);
    if (this.isBanned(target, channel))
      return new ChatFeedbackDto(false, ChatError.ALREADY_BANNED);
    else {
      if (targetActive)
        targetActive.socketUser.forEach((socket) =>
          wss
            .to(socket.id)
            .emit(
              ChatEvent.BANNED_NOTIF,
              new BanUserFromServer(channel.name, sender.id, duration),
            ),
        );
      channel.banned.push(
        new BannedUser(new Date(d.getTime() + duration * 1000), target.id),
      );
      this.channelRepository.update(channel.name, { banned: channel.banned });
      return new ChatFeedbackDto(true);
    }
  }
  async getPublicProtectedChan(user: User | ActiveUser) {
    let chanDb = await this.channelRepository.find({
      where: { category: ChannelCategory.PUBLIC },
    });
    let result: ChannelSummary[] = [];
    chanDb.forEach((chan) =>
      result.push(
        new ChannelSummary(chan.name, chan.category, this.isMember(user, chan)),
      ),
    );
    return result;
  }
  unBanUser(user: ActiveUser | User, channel: Channel): ChatFeedbackDto {
    const banInfo = channel.banned.find((banned) => user.id === banned.userId);
    if (banInfo === undefined)
      return new ChatFeedbackDto(false, ChatError.NOT_BANNED);
    else {
      channel.banned.splice(channel.banned.indexOf(banInfo), 1);
      this.channelRepository.update(channel.name, { banned: channel.banned });
      return new ChatFeedbackDto(true);
    }
  }
  unMuteUser(user: ActiveUser | User, channel: Channel): ChatFeedbackDto {
    const muteInfo = channel.muted.find((muted) => user.id === muted.userId);
    if (muteInfo === undefined)
      return new ChatFeedbackDto(false, ChatError.NOT_MUTED);
    else {
      channel.muted.splice(channel.muted.indexOf(muteInfo), 1);
      this.channelRepository.update(channel.name, { muted: channel.muted });
      return new ChatFeedbackDto(true);
    }
  }
  muteUser(
    sender: ActiveUser,
    target: User,
    channel: Channel,
    duration: number,
    wss: Server,
    activeTarget?: ActiveUser,
  ): ChatFeedbackDto {
    const d = new Date();
    if (channel.admin.find((admin) => admin === sender.id) === undefined)
      return new ChatFeedbackDto(false, ChatError.INSUFICIENT_PERMISSION);
    if (this.isMuted(target, channel))
      return new ChatFeedbackDto(false, ChatError.ALREADY_MUTED);
    else {
      if (activeTarget)
        activeTarget.socketUser.forEach((socket) =>
          wss
            .to(socket.id)
            .emit(
              ChatEvent.MUTED_NOTIF,
              new MuteUserFromServer(channel.name, sender.id, duration),
            ),
        );
      channel.muted.push(
        new MutedUser(new Date(d.getTime() + duration * 1000), target.id),
      );
      this.channelRepository.update(channel.name, { muted: channel.muted });
      return new ChatFeedbackDto(true);
    }
  }
  inviteUserToChannel(
    sender: ActiveUser,
    target: User,
    channel: Channel,
    wss: Server,
    activeTarget?: ActiveUser,
  ): ChatFeedbackDto {
    if (!this.isAdmin(sender, channel))
      return { success: false, errorMessage: ChatError.INSUFICIENT_PERMISSION };
    if (this.isMember(target, channel))
      return { success: false, errorMessage: ChatError.ALREADY_IN_CHANNEL };
    if (this.isBanned(target, channel))
      return { success: false, errorMessage: ChatError.USER_IS_BANNED };
    this.joinChanPrivate(target, channel);
    if (activeTarget)
      activeTarget.socketUser.forEach((socket) =>
        wss.to(socket.id).emit(ChatEvent.INVITE_TO_PRIVATE_CHANNEL, {
          channel: channel.name,
          source: sender.id,
        }),
      );
    return { success: true, errorMessage: undefined };
  }
  deleteChannel(channel: Channel) {
    this.channelRepository.delete(channel.name);
  }
  ChannelUserTransformator(user: User, channel: Channel): ChannelUser {
    if (this.isCreator(user, channel))
      return {
        id: user.id,
        rights: ChannelRights.OWNER,
        muted: false,
      };
    if (this.isAdmin(user, channel))
      return {
        id: user.id,
        rights: ChannelRights.ADMIN,
        muted: false,
      };
    if (this.isMuted(user, channel))
      return {
        id: user.id,
        rights: ChannelRights.USER,
        muted: true,
      };
    return {
      id: user.id,
      rights: ChannelRights.USER,
      muted: false,
    };
  }
}
