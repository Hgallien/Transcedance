// import { IsArray, IsBoolean, IsDate, IsIn, IsInstance, IsInt, IsOptional, IsPositive, IsString, IsUrl } from "class-validator";
import type { UserHistoryDto } from "./chatConversationsDto"
import type { Id } from "./general"

/**
 * Events required to Login
 */
export class LoginEvent {
  static readonly SUCCESS = "login success";
  static readonly FAILURE = "login failure";
  static readonly TOTP_REQUIRED = "totp required";
  static readonly TOTP_UPDATE = "totp update";
}

export class GetInfoEvent{
  static readonly MY_INFO = "my info";
  static readonly USER_INFO = "user info";
  static readonly MY_MATCH = "my match info";
  static readonly USER_MATCH = "user match info";
  static readonly ALL_MATCH = "all match info";
  static readonly IS_IN_GAME = "is in game";
  static readonly GET_CHANNELS_LIST = "get channels list";
}

export class ChatEvent {
  static readonly MSG_TO_CHANNEL = "msg to channel"
  static readonly SET_USERNAME = "set username"
  static readonly MSG_TO_USER = 'msg to user'
  static readonly JOIN_CHANNEL = 'join channel'
  static readonly LEAVE_CHANNEL = 'leave channel'
  static readonly CREATE_CHANNEL = 'create channel'
  static readonly INVITE_TO_PRIVATE_CHANNEL = 'invite to channel'
  static readonly GAME_INVITE = 'game invite'
  static readonly GAME_ACCEPT = 'game accept'
  static readonly GAME_REFUSE = 'game refuse'
  static readonly GAME_CANCEL = 'game cancel'
  static readonly FRIEND_INVITE = 'friend invite'
  static readonly POST_AVATAR=  'post_avatar'
  static readonly GET_FRIENDS =  'get_friends '
  static readonly GET_LEADERBOARD = 'get_leaderboard'
  static readonly GET_CHAT_HISTORY = 'get_chat_history'
  static readonly BLOCK_USER = 'block user'
  static readonly MUTE_USER = 'mute user'
  static readonly BANNED_NOTIF = 'you are banned from a chan'
  static readonly CHAN_INVIT_NOTIF = 'chan invite notif'
  static readonly MUTED_NOTIF = 'you are muted from a chan'
  static readonly JOIN_MATCHMAKING = 'join matchmaking'
  static readonly GAME_OBSERVE = 'game observe'
  static readonly PLAYER_ID_CONFIRMED = 'player id confirmed'
  static readonly GOTO_GAME_SCREEN = 'goto game screen'
  static readonly DELETE_GAME_INVITE = 'delete game invite'
  static readonly SET_PASSWORD = 'set password'
  static readonly SET_NEW_ADMIN = 'set new admin'
  static readonly QUIT_MATCHMAKING = 'quit matchmaking'
  static readonly DELETE_CHANNEL = 'delete channel'
  static readonly GET_CHANNEL_INFO = 'get channel info'
  static readonly BAN_USER = 'ban user'
  static readonly CHANNEL_DELETED_NOTIF = 'channel deleted notif'
  static readonly BLOCKED_NOTIF = 'blocked notif'
  static readonly GET_BANNED_IN_CHANNEL = "get banned in channel"
  static readonly UNBLOCK_USER = 'unblock user'
  static readonly UNBAN_USER = "unban user"
  static readonly UNMUTE_USER = "unmute user"
}

export class ChatError {


