import { Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Match } from '../matchHistory/match.entity';
import { UserDto } from './dto/user.dto';
import {
  ActiveChannelConversationDto,
  ActiveUserConversationDto,
  PostAvatar,
  LeaderboardItemDto,
  ServerToClientEvents,
  UserInfoToServer,
  DMFromServer,
} from 'backFrontCommon';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../channelManager/channel.entity';
import { ChannelManagerService } from '../channelManager/channelManager.service';
import { MatchHistoryService } from '../matchHistory/matchHistory.service';
import { Repository } from 'typeorm';
import { ServerSocket as Socket, Server } from 'backFrontCommon';
import {
  MyInfo,
  UserInfo,
  RequestFeedbackDto,
  ChatFeedbackDto,
  UnblockUserToServer,
  UserHistoryDto,
  Id,
  ChatEvent,
  ChatError,
  MatchInfoFromServer,
  ChatMessageDto,
  RelativeMatchInfoFromServer,
} from 'backFrontCommon';
import EventEmitter from 'events';

export class ActiveUser {
  constructor(public id: Id, public name: string, newSocket?: Socket) {
    if (newSocket) this.socketUser.push(newSocket);
  }
  pending_invite = false;
  inGame = false;
  socketUser: Socket[] = [];
  joinedChannel: Channel[] = [];
  activeUserConversation: ActiveConversation[] = [];
  activeChannelConversation: ActiveConversation[] = [];
  eventEmitter: EventEmitter = new EventEmitter();
  emitOnAllSockets<Key extends keyof ServerToClientEvents>(
    event: Key,
    ...args: Parameters<ServerToClientEvents[Key]>
  ) {
    this.socketUser.forEach((socket) => {
      socket.emit(event, ...args);
    });
  }
}
export class ChatMessage {
  constructor(
    public sender: Id,
    public content: string,
    public isMe: boolean,
  ) {}
}

export class ActiveConversation {
  constructor(public name: string | Id, public chatMessage?: ChatMessage) {
    this.history = [];
    if (chatMessage) this.history.push(chatMessage);
  }
  history: ChatMessage[];
}

