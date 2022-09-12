/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ChannelManagerService } from '../channelManager/channelManager.service';
import { Id } from 'backFrontCommon';
import {
  GetBannedListToServer,
  GetBannedListFromServer,
  ChatFeedbackDto,
  RequestFeedbackDto,
  ChannelInfo,
  ChannelSummary,
  BanUserToServer,
  MuteUserToServer,
  LeaveChannelToServer,
  DMToServer,
  CMToServer,
  CreateChannelToServer,
  JoinChannelToServer,
  UnmuteUserToServer,
  BlockUserToServer,
  FriendInviteToServer,
  UnbanUserToServer,
  ChannelCategory,
  ChatEvent,
  ChatError,
  Server,
  SetPasswordToServer,
  SetNewAdminToServer,
  ChanInviteAccept,
  ChanInviteRefuse,
  InviteChannelToServer,
  InviteChannelFromServer,
  DeleteChannelToServer,
  GetChannelInfoToServer,
  ChannelUser,
  ServerSocket as Socket,
} from 'backFrontCommon';

import { Logger } from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(
    private userService: UserService,
    private channelManagerService: ChannelManagerService,
  ) {}
  private logger: Logger = new Logger('ChatGateway');

  // Random login for guest
  generateRandomId(): number {
    return Math.floor(Math.random() * 1_000);
  }

  async handleBlockUser(clientSocket: Socket, blockInfo: BlockUserToServer) {
    const sender = await this.userService.findOneDbBySocket(clientSocket);
    if (!sender)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    const target = await this.userService.findOneDb(blockInfo.target);
    if (!target)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.USER_NOT_FOUND,
      );
    if (target.id === sender.id)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.YOU_CANT_BLOCK_YOURSELF,
      );
    return this.userService.blockUser(sender, target);
  }

  async handleCreateChannel(
    clientSocket: Socket,
    chanInfo: CreateChannelToServer,
  ) {
    const tempUser = this.userService.findOneActiveBySocket(clientSocket);
    const tempDb = await this.userService.findOneDbBySocket(clientSocket);
    if (!tempDb)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    if (chanInfo.channel.length > 50)
      return { success: false, errorMessage: ChatError.CHANNEL_NAME_TOO_LONG };

    const tempChan = await this.channelManagerService.findChanByName(
      chanInfo.channel,
    );
    if (tempChan != undefined)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.CHANNEL_ALREADY_EXISTS,
      );
    if (!chanInfo.password && chanInfo.category === ChannelCategory.PROTECTED)
      return new ChatFeedbackDto(false, ChatError.MUST_SPECIFY_PASSWORD);
    const newChan = await this.channelManagerService.createChan(
      tempDb,
      chanInfo,
    );

    if (!newChan)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.CHANNEL_NOT_FOUND,
      );
    // this.channelManagerService.joinChan(tempUser, newChan);
    this.userService.joinChanUser(tempDb, newChan, tempUser);

    return this.channelManagerService.newChatFeedbackDto(true);
  }

  async handleMessageChannel(
    clientSocket: Socket,
    dto: CMToServer,
    wss: Server,
  ) {
    const tempChannel = await this.channelManagerService.findChanByName(
      dto.channel,
    );

    const tempSender = this.userService.findOneActiveBySocket(clientSocket);
    const feedback = this.channelManagerService.msgToChannelVerif(
      tempChannel,
      tempSender,
    );
    if (!feedback.success) return feedback;

    tempChannel!.member.forEach((member: Id) => {
      const tempUser = this.userService.findOneActive(member);
      if (tempUser)
        this.userService.updateChannelConversation(
          tempSender!,
          tempUser,
          tempChannel!,
          dto.content,
        );
    });
    wss
      .to(tempChannel!.name)
      .except(await this.userService.getArrayBlockedFrom(tempSender!))
      .emit(ChatEvent.MSG_TO_CHANNEL, {
        source: tempSender!.id,
        channel: tempChannel!.name,
        content: dto.content,
      });

    return this.channelManagerService.newChatFeedbackDto(true);
  }

  async handleJoinChannel(clientSocket: Socket, joinInfo: JoinChannelToServer) {
    const tempChan = await this.channelManagerService.findChanByName(
      joinInfo.channel,
    );
    const tempUser = await this.userService.findOneDbBySocket(clientSocket);

    const tempActive = this.userService.findOneActiveBySocket(clientSocket);
    if (!tempChan) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.CHANNEL_NOT_FOUND,
      );
    }
    if (!tempUser) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    }
    if (this.channelManagerService.isBanned(tempUser, tempChan)) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.YOU_ARE_BANNED,
      );
    }
    const feedback = await this.channelManagerService.joinChan(
      tempUser,
      tempChan,
      joinInfo.password,
    );
    if (feedback.success === true) {
      this.userService.joinChanUser(tempUser, tempChan, tempActive);
    }

    return feedback;
  }

  async handlePrivMessage(clientSocket: Socket, dm: DMToServer, wss: Server) {
    const sender = this.userService.findOneActiveBySocket(clientSocket);
    if (!sender) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    }
    const targetDb = await this.userService.findOneDb(dm.target);
    if (!targetDb) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.USER_NOT_FOUND,
      );
    }
    const target = this.userService.findOneActive(dm.target);
    if (!target) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.USER_OFFLINE,
      );
    }
    const feedback = await this.userService.sendMessageToUser(
      sender,
      wss,
      dm.content,
      target,
    );

    return feedback;
  }

  async handleFriendInvite(
    clientSocket: Socket,
    friendRequest: FriendInviteToServer,
  ) {
    const sender = await this.userService.findOneDbBySocket(clientSocket);
    if (!sender) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    }
    const target = await this.userService.findOneDb(friendRequest.target);
    if (!target) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.USER_NOT_FOUND,
      );
    }
    if (target.id === sender.id) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.YOU_CANT_BE_YOUR_OWN_FRIEND,
      );
    }
    return await this.userService.addFriend(sender, target);
  }

  async handleBanUser(
    clientSocket: Socket,
    banInfo: BanUserToServer,
    wss: Server,
  ) {
    const tempSender = this.userService.findOneActiveBySocket(clientSocket);
    if (!tempSender) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    }
    const tempTarget = await this.userService.findOneDb(banInfo.target);
    if (!tempTarget) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.USER_NOT_FOUND,
      );
    }
    if (tempSender.id === tempTarget.id)
      return {
        success: false,
        errorMessage: ChatError.YOU_CANT_BAN_YOURSELF,
      };
    const activeTarget = this.userService.findOneActive(banInfo.target);
    const tempChan = await this.channelManagerService.findChanByName(
      banInfo.channel,
    );
    if (!tempChan) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.CHANNEL_NOT_FOUND,
      );
    }
    const feedback = this.channelManagerService.banUser(
      tempSender,
      tempTarget,
      tempChan,
      banInfo.duration,
      wss,
      this.userService.findOneActive(tempTarget.id),
    );
    if (feedback.success === true) {
      this.userService.leaveChannel(tempTarget, tempChan, activeTarget);
    }
    return feedback;
  }

  async handleMuteUser(
    clientSocket: Socket,
    muteInfo: MuteUserToServer,
    wss: Server,
  ) {
    const tempSender = this.userService.findOneActiveBySocket(clientSocket);
    if (!tempSender) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.U_DO_NOT_EXIST,
      );
    }
    const tempTarget = await this.userService.findOneDb(muteInfo.target);
    if (!tempTarget) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.USER_NOT_FOUND,
      );
    }
    if (tempSender.id === tempTarget.id)
      return {
        success: false,
        errorMessage: ChatError.YOU_CANT_MUTE_YOURSELF,
      };
    const tempChan = await this.channelManagerService.findChanByName(
      muteInfo.channel,
    );
    const activeTarget = this.userService.findOneActive(muteInfo.target);
    if (!tempChan) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.CHANNEL_NOT_FOUND,
      );
    }
    const feedback = this.channelManagerService.muteUser(
      tempSender,
      tempTarget,
      tempChan,
      muteInfo.duration,
      wss,
      activeTarget,
    );
    return feedback;
  }
  async setPassword(
    socket: Socket,
    setInfo: SetPasswordToServer,
  ): Promise<ChatFeedbackDto> {
    const user = this.userService.findOneActiveBySocket(socket);
    if (!user)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const channel = await this.channelManagerService.findChanByName(
      setInfo.channel,
    );

    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    else
      return await this.channelManagerService.setPassword(
        user,
        channel,
        setInfo.password,
      );
  }
  async handleSetNewAdmin(
    socket: Socket,
    setInfo: SetNewAdminToServer,
  ): Promise<ChatFeedbackDto> {
    const user = this.userService.findOneActiveBySocket(socket);
    if (!user)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const channel = await this.channelManagerService.findChanByName(
      setInfo.channel,
    );
    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    const target = await this.userService.findOneDb(setInfo.target);
    if (!target)
      return { success: false, errorMessage: ChatError.USER_NOT_FOUND };
    return await this.channelManagerService.setNewAdmin(user, target, channel);
  }
  async handleUnbanUser(socket: Socket, unBanInfo: UnbanUserToServer) {
    const user = await this.userService.findOneDbBySocket(socket);
    if (!user)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const channel = await this.channelManagerService.findChanByName(
      unBanInfo.channel,
    );
    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    const target = await this.userService.findOneDb(unBanInfo.target);
    if (!target)
      return { success: false, errorMessage: ChatError.USER_NOT_FOUND };
    if (!this.channelManagerService.isAdmin(user, channel))
      return { success: false, errorMessage: ChatError.INSUFICIENT_PERMISSION };
    return this.channelManagerService.unBanUser(target, channel);
  }
  async handleUnmuteUser(socket: Socket, unmuteInfo: UnmuteUserToServer) {
    const user = await this.userService.findOneDbBySocket(socket);
    if (!user)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const channel = await this.channelManagerService.findChanByName(
      unmuteInfo.channel,
    );
    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    const target = await this.userService.findOneDb(unmuteInfo.target);
    if (!target)
      return { success: false, errorMessage: ChatError.USER_NOT_FOUND };
    if (!this.channelManagerService.isAdmin(user, channel))
      return { success: false, errorMessage: ChatError.INSUFICIENT_PERMISSION };
    return this.channelManagerService.unMuteUser(target, channel);
  }
  async handleInviteChannel(
    socket: Socket,
    inviteInfo: InviteChannelToServer,
    wss: Server,
  ): Promise<ChatFeedbackDto> {
    const sender = this.userService.findOneActiveBySocket(socket);
    if (!sender)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const channel = await this.channelManagerService.findChanByName(
      inviteInfo.channel,
    );
    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    const target = await this.userService.findOneDb(inviteInfo.target);
    const activeTarget = this.userService.findOneActive(inviteInfo.target);
    if (!target)
      return { success: false, errorMessage: ChatError.USER_NOT_FOUND };
    const feedback = this.channelManagerService.inviteUserToChannel(
      sender,
      target,
      channel,
      wss,
      activeTarget,
    );
    if (feedback.success)
      this.userService.joinChanUser(target, channel, activeTarget);
    return feedback;
  }

  async handleDeleteChannel(socket: Socket, deleteInfo: DeleteChannelToServer) {
    const sender = this.userService.findOneActiveBySocket(socket);
    if (!sender)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const channel = await this.channelManagerService.findChanByName(
      deleteInfo.channel,
    );
    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    if (!this.channelManagerService.isCreator(sender, channel))
      return { success: false, errorMessage: ChatError.INSUFICIENT_PERMISSION };
    channel.member.forEach(async (member) => {
      const tempUser = await this.userService.findOneDb(member);
      const tempActive = this.userService.findOneActive(member);
      if (tempUser) {
        this.userService.leaveChannel(tempUser, channel, tempActive);
      }
    });
    this.channelManagerService.deleteChannel(channel);
    return { success: true };
  }
  async handleLeaveChannel(
    clientSocket: Socket,
    leaveInfo: LeaveChannelToServer,
  ) {
    const sender = await this.userService.findOneDbBySocket(clientSocket);
    if (!sender)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const activeSender = this.userService.findOneActiveBySocket(clientSocket);
    const channel = await this.channelManagerService.findChanByName(
      leaveInfo.channel,
    );
    if (!channel)
      return { success: false, errorMessage: ChatError.CHANNEL_NOT_FOUND };
    return this.userService.leaveChannel(sender, channel, activeSender);
  }
  async handleGetChannelInfo(
    socket: Socket,
    chatInfo: GetChannelInfoToServer,
  ): Promise<RequestFeedbackDto<ChannelInfo>> {
    const user = this.userService.findOneActiveBySocket(socket);
    if (!user) {
      return {
        success: false,
        errorMessage: ChatError.USER_NOT_FOUND,
      };
    }
    const channel = await this.channelManagerService.findChanByName(
      chatInfo.channel,
    );
    if (!channel) {
      return {
        success: false,
        errorMessage: ChatError.CHANNEL_NOT_FOUND,
      };
    }
    //let users : ChannelUser[] = [];
    const usersPromise = channel.member.map(async (member) => {
      const tempUser = await this.userService.findOneDb(member);
      if (tempUser) {
        return this.channelManagerService.ChannelUserTransformator(
          tempUser,
          channel,
        );
      }
      return null;
    });
    const users = await Promise.all(usersPromise);
    const result = users.filter((user) => user !== null) as ChannelUser[];
    return {
      success: true,
      result: new ChannelInfo(
        result,
        channel.banned.map((banned) => {
          return banned.userId;
        }),
        channel.category,
      ),
    };
  }
  async getChannelsList(
    socket: Socket,
  ): Promise<RequestFeedbackDto<ChannelSummary[]>> {
    const sender = this.userService.findOneActiveBySocket(socket);
    if (!sender)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    const result = await this.channelManagerService.getPublicProtectedChan(
      sender,
    );
    return {
      success: true,
      result: result,
    };
  }
}