  static readonly U_DO_NOT_EXIST ="u do not exist";
  static readonly USER_NOT_FOUND ="user not found";
  static readonly USER_OFFLINE ="user offline";
  static readonly CHANNEL_NOT_FOUND ="channel not found";
  static readonly WRONG_PASSWORD ="wrong password";
  static readonly YOU_ARE_BANNED ="you are banned";
  static readonly USER_IS_BANNED ="user is banned";
  static readonly YOU_ARE_MUTED ="you are muted";
  static readonly YOU_ARE_BLOCKED ="you are blocked";
  static readonly NOT_IN_CHANNEL ="not in channel";
  static readonly ALREADY_FRIEND = "already friend";
  static readonly ALREADY_IN_GAME = "already in game";
  static readonly ALREADY_IN_CHANNEL = "already in channel";
  static readonly ALREADY_ADMIN = "already admin";
  static readonly NAME_ALREADY_IN_USE = "name already in use";
  static readonly CHANNEL_IS_PRIVATE = "the channel is private";
  static readonly INSUFICIENT_PERMISSION = "insuficient permission";
  static readonly CANT_INVITE_TO_NON_PRIVATE_CHANNEL = "cant invite to non private channel";
  static readonly CANT_CREATE_PROTECTED_CHANNEL_WO_PASSW = "cant create protected channel wo passw";
  static readonly ALREADY_BLOCKED ="user already blocked";
  static readonly ALREADY_BANNED ="user already banned";
  static readonly ALREADY_MUTED ="user already muted";
  static readonly NOT_BANNED ="user not banned";
  static readonly NOT_MUTED ="user not muted";
  static readonly NOT_BLOCKED ="user was not blocked";
  static readonly CHANNEL_ALREADY_EXISTS = "channel already exists";
  static readonly NO_SUCH_GAME_INVITATION = "no such game invitation";
  static readonly USER_NOT_IN_GAME = "user not in game";
  static readonly USER_IN_GAME = "user in game";
  static readonly YOU_CANT_BE_YOUR_OWN_FRIEND="you can't be your own friend";
  static readonly YOU_CANT_BLOCK_YOURSELF="you can't block yourself";
  static readonly YOU_CANT_BAN_YOURSELF="you can't ban yourself";
  static readonly YOU_CANT_MUTE_YOURSELF="you can't mute yourself";
  static readonly YOU_CANT_PLAY_WITH_YOURSELF = "you can't play with yourself..... here"
  static readonly CANNOT_INVITE_YOURSELF = "you cannot invite yourself";

  static readonly MUST_SPECIFY_PASSWORD = "must specify password";
  static readonly USER_ALREADY_INVITED = "user already invited";
  static readonly ALREADY_IN_MATCHMAKING = "already in matchmaking";
  static readonly YOU_ARE_ALREADY_IN_GAME = "you are already in game";
  static readonly CHANNEL_NAME_TOO_LONG = "the channel name is too long";
}

export class DMFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  // @IsString()
  content: string;
  // @IsOptional() @IsBoolean()
  isMe: boolean | undefined;
  constructor(
    source: Id,
    content: string,
	isMe?: boolean
  ) {
    this.source = source;
    this.content = content;
    this.isMe = isMe;
  }
}

export class DMToServer {
  // @IsPositive() @IsInt()
  target: Id;
  // @IsString()
  content: string;

  constructor(
    target: Id,
    content: string,
  ) {
    this.target = target;
    this.content = content;
  }
}

export class CMFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  // @IsString()
  channel: string;
  // @IsString()
  content: string;
  constructor(
    source: Id,
    channel: string,
    content: string,
  ) {
    this.source = source;
    this.channel = channel;
    this.content = content;
  }
}

export class CMToServer {
  // @IsString()
  channel: string;
  // @IsString()
  content: string;
  constructor(
      channel: string,
      content: string,
  ) {
      this.channel = channel;
      this.content = content;
  }
}

export class JoinChannelFromServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  newUser: Id;
    constructor(
      channel: string,
      newUser: Id,
    ) {
      this.channel = channel;
      this.newUser = newUser;
    }
}

export class JoinChannelToServer {
  // @IsString()
  channel: string;
  // @IsOptional() @IsString()
  password?: string;
    constructor(
      channel: string,
      password?: string,
    ) {
      this.channel = channel;
      this.password = password;
   }
}