@Injectable()
export class UserService {
  arrayActiveUser: ActiveUser[] = [];
  logger = new Logger('User Service');
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly channelManagerService: ChannelManagerService,
    private readonly matchHistoryService: MatchHistoryService,
  ) {}
  printAllActiveSocket() {
    let logger = new Logger('All active');
    this.arrayActiveUser.forEach((user) => {
      logger.debug(user.name);
      user.socketUser.forEach((socket) => logger.debug(socket.id));
    });
  }
  dtoTraductionChatMessage(chatMessage: ChatMessage[]): ChatMessageDto[] {
    const chatMessageDto: ChatMessageDto[] = [];
    chatMessage.forEach((message) =>
      chatMessageDto.push(
        this.channelManagerService.newChatMessageDto(
          (this.findOneActive(message.sender) as ActiveUser).id,
          message.content,
          message.isMe,
        ),
      ),
    );
    return chatMessageDto;
  }
  async scoreUpdate(player: User[], score: number[]) {
    if (score[0] > score[1]) {
      this.usersRepository.update(player[0].id, {
        win: player[0].win + 1,
        score: player[0].score + 17,
      });
      this.usersRepository.update(player[1].id, {
        loose: player[1].loose + 1,
        score: player[1].score - 17,
      });
    } else {
      this.usersRepository.update(player[1].id, {
        win: player[1].win + 1,
        score: player[1].score + 17,
      });
      this.usersRepository.update(player[0].id, {
        loose: player[0].loose + 1,
        score: player[0].score - 17,
      });
    }
  }
  leaderbordTransformator(users: User[]): LeaderboardItemDto[] {
    const result: LeaderboardItemDto[] = [];
    users.forEach((user) =>
      result.push(
        new LeaderboardItemDto(
          user.id,
          user.name,
          user.win,
          user.loose,
          user.score,
        ),
      ),
    );
    return result;
  }
  async getLeaderboard(
    socket: Socket,
  ): Promise<RequestFeedbackDto<LeaderboardItemDto[]>> {
    const userDb = await this.findOneDbBySocket(socket);
    if (!userDb)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    return {
      success: true,
      result: this.leaderbordTransformator(
        await this.usersRepository.find({
          order: {
            score: 'DESC',
          },
        }),
      ),
    };
  }

  async getRanking(user: User): Promise<number> {
    const users = await this.usersRepository.find({
      order: {
        score: 'DESC',
      },
    });
    const ranking = users.findIndex((player) => player.id === user.id);
    return ranking + 1;
  }
  dtoTraductionChannelConv(
    activeConversation: ActiveConversation[],
  ): ActiveChannelConversationDto[] {
    const activeConversationDto: ActiveChannelConversationDto[] = [];
    activeConversation.forEach((conv: ActiveConversation) =>
      activeConversationDto.push(
        this.channelManagerService.newActiveChannelConversationDto(
          conv.name as string,
          this.dtoTraductionChatMessage(conv.history),
        ),
      ),
    );
    return activeConversationDto;
  }
  dtoTraductionUserConv(
    activeConversation: ActiveConversation[],
  ): ActiveUserConversationDto[] {
    const activeConversationDto: ActiveUserConversationDto[] = [];
    activeConversation.forEach((conv: ActiveConversation) =>
      activeConversationDto.push(
        this.channelManagerService.newActiveUserConversationDto(
          conv.name as number,
          this.dtoTraductionChatMessage(conv.history),
        ),
      ),
    );
    return activeConversationDto;
  }
  async getUserHistory(
    socket: Socket,
  ): Promise<RequestFeedbackDto<UserHistoryDto>> {
    const tempUser = this.findOneActiveBySocket(socket);
    if (tempUser) {
      return {
        success: true,
        result: this.channelManagerService.newUserHistoryDto(
          this.dtoTraductionUserConv(tempUser.activeUserConversation),
          this.dtoTraductionChannelConv(tempUser.activeChannelConversation),
        ),
      };
    } else {
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    }
  }
  async setUsername(socket: Socket, name: string): Promise<ChatFeedbackDto> {
    const userDb = await this.findOneDbBySocket(socket);
    if (!userDb) {
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    }
    if ((await this.findOneDbByName(name)) != null) {
      return { success: false, errorMessage: ChatError.NAME_ALREADY_IN_USE };
    }
    this.usersRepository.update(userDb!.id, { name: name });
    return new ChatFeedbackDto(true);
  }
  findAllDb(): Promise<User[]> {
    return this.usersRepository.find();
  }
  getSocketListStringFromId(activeId: Id): string[] {
    const activeUser = this.findOneActive(activeId);
    if (!activeUser) return [];
    const result: string[] = [];
    activeUser.socketUser.forEach((socket) => result.push(socket.id));
    return result;
  }
  findOneActive(id: Id): ActiveUser | undefined {
    return this.arrayActiveUser.find((user) => user.id == id);
  }
  findOneActiveBySocket(clientSocket: Socket): ActiveUser | undefined {
    return this.arrayActiveUser.find(
      (user) =>
        user.socketUser.find((socket) => socket === clientSocket) != undefined,
    );
  }
  async getArrayBlockedFrom(activeUser: ActiveUser): Promise<string[]> {
    const userDb = await this.findOneDb(activeUser.id);
    if (!userDb) return [];
    let result: string[] = [];
    userDb.blockedFrom.forEach(
      (blocked) =>
        (result = result.concat(this.getSocketListStringFromId(blocked))),
    );
    return result;
  }

  findOneActiveByName(name: string): ActiveUser | undefined {
    return this.arrayActiveUser.find((user) => user.name === name);
  }
  findOneDb(id: Id): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
  findOneDbWithRelation(id: Id): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: {
        match: true,
      },
    });
  }
  async findOneDbBySocket(clientSocket: Socket): Promise<User | null> {
    const tempUser = this.findOneActiveBySocket(clientSocket);
    if (!tempUser) return null;
    return this.usersRepository.findOneBy({ id: tempUser.id });
  }
  findOneDbByName(name: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ name });
  }
  async remove(id: Id): Promise<void> {
    await this.usersRepository.delete(id);
  }
  async isBlocked(
    activeUser: ActiveUser | User,
    blockerUser: ActiveUser | User,
  ): Promise<boolean> {
    const tempUserDb = await this.findOneDb(activeUser.id);
    if (tempUserDb!.blockedFrom.find((blocked) => blocked === blockerUser.id))
      return true;
    else return false;
  }

  async addOne(userDto: UserDto): Promise<void> {
    const id = userDto.id;
    const logger = new Logger('addone');

    let i = 0;
    let userDb = await this.findOneDb(id);
    if (userDb === null) {
      while (await this.findOneDbByName(userDto.name)) {
        i++;
        userDto.name = userDto.name + i;
      }
      userDb = await this.usersRepository.save(
        new User(userDto.id, userDto.name),
      );
    }
    const tempUser = this.arrayActiveUser.find((user) => user.id === id);
    if (!tempUser) {
      this.arrayActiveUser.push(
        new ActiveUser(userDb.id, userDto.name, userDto.socket),
      );
    } else {
      tempUser.socketUser.push(userDto.socket);
    }
    userDb.channel.forEach((chan) => userDto.socket.join(chan));
  }

  async addOneGuest(socket: Socket) {
    // TODO: Better guests than random id
    const id = Math.floor(Math.random() * 1000);
    await this.addOne(new UserDto(id, `guest-${id}`, socket));
  }

  addNewSocketUser(activeUser: ActiveUser, newSocket: Socket) {
    if (activeUser) {
      activeUser.socketUser.push(newSocket);
      activeUser.joinedChannel.forEach((channel: Channel) =>
        newSocket.join(channel.name),
      );
    }
  }

  async joinChanUser(user: User, channel: Channel, activeUser?: ActiveUser) {
    const logger = new Logger('joinChanUser');

    user.channel.push(channel.name);
    this.usersRepository.update(user!.id, { channel: user.channel });

    if (activeUser) {
      this.updateChannelConversation(activeUser, activeUser, channel);
      activeUser.socketUser.forEach((socket: Socket) =>
        socket.join(channel.name),
      );
    }
  }

  async addFriend(sender: User, target: User): Promise<ChatFeedbackDto> {
    if (
      sender.friendlist.find((friend) => friend === target.id) === undefined
    ) {
      sender.friendlist.push(target.id);
      //a test
      this.usersRepository.update(sender.id, {
        friendlist: sender.friendlist,
      });
      return this.channelManagerService.newChatFeedbackDto(true);
    } else
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.ALREADY_FRIEND,
      );
  }

  async handlePostAvatar(
    socket: Socket,
    avatarInfo: PostAvatar,
  ): Promise<ChatFeedbackDto> {
    const user = await this.findOneDbBySocket(socket);
    if (!user)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    this.usersRepository.update(user.id, {
      avatar: avatarInfo.imageDataUrl,
    });

    return new ChatFeedbackDto(true);
  }

  updateUserConversation(
    sender: ActiveUser,
    target: ActiveUser,
    content: string,
  ) {
    const tempSenderConversation = sender.activeUserConversation.find(
      (conv) => conv.name === target.id,
    );
    const tempTargetConversation = sender.activeUserConversation.find(
      (conv) => conv.name === sender.id,
    );
    if (tempSenderConversation)
      tempSenderConversation.history.push(
        new ChatMessage(sender.id, content, true),
      );
    else
      sender.activeUserConversation.push(
        new ActiveConversation(
          target.id,
          new ChatMessage(sender.id, content, true),
        ),
      );
    if (tempTargetConversation)
      tempTargetConversation.history.push(
        new ChatMessage(sender.id, content, false),
      );
    else
      target.activeUserConversation.push(
        new ActiveConversation(
          sender.id,
          new ChatMessage(sender.id, content, false),
        ),
      );
  }

  updateChannelConversation(
    sender: ActiveUser,
    user: ActiveUser,
    channel: Channel,
    content?: string,
  ) {
    // This shouldn't be tested as undefined should not be a possible value
    if (sender === undefined || user === undefined) return;
    const tempUserConversation = user.activeChannelConversation.find(
      (conv) => conv.name === channel.name,
    );
    if (tempUserConversation)
      tempUserConversation.history.push(
        new ChatMessage(sender.id, content!, sender === user),
      );
    else {
      if (content)
        user.activeChannelConversation.push(
          new ActiveConversation(
            channel.name,
            new ChatMessage(sender.id, content, sender === user),
          ),
        );
      else
        user.activeChannelConversation.push(
          new ActiveConversation(channel.name),
        );
    }
  }

  // Update user totpSecret (to enable or disable it)
  async updateTotp(userId: Id, totpSecret: string | null) {
    await this.usersRepository.update({ id: userId }, { totpSecret });
  }

  disconnection(clientSocket: Socket) {
    const logger = new Logger('disconnection');
    const activeUser = this.findOneActiveBySocket(clientSocket);
    if (activeUser) {
      if (activeUser.socketUser.length === 1) {
        activeUser.joinedChannel.forEach((channel) =>
          this.channelManagerService.leaveChannel(channel, activeUser),
        );
        this.arrayActiveUser.splice(
          this.arrayActiveUser.indexOf(activeUser),
          1,
        );
        activeUser.eventEmitter.emit('disconnect');
      } else {
        activeUser.socketUser.splice(
          activeUser.socketUser.indexOf(clientSocket),
          1,
        );
      }
    }
  }

  async leaveChannel(
    dbUser: User,
    channel: Channel,
    activeUser?: ActiveUser,
  ): Promise<ChatFeedbackDto> {
    if (channel.member.find((id) => id === dbUser.id) === undefined)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.NOT_IN_CHANNEL,
      );
    this.channelManagerService.leaveChannel(channel, dbUser);
    if (activeUser)
      activeUser.socketUser.forEach((socket) => socket.leave(channel.name));

    dbUser.channel.splice(dbUser.channel.indexOf(channel.name), 1);
    this.usersRepository.update(dbUser.id, { channel: dbUser.channel });
    return this.channelManagerService.newChatFeedbackDto(true);
  }

  async sendMessageToUser(
    sender: ActiveUser,
    wss: Server,
    content: string,
    target: ActiveUser,
  ): Promise<ChatFeedbackDto> {
    if (await this.isBlocked(sender, target)) {
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.YOU_ARE_BLOCKED,
      );
    }
    target.socketUser.forEach((socket) =>
      wss
        .to(socket.id)
        .emit(ChatEvent.MSG_TO_USER, new DMFromServer(sender.id, content)),
    );
    sender.socketUser.forEach((socket) =>
      wss.to(socket.id).emit(ChatEvent.MSG_TO_USER, {
        source: target.id,
        content: content,
        isMe: true,
      }),
    );
    this.updateUserConversation(sender, target, content);
    return this.channelManagerService.newChatFeedbackDto(true);
  }

  blockUser(sender: User, target: User): ChatFeedbackDto {
    if (sender.blocked.find((user) => user === target.id) != undefined)
      return this.channelManagerService.newChatFeedbackDto(
        false,
        ChatError.ALREADY_BLOCKED,
      );
    else {
      sender.blocked.push(target.id);
      target.blockedFrom.push(sender.id);
      this.usersRepository.update(sender.id, { blocked: sender.blocked });
      this.usersRepository.update(target.id, {
        blockedFrom: target.blockedFrom,
      });
      return this.channelManagerService.newChatFeedbackDto(true);
    }
  }
  async MyInfoTransformator(user: User): Promise<MyInfo> {
    const activeUser = this.findOneActive(user.id);
    if (activeUser)
      return {
        id: user.id,
        name: user.name,
        friendlist: user.friendlist,
        blocked: user.blocked,
        win: user.win,
        channels: user.channel,
        loose: user.loose,
        score: user.score,
        ranking: await this.getRanking(user),
        avatar: user.avatar,
        totpSecret: user.totpSecret,
        inGame: activeUser.inGame,
      };
    else
      return {
        id: user.id,
        name: user.name,
        friendlist: user.friendlist,
        blocked: user.blocked,
        win: user.win,
        channels: user.channel,
        loose: user.loose,
        score: user.score,
        ranking: await this.getRanking(user),
        avatar: user.avatar,
        totpSecret: user.totpSecret,
        inGame: false,
      };
  }
  MatchDbToMatchRelative(
    user: User,
    match: Match,
  ): RelativeMatchInfoFromServer {
    let opponnent;
    let opScore;
    let myScore;
    let winner = false;

    if (match.player[0].id == user.id) {
      opponnent = match.player[1];
      opScore = match.score[1];
      myScore = match.score[0];
      if (match.score[0] > match.score[1]) winner = true;
    } else {
      opponnent = match.player[0];
      opScore = match.score[0];
      myScore = match.score[1];
      if (match.score[1] > match.score[0]) winner = true;
    }
    return {
      opponent: opponnent.id,
      winner: winner,
      score: myScore,
      opponentScore: opScore,
    };
  }
  async relativeMatchHistory(
    user: User,
  ): Promise<RelativeMatchInfoFromServer[]> {
    const result: RelativeMatchInfoFromServer[] = [];
    if (!user.match) return [];
    for (let i = 0; i < Math.min(3, user.match.length); i++) {
      let match = user.match[user.match.length - 1 - i];
      match = (await this.matchHistoryService.findOneDbWithRelation(
        match.id!,
      ))!;
      result.push(this.MatchDbToMatchRelative(user, match));
    }
    return result;
  }
  async UserInfoTransformator(user: User): Promise<UserInfo> {
    const activeUser = this.findOneActive(user.id);
    if (activeUser)
      return {
        id: user.id,
        name: user.name,
        win: user.win,
        loose: user.loose,
        score: user.score,
        ranking: await this.getRanking(user),
        avatar: user.avatar,
        isOnline: true,
        inGame: activeUser.inGame,
        matchHistory: await this.relativeMatchHistory(user),
      };
    else
      return {
        id: user.id,
        name: user.name,
        win: user.win,
        loose: user.loose,
        score: user.score,
        ranking: await this.getRanking(user),
        avatar: user.avatar,
        isOnline: false,
        inGame: false,
        matchHistory: await this.relativeMatchHistory(user),
      };
  }
  async MyInfo(socket: Socket): Promise<RequestFeedbackDto<MyInfo>> {
    const user = await this.findOneDbBySocket(socket);
    if (!user)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    else return { success: true, result: await this.MyInfoTransformator(user) };
  }
  async UserInfo(
    socket: Socket,
    userInfo: UserInfoToServer,
  ): Promise<RequestFeedbackDto<UserInfo>> {
    const sender = await this.findOneDbBySocket(socket);
    const target = await this.findOneDbWithRelation(userInfo.target);
    if (!sender)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    else if (!target)
      return { success: false, errorMessage: ChatError.USER_NOT_FOUND };
    else
      return {
        success: true,
        result: await this.UserInfoTransformator(target),
      };
  }
  async matchForChatUser(match: Match[]): Promise<MatchInfoFromServer[]> {
    const result: MatchInfoFromServer[] = [];
    if (!match) return [];
    for (let i = 0; i < Math.min(3, match.length); i++) {
      result.push(
        await this.matchHistoryService.MatchDbToMatchDTO(
          match[match.length - i],
        ),
      );
    }
    return result;
  }
  async handleUnblockUser(socket: Socket, unblockInfo: UnblockUserToServer) {
    const sender = await this.findOneDbBySocket(socket);
    const target = await this.findOneDb(unblockInfo.target);
    if (!sender)
      return { success: false, errorMessage: ChatError.U_DO_NOT_EXIST };
    else if (!target)
      return { success: false, errorMessage: ChatError.USER_NOT_FOUND };
    if (!(await this.isBlocked(target, sender)))
      return { success: false, errorMessage: ChatError.NOT_BLOCKED };
    sender.blocked.splice(sender.blocked.indexOf(target.id), 1);
    target.blockedFrom.splice(target.blockedFrom.indexOf(sender.id), 1);
    this.usersRepository.update(sender!.id, { blocked: sender.blocked });
    this.usersRepository.update(target!.id, {
      blockedFrom: target.blockedFrom,
    });
    return { success: true };
  }
}