export class SetPasswordToServer {
  // @IsString()
  channel: string;
  // @IsString()
  password: string;
  constructor(
    channel: string,
    password: string
  ) {
    this.channel = channel;
    this.password = password;
  }
}
export class SetNewAdminToServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    channel: string,
    target: Id
  ) {
    this.channel = channel;
    this.target = target;
  }
}

export enum ChannelCategory {
  PUBLIC, PROTECTED, PRIVATE
};

export class FriendInviteToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class CreateChannelToServer {
  // @IsString()
  channel: string;
  // @IsIn([ChannelCategory.PRIVATE, ChannelCategory.PROTECTED, ChannelCategory.PUBLIC])
  category: ChannelCategory;
  // @IsOptional() @IsString()
  password: string | undefined;
  constructor(
    channel: string,
    category: ChannelCategory,
    password?: string,
  ) {
    this.channel = channel;
    this.category = category;
    this.password = password;
  }
}

export class InviteChannelFromServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  source: Id;
  constructor(
    channel: string,
    source: Id
  ) {
    this.channel = channel;
    this.source = source;
  }
}

export class InviteChannelToServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    channel: string,
    target: Id,
  ) {
    this.channel = channel;
    this.target = target;
  }
}

export class GameInviteFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  // @IsBoolean()
  classic: boolean;
  constructor(
    source: Id,
    classic: boolean
  ) {
    this.source = source;
    this.classic = classic;
  }
}

export class GameInviteToServer {
  // @IsPositive() @IsInt()
  target: Id;
  // @IsBoolean()
  classic: boolean;
  constructor(
    target: Id,
    classic: boolean,
  ) {
    this.target = target;
    this.classic = classic;
  }
}

export class GameAcceptFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  constructor(
    source: Id
  ) {
    this.source = source;
  }
}

export class GameAcceptToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class GameRefuseFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  // @IsOptional() @IsString()
  reason: string | undefined;
  constructor(
    source: Id,
    reason?: string,
  ) {
    this.source = source;
    this.reason = reason;
  }
}

export class GameRefuseToServer {
  // @IsPositive() @IsInt()
  target: Id;
  // @IsOptional() @IsString()
  reason: string | undefined;
  constructor(
    target: Id,
    reason?: string,
  ) {
    this.target = target;
    this.reason = reason;
  }
}

export class PostAvatar {
  // @IsUrl()
  imageDataUrl: string;
  constructor(
    imageDataUrl: string
  ) {
    this.imageDataUrl = imageDataUrl;
  }
}

export class GetUser {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class LeaderboardItemDto {
  // @IsPositive() @IsInt()
  id: Id;
  // @IsString()
  name: string;
  // @IsPositive() @IsInt()
  victory: number;
  // @IsPositive() @IsInt()
  defeat: number;
  // @IsInt()
  score: number;
  constructor(
    id : number,
    name : string,
    victory : number,
    defeat : number,
    score : number,
  ) {
    this.id = id;
    this.name = name;
    this.victory = victory;
    this.defeat = defeat;
    this.score = score;
  }
}

export class GetLeaderBoardResponse {
  // @IsArray() @IsInstance(LeaderboardItemDto)
  items: LeaderboardItemDto[];
  constructor(
    items: LeaderboardItemDto[]
  ) {
    this.items = items;
  }
}

export class BlockUserToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class BanUserToServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  target: Id;
  // @IsPositive() @IsInt()
  duration: number;
  constructor(
    channel: string,
    target: Id,
    duration: number,
  ) {
    this.channel = channel;
    this.target = target;
    this.duration = duration;
  }
}

export class MatchInfoToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class MatchInfoFromServer {
  // @IsPositive() @IsInt()
  winner: Id;
  // @IsPositive() @IsInt()
  looser: Id;
  // @IsPositive() @IsInt()
  winnerScore: number;
  // @IsPositive() @IsInt()
  looserScore: number;
  // @IsDate()
  date: Date;
  constructor(
    winner: Id,
    looser: Id,
    winnerScore : number,
    looserScore: number,
    date : Date
  ) {
    this.winner = winner;
    this.looser = looser;
    this.winnerScore = winnerScore;
    this.looserScore = looserScore;
    this.date = date
  }
};

export class RelativeMatchInfoFromServer {
  // @IsPositive() @IsInt()
  opponent: Id;
  // @IsBoolean()
  winner: boolean;
  // @IsPositive() @IsInt()
  score: number;
  // @IsPositive() @IsInt()
  opponentScore: number;
  constructor(
    opponent: Id,
    winner: boolean,
    score : number,
    opponentScore: number
  ) {
    this.opponent = opponent;
    this.winner = winner;
    this.score = score;
    this.opponentScore = opponentScore;
  }
};

export class GetBannedListToServer {
  // @IsString()
  channel: string;
  constructor(
    channel: string
  ) {
    this.channel = channel;
  }
}
export class GetBannedListFromServer {
  // @IsArray() @IsInt()
  users: Id[];
  constructor(
    users: Id[]
  ) {
    this.users = users;
  }
}
export class SetUsernameToServer {
  // @IsString()
  name: string;
  constructor(
    name: string
  ) {
    this.name = name;
  }
}

export class GameCancelFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  // @IsOptional() @IsString()
  reason: string | undefined;
  constructor(
    source: Id,
    reason?: string,
  ) {
    this.source = source;
    this.reason = reason;
  }
}

export class GameCancelToServer {
  // @IsPositive() @IsInt()
  target: Id;
  // @IsOptional() @IsString()
  reason: string | undefined;
  constructor(
    target: Id,
    reason?: string,
  ) {
    this.target = target;
    this.reason = reason;
  }
}

export class DeleteGameInviteFromServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class ChanInviteAccept {
  // @IsPositive() @IsInt()
  channel: string;
  constructor(
    channel: string,
  ) {
    this.channel = channel;
  }
}

export class ChanInviteRefuse {
  // @IsString()
  channel: string;
  constructor(
    channel: string
  ) {
    this.channel = channel;
  }
}

export class MyInfo {
  // @IsPositive() @IsInt()
  id: Id;
  // @IsString()
  name: string;
  // @IsArray() @IsPositive() @IsInt()
  friendlist: Id[];
  // @IsArray() @IsPositive() @IsInt()
  blocked: Id[];
  // @IsArray() @IsString()
  channels: string[];
  // @IsPositive() @IsInt()
  win: number;
  // @IsPositive() @IsInt()
  loose: number;
  // @IsPositive() @IsInt()
  score: number;
  // @IsPositive() @IsInt()
  ranking: number;
  // @IsOptional() @IsString()
  avatar: string | null;
  // @IsString()
  totpSecret: string | null;
  // @IsBoolean()
  inGame: boolean;
  constructor (
    id: Id,
    name: string,
    friendlist: Id[],
    blocked: Id[],
    channels: string[],
    win: number,
    loose: number,
    score: number,
    ranking: number,
    avatar: string | null,
    totpSecret: string | null,
    inGame: boolean
  ) {
    this.id = id;
    this.name = name;
    this.friendlist = friendlist;
    this.blocked = blocked;
    this.channels = channels;
    this.win = win;
    this.loose = loose;
    this.score = score;
    this.ranking = ranking;
    this.avatar = avatar;
    this.totpSecret = totpSecret;
    this.inGame = inGame;
  }
};

export class UserInfo {
  // @IsPositive() @IsInt()
  id: Id;
  // @IsString()
  name: string;
  // @IsPositive() @IsInt()
  win: number;
  // @IsPositive() @IsInt()
  loose: number;
  // @IsPositive() @IsInt()
  score: number;
  // @IsPositive() @IsInt()
  ranking: number;
  // @IsOptional() @IsString()
  avatar: string | null;
  // @IsBoolean()
  isOnline: boolean;
  // @IsBoolean()
  inGame: boolean;
  // @IsArray() @IsInstance(RelativeMatchInfoFromServer)
  matchHistory: RelativeMatchInfoFromServer[];
  constructor(
    id: Id,
    name: string,
    win: number,
    loose: number,
    score: number,
    ranking: number,
    avatar: string | null,
    isOnline: boolean,
    inGame: boolean,
    matchHistory: RelativeMatchInfoFromServer[]
  ) {
    this.id = id;
    this.name = name;
    this.win = win;
    this.loose = loose;
    this.score = score;
    this.ranking = ranking;
    this.avatar = avatar;
    this.isOnline = isOnline;
    this.inGame = inGame;
    this.matchHistory = matchHistory;
  }
};

export class UserInfoToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}

export class BanUserFromServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  sender: Id;
  // @IsPositive() @IsInt()
  duration: number;
  constructor(
    channel: string,
    sender: Id,
    duration: number,
  ) {
    this.channel = channel;
    this.sender = sender;
    this.duration = duration;
  }
}

export class MuteUserToServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  target: Id;
  // @IsPositive() @IsInt()
  duration: number;
  constructor(
    channel: string,
    target: Id,
    duration: number,
  ) {
    this.channel = channel;
    this.target = target;
    this.duration = duration;
  }
}

export class MuteUserFromServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  sender: Id;
  // @IsPositive() @IsInt()
  duration: number;
  constructor(
    channel: string,
    sender: Id,
    duration: number,
  ) {
    this.channel = channel;
    this.sender = sender;
    this.duration = duration;
  }
};
export class DeleteChannelToServer {
  // @IsString()
  channel: string;
  constructor(
    channel: string
  ) {
    this.channel = channel;
  }
}
export class IsInGameToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor (
    target: Id
  ) {
    this.target = target;
  }
}
export class GetChannelInfoToServer {
  // @IsString()
  channel: string;
  constructor (
    channel: string
  ) {
    this.channel = channel;
  }
}
export enum ChannelRights {
  OWNER,
  ADMIN,
  USER
}
export class ChannelUser {
  // @IsPositive() @IsInt()
  id: Id;
  // @IsIn([ChannelRights.ADMIN, ChannelRights.OWNER, ChannelRights.USER])
  rights: ChannelRights;
  // @IsBoolean()
  muted: boolean;
  constructor(
    id: Id,
    rights: ChannelRights,
    muted: boolean,
  ) {
    this.id = id;
    this.rights = rights;
    this.muted = muted;
  }
}
export class ChannelInfo {
  // @IsArray() @IsInstance(ChannelUser)
  users: ChannelUser[];
  // @IsArray() @IsPositive() @IsInt()
  bannedUsers: Id[];
  // @IsString()
  channelType: ChannelCategory;
  constructor (
    users: ChannelUser[],
    bannedUsers: Id[],
    channelType: ChannelCategory,
  ) {
    this.users = users;
    this.bannedUsers = bannedUsers;
    this.channelType = channelType;
  }
}
export class LeaveChannelToServer {
  // @IsString()
  channel: string;
  constructor(
    channel: string,
  ) {
    this.channel = channel;
  }
}
export class ChannelDeletedFromServer {
  // @IsString()
  channel: string;
  constructor(
    channel: string,
  ) {
    this.channel = channel;
  }
}
export class BlockUserFromServer {
  // @IsPositive() @IsInt()
  source: Id;
  constructor(
    source: Id
  ) {
    this.source = source;
  }
}
export class UnblockUserToServer {
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    target: Id
  ) {
    this.target = target;
  }
}
export class UnbanUserToServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    channel: string,
    target: Id,
  ) {
    this.channel = channel;
    this.target = target;
  }
}
export class ChannelSummary {
  // @IsString()
  channel: string;
  // @IsString()
  category: ChannelCategory;
  // @IsBoolean()
  inChan: boolean;
  constructor(
    channel: string,
    category: ChannelCategory,
    inChan:boolean
  ) {
    this.channel = channel;
    this.category = category;
    this.inChan = inChan;
  }

}
export class UnmuteUserToServer {
  // @IsString()
  channel: string;
  // @IsPositive() @IsInt()
  target: Id;
  constructor(
    channel: string,
    target: Id
  ) {
    this.channel = channel;
    this.target = target;
  }
}
export class GameStyleFromServer {
  constructor(
    public classic: boolean,
  ) { }
}



export class ChatFeedbackDto {
  // @IsBoolean()
  success: boolean;
  // @IsOptional() @IsString()
  errorMessage: string | undefined;
  constructor(
    success: boolean,
    errorMessage?: string,
  ) {
    this.success = success;
    this.errorMessage = errorMessage;
  }
}

export type FeedbackCallback = (feedback: ChatFeedbackDto) => void;

export class RequestFeedbackDto<Result> {
  // @IsBoolean()
  success: boolean;
  // @IsString()
  errorMessage?: string;
  // @IsString()
  result?: Result;
  constructor(
    success: boolean,
    errorMessage?: string,
    result?: Result,
  ) {
    this.success = success;
    this.errorMessage = errorMessage;
    this.result = result;
  }
}

export type FeedbackCallbackWithResult<Result> = (feedback: RequestFeedbackDto<Result>) => void;

export interface ServerToClientEvents {
  // Login
  [LoginEvent.SUCCESS]: () => void;
  [LoginEvent.FAILURE]: () => void;
  [LoginEvent.TOTP_REQUIRED]: (callback: (token: string) => void) => void;

  // Chat
  [ChatEvent.MSG_TO_USER]: (dto: DMFromServer) => void;
  [ChatEvent.MSG_TO_CHANNEL]: (dto: CMFromServer) => void;
  [ChatEvent.JOIN_CHANNEL]: (dto: JoinChannelFromServer) => void;
  [ChatEvent.INVITE_TO_PRIVATE_CHANNEL]: (dto: InviteChannelFromServer) => void;
  [ChatEvent.GAME_INVITE]: (dto: GameInviteFromServer) => void;
  [ChatEvent.GAME_ACCEPT]: (dto: GameAcceptFromServer) => void;
  [ChatEvent.GAME_REFUSE]: (dto: GameRefuseFromServer) => void;
  [ChatEvent.GAME_CANCEL]: (dto: GameCancelFromServer) => void;
  [ChatEvent.GOTO_GAME_SCREEN]: (classic: boolean, callback: () => void) => void;
  [ChatEvent.PLAYER_ID_CONFIRMED]: (playerId: Id, callback: () => void) => void;
  [ChatEvent.DELETE_GAME_INVITE]: (dto: DeleteGameInviteFromServer) => void;

  [ChatEvent.BANNED_NOTIF]: (dto: BanUserFromServer) => void;
  [ChatEvent.BLOCKED_NOTIF]: (dto: BlockUserFromServer) => void;
  [ChatEvent.MUTED_NOTIF]: (dto: MuteUserFromServer) => void;
  [ChatEvent.CHANNEL_DELETED_NOTIF]: (dto: ChannelDeletedFromServer) => void;

  // [ChatEvent.FRIEND_INVITE]: (dto: FriendInviteFromServer) => void;
}

export interface ClientToServerEvents {
  // Login
  [LoginEvent.TOTP_UPDATE]: (secret: string | null, callback: (arg: number) => void) => void;

  // UserInfo
  [GetInfoEvent.MY_INFO]: (callback: FeedbackCallbackWithResult<MyInfo>) => void;
  [GetInfoEvent.USER_INFO]: (dto: GetUser, callback: FeedbackCallbackWithResult<UserInfo>) => void;
  [GetInfoEvent.IS_IN_GAME]: (dto: IsInGameToServer, callback: FeedbackCallbackWithResult<boolean>) => void;
  [GetInfoEvent.GET_CHANNELS_LIST]: (callback: FeedbackCallbackWithResult<ChannelSummary[]>) => void;

  // Chat
  [ChatEvent.MSG_TO_USER]: (dto: DMToServer, callback: FeedbackCallback) => void;
  [ChatEvent.MSG_TO_CHANNEL]: (dto: CMToServer, callback: FeedbackCallback) => void;
  [ChatEvent.JOIN_CHANNEL]: (dto: JoinChannelToServer, callback: FeedbackCallback) => void;
  [ChatEvent.CREATE_CHANNEL]: (dto: CreateChannelToServer, callback: FeedbackCallback) => void;
  [ChatEvent.INVITE_TO_PRIVATE_CHANNEL]: (dto: InviteChannelToServer, callback: FeedbackCallback) => void;
  [ChatEvent.FRIEND_INVITE]: (dto: FriendInviteToServer, callback: FeedbackCallback) => void;
  [ChatEvent.POST_AVATAR]: (dto: PostAvatar, callback: FeedbackCallback) => void;
  [ChatEvent.GET_FRIENDS]: (callback: FeedbackCallbackWithResult<Id[]>) => void;
  [ChatEvent.GET_LEADERBOARD]: (callback: FeedbackCallbackWithResult<LeaderboardItemDto[]>) => void;
  [ChatEvent.GET_CHAT_HISTORY]: (callback: FeedbackCallbackWithResult<UserHistoryDto>) => void;
  [ChatEvent.JOIN_MATCHMAKING]: (classic: boolean, callback: FeedbackCallback) => void;
  [ChatEvent.GAME_INVITE]: (dto: GameInviteToServer, callback: FeedbackCallback) => void;
  [ChatEvent.GAME_ACCEPT]: (dto: GameAcceptToServer, callback: FeedbackCallback) => void;
  [ChatEvent.GAME_REFUSE]: (dto: GameRefuseToServer) => void;
  [ChatEvent.GAME_OBSERVE]: (userId: Id, callback: FeedbackCallbackWithResult<GameStyleFromServer>) => void;
  [ChatEvent.GAME_CANCEL]: (dto: GameCancelToServer) => void;
  [ChatEvent.BAN_USER]: (dto: BanUserToServer, callback: FeedbackCallback) => void;
  [ChatEvent.MUTE_USER]: (dto: MuteUserToServer, callback: FeedbackCallback) => void;
  [ChatEvent.QUIT_MATCHMAKING]: () => void;
  [ChatEvent.DELETE_CHANNEL]: (dto: DeleteChannelToServer, callback: FeedbackCallback) => void;
  [ChatEvent.GET_CHANNEL_INFO]: (dto: GetChannelInfoToServer, callback: FeedbackCallbackWithResult<ChannelInfo>) => void;
  [ChatEvent.BLOCK_USER]: (dto: BlockUserToServer, callback: FeedbackCallback) => void;
  [ChatEvent.SET_USERNAME]: (dto: SetUsernameToServer, callback: FeedbackCallback) => void;
  [ChatEvent.LEAVE_CHANNEL]: (dto: LeaveChannelToServer, callback: FeedbackCallback) => void;
  [ChatEvent.SET_NEW_ADMIN]: (dto: SetNewAdminToServer, callback: FeedbackCallback) => void;
  [ChatEvent.UNBLOCK_USER]: (dto: UnblockUserToServer, callback: FeedbackCallback) => void;
  [ChatEvent.GET_BANNED_IN_CHANNEL]: (dto: GetBannedListToServer, callback: FeedbackCallbackWithResult<GetBannedListFromServer>) => void;
  [ChatEvent.UNBAN_USER]: (dto: UnbanUserToServer, callback: FeedbackCallback) => void;
  [ChatEvent.UNMUTE_USER]: (dto: UnmuteUserToServer, callback: FeedbackCallback) => void;
}
