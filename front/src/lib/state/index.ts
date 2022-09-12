import { io } from 'socket.io-client';
import { LoginEvent, ChatEvent, GetInfoEvent } from 'backFrontCommon';
import type { Id } from 'backFrontCommon';
import type { ClientSocket as Socket, CMFromServer, RequestFeedbackDto } from 'backFrontCommon';
import { goto } from '$app/navigation';
import type { GameParams } from '../ts/gameParams';
import * as gameInvite from '../ts/gameInvite';
import {
	DMFromServer,
	DMToServer,
	GameAcceptFromServer,
	GameCancelFromServer,
	GameCancelToServer,
	GameInviteFromServer,
	GameRefuseFromServer,
	GameRefuseToServer,
	InviteChannelFromServer,
	GameInviteToServer,
	JoinChannelToServer,
	ChatFeedbackDto,
	CMToServer,
	CreateChannelToServer,
	GetUser,
	BlockUserToServer,
	FriendInviteToServer,
	BanUserFromServer,
	SetUsernameToServer,
	LeaveChannelToServer,
	DeleteChannelToServer,
	ChannelDeletedFromServer,
	BlockUserFromServer,
	SetNewAdminToServer,
	UnblockUserToServer,
	ChannelInfo,
	ChannelCategory,
	UnbanUserToServer,
	LeaderboardItemDto,
	ChatError
} from 'backFrontCommon/chatEvents';
import type { FeedbackCallback } from 'backFrontCommon/chatEvents';
import { MyInfo, UserInfo } from 'backFrontCommon/chatEvents';
import { channelConvs, userConvs } from '../ts/chatUtils';
import { readable, writable } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';
import { closeAllModals, closeLastModalListener } from '$lib/ts/modals';
import { PUBLIC_SERVER_ADDRESS, PUBLIC_SERVER_REQUEST_PORT } from '$env/static/public';

const LOGGIN_ROUTE: string = '/';
const LOGGIN_TOTP_ROUTE: string = '/totp';
export const LOGGIN_SUCCESS_ROUTE: string = '/Main';

const LOGGIN_ROUTES = [LOGGIN_ROUTE, LOGGIN_TOTP_ROUTE];

const USER_INFO_MOCKUP = new UserInfo(
	/* id */ 0,
	/* name */ 'loading...',
	/* win */ 0,
	/* loose */ 0,
	/* score */ 0,
	/* ranking */ 0,
	/* avatar */ null,
	/* isOnline */ true,
	/* inGame */ false,
	/* matchHistory */ []
);

const MY_INFO_MOKUP = new MyInfo(
	/* id */ 0,
	/* name */ 'loading..',
	/* friendlist */ [],
	/* blocked */ [],
	/* channels */ [],
	/* win */ 0,
	/* loose */ 0,
	/* score */ 0,
	/* ranking */ 0,
	/* avatar */ null,
	/* totpSecret */ null,
	/* inGame */ false
);

const CHANNEL_INFO_MOCKUP: ChannelInfo = {
	users: [],
	bannedUsers: [],
	channelType: ChannelCategory.PUBLIC
};

let resolveTotpRequired: ((token: string) => void) | null = null;

export let gameParams: GameParams | null = null;

const writableMyself = writable(MY_INFO_MOKUP, () => {
	updateMyself();
	return () => {};
});

export const myself: Readable<MyInfo> = writableMyself;

export let socket: Socket | null = null;

export function connected(): boolean {
	return !!socket;
}

function loggedIn(): boolean {
	return connected() && !resolveTotpRequired;
}

export function connect(code?: string) {
	if (connected()) return;
	// TODO: use .env config
	socket = io(`http://${PUBLIC_SERVER_ADDRESS}:${PUBLIC_SERVER_REQUEST_PORT}`, { auth: { code } });
	setupHooks(socket);
}

export function disconnect() {
	if (!connected()) return;
	socket!.disconnect();
	socket = null;
	goto(LOGGIN_ROUTE);
}

function onLoginSuccess() {
	goto(LOGGIN_SUCCESS_ROUTE);
}

export function storeMap<A, B>(store: Readable<A>, f: (a: A) => B): Readable<B> {
	return readable<B>(undefined, (setB) => store.subscribe((a) => setB(f(a))));
}

function onLoginFailure() {
	disconnect();
	goto(LOGGIN_ROUTE);
}

export function redirectHome() {
	if (connected()) goto('/Main');
	else goto('/');
}

function setupHooks(socket: Socket) {
	socket.on('connect_error', onConnectError);
	socket.on('disconnect', onDisconnect);
	socket.on(LoginEvent.SUCCESS, onLoginSuccess);
	socket.on(LoginEvent.FAILURE, onLoginFailure);
	socket.on(LoginEvent.TOTP_REQUIRED, onTotpRequired);
	socket.on(ChatEvent.GOTO_GAME_SCREEN, onGotoGameScreen);
	socket.on(ChatEvent.MSG_TO_USER, onMsgToUser);
	socket.on(ChatEvent.MSG_TO_CHANNEL, onMsgToChannel);
	socket.on(ChatEvent.INVITE_TO_PRIVATE_CHANNEL, onInviteToPrivateChannel);
	socket.on(ChatEvent.GAME_INVITE, onGameInvite);
	socket.on(ChatEvent.GAME_ACCEPT, onGameAccept);
	socket.on(ChatEvent.GAME_REFUSE, onGameRefuse);
	socket.on(ChatEvent.GAME_CANCEL, onGameCancel);
	socket.on(ChatEvent.BANNED_NOTIF, onBannedNotif);
	socket.on(ChatEvent.BLOCKED_NOTIF, onBlockedNotif);

	window.addEventListener('keydown', closeLastModalListener);

	// DEBUG
	// socket.onAny((event: string, ...args: any[]) => {
	// 	if (Object.getOwnPropertyNames(event).includes(event)) return;
	// 	console.log(`[RECEIVED] '${event}' << ${JSON.stringify(args)}`);
	// });
	// socket.prependAnyOutgoing((event: string, ...args: any[]) => {
	// 	if (Object.getOwnPropertyNames(event).includes(event)) return;
	// 	console.log(`[SENT] '${event}' >> ${JSON.stringify(args)}`);
	// });
}

// Totp
export function sendTotpToken(token: string) {
	if (!resolveTotpRequired) throw new Error('No pending totp requirements');
	resolveTotpRequired(token);
	resolveTotpRequired = null;
}

export function disableTotp() {
	socket!.emit(LoginEvent.TOTP_UPDATE, null, updateMyself);
}

export function enableTotp(token: string) {
	socket!.emit(LoginEvent.TOTP_UPDATE, token, updateMyself);
}

// Game
export function refuseGame(target: Id) {
	socket!.emit(ChatEvent.GAME_REFUSE, new GameRefuseToServer(target));
}

export function acceptGame(target: Id, callback: FeedbackCallback) {
	socket!.emit(ChatEvent.GAME_ACCEPT, { target }, callback);
}

export function cancelGame(target: Id) {
	socket!.emit(ChatEvent.GAME_CANCEL, new GameCancelToServer(target));
}

export function sendGameInvite(invite: GameInviteToServer, callback: FeedbackCallback) {
	socket!.emit(ChatEvent.GAME_INVITE, invite, callback);
}

export function invalidateGameParams() {
	gameParams = null;
}

export function observeGame(id: Id) {
	socket!.emit(ChatEvent.GAME_OBSERVE, id, (feedback) => {
		if (feedback.success) {
			closeAllModals();
			gameParams = {
				online: true,
				observe: true,
				classic: feedback.result!.classic,
				valid: true
			};
			goto('/Play');
		} else {
			console.error(feedback.errorMessage);
		}
	});
}

// Myself
export function updateMyself() {
	socket!.emit(GetInfoEvent.MY_INFO, onMyInfo);
}

export function getMyself() {}

function onMyInfo(feedback: RequestFeedbackDto<MyInfo>) {
	if (feedback.success) {
		const myInfo = feedback.result!;
		writableMyself.set(myInfo);
	} else console.error('Could not get my info');
}

// Users
export async function updateUser(id: Id): Promise<UserInfo> {
	return new Promise((r) =>
		socket!.emit(GetInfoEvent.USER_INFO, new GetUser(id), (info) => r(onUserInfo(info)))
	);
}

async function onUserInfo(feedback: RequestFeedbackDto<UserInfo>): Promise<UserInfo> {
	if (!feedback.success) throw new Error('Could not get user info');
	const user = feedback.result!;
	const entry = knownUsers.get(user.id);
	if (entry) {
		entry.store.set(user);
	} else {
		knownUsers.set(user.id, {
			data: user,
			store: writable(user)
		});
	}
	return user;
}

const knownUsers = new Map<Id, { data?: UserInfo; store: Writable<UserInfo> }>();
export function getUser(id: Id): Readable<UserInfo> {
	const entry = knownUsers.get(id);
	if (entry) return entry.store;
	const store = writable<UserInfo>(USER_INFO_MOCKUP);
	knownUsers.set(id, { store });
	updateUser(id);
	return store;
}

export async function getUserNow(id: Id): Promise<UserInfo> {
	const entry = knownUsers.get(id);
	if (entry?.data) return entry.data;
	return updateUser(id);
}

export function updateAllUsers() {
	for (const id of knownUsers.keys()) updateUser(id);
}

// Channels

const knownChannels = new Map<string, { store: Writable<ChannelInfo> }>();
export function getChannel(channel: string): Readable<ChannelInfo> {
	const entry = knownChannels.get(channel);
	if (entry) return entry.store;
	const store = writable<ChannelInfo>(CHANNEL_INFO_MOCKUP);
	knownChannels.set(channel, { store });
	updateChannel(channel);
	return store;
}

export async function updateChannel(channel: string): Promise<ChannelInfo> {
	return new Promise((r) =>
		socket!.emit(ChatEvent.GET_CHANNEL_INFO, { channel }, (info) => r(onChannelInfo(channel, info)))
	);
}

export function updateAllChannels() {
	for (const channel of knownChannels.keys()) updateChannel(channel);
}

function onChannelInfo(channel: string, feedback: RequestFeedbackDto<ChannelInfo>) {
	if (!feedback.success) {
		if (feedback.errorMessage == ChatError.CHANNEL_NOT_FOUND) {
			if (knownChannels.has(channel)) {
				knownChannels.delete(channel);
			}
			channelConvs.update((c) => {
				c.delete(channel);
				return c;
			});
		}
	}
	const info = feedback.result!;
	const entry = knownChannels.get(channel);
	if (entry) {
		entry.store.set(info);
	} else {
		knownChannels.set(channel, {
			store: writable(info)
		});
	}
	return info;
}

// All
export function updateAllStores() {
	if (loggedIn()) {
		updateMyself();
		updateAllUsers();
		updateAllChannels();
	}
}

// Avatar
export async function uploadAvatar(imageDataUrl: string) {
	socket!.emit(ChatEvent.POST_AVATAR, { imageDataUrl }, (feedback) => {
		if (!feedback.success) {
			alert(feedback.errorMessage);
		}
	});
}

// Chat
export function sendDirectMessage(message: DMToServer) {
	socket!.emit(ChatEvent.MSG_TO_USER, message, (feedback: ChatFeedbackDto) => {
		if (!feedback.success) {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendCreateChannel(message: CreateChannelToServer) {
	socket!.emit(ChatEvent.CREATE_CHANNEL, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			channelConvs.update((_) => _.create(message.channel));
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendChannelMessage(message: CMToServer) {
	socket!.emit(ChatEvent.MSG_TO_CHANNEL, message, (feedback: ChatFeedbackDto) => {
		if (!feedback.success) {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export async function sendJoinChannel(message: JoinChannelToServer): Promise<void> {
	return new Promise((resolve) => {
		socket!.emit(ChatEvent.JOIN_CHANNEL, message, (feedback: ChatFeedbackDto) => {
			if (feedback.success) {
				channelConvs.update((_) => _.create(message.channel));
				resolve();
			} else {
				alert(`error: ${feedback.errorMessage}`);
			}
		});
	});
}

export function sendBlockUser(message: BlockUserToServer) {
	socket!.emit(ChatEvent.BLOCK_USER, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			updateMyself();
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendUnblockUser(message: UnblockUserToServer) {
	socket!.emit(ChatEvent.UNBLOCK_USER, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			updateMyself();
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendFriendInvite(message: FriendInviteToServer) {
	socket!.emit(ChatEvent.FRIEND_INVITE, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			updateMyself();
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendChangeName(message: SetUsernameToServer) {
	socket!.emit(ChatEvent.SET_USERNAME, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			updateMyself();
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendLeaveChannel(message: LeaveChannelToServer) {
	socket!.emit(ChatEvent.LEAVE_CHANNEL, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			channelConvs.update((_) => _.delete(message.channel));
			closeAllModals();
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendDeleteChannel(message: DeleteChannelToServer) {
	socket!.emit(ChatEvent.DELETE_CHANNEL, message, (feedback: ChatFeedbackDto) => {
		if (feedback.success) {
			channelConvs.update((_) => _.delete(message.channel));
			closeAllModals();
		} else {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendSetNewAdminToServer(message: SetNewAdminToServer) {
	socket!.emit(ChatEvent.SET_NEW_ADMIN, message, (feedback: ChatFeedbackDto) => {
		if (!feedback.success) {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export function sendUnbanUser(message: UnbanUserToServer) {
	socket!.emit(ChatEvent.UNBAN_USER, message, (feedback: ChatFeedbackDto) => {
		if (!feedback.success) {
			alert(`error: ${feedback.errorMessage}`);
		}
	});
}

export async function sendGetLeaderboard(): Promise<LeaderboardItemDto[]> {
	return new Promise((resolve) => {
		socket!.emit(ChatEvent.GET_LEADERBOARD, (feedback) => {
			if (feedback.success) resolve(feedback.result!);
			else console.error('cannot get leaderboard');
		});
	});
}

// Hooks
function onConnectError() {
	// Clean close
	onDisconnect();
}

function onDisconnect() {
	socket = null;
	goto(LOGGIN_ROUTE);
}

function onTotpRequired(callback: (token: string) => void) {
	resolveTotpRequired = callback;
	goto(LOGGIN_TOTP_ROUTE);
}

export const pongKeyForRefresh = writable(Symbol());
function onGotoGameScreen(classic: boolean, ready: () => void) {
	if (!connected()) return;
	closeAllModals();
	gameParams = { classic, online: true, valid: true };
	let replaceState: boolean | undefined;
	if (['/Play', '/WaitingRoom', '/ChooseGameMode'].includes(window.location.href)) {
		replaceState = true;
	}
	pongKeyForRefresh.set(Symbol());
	goto('/Play', { replaceState }).then(ready);
}

function onMsgToUser(message: DMFromServer) {
	userConvs.update((_) => _.receiveMessageFromServer(message));
}

function onMsgToChannel(message: CMFromServer) {
	channelConvs.update((_) => _.receiveMessageFromServer(message));
}

function onInviteToPrivateChannel(message: InviteChannelFromServer) {
	channelConvs.update((_) => _.create(message.channel));
}

function onGameInvite(message: GameInviteFromServer) {
	gameInvite.receive(message);
}

function onGameAccept(message: GameAcceptFromServer) {
	gameInvite.removeSent(message.source);
}

function onGameRefuse(message: GameRefuseFromServer) {
	gameInvite.removeSent(message.source);
}

function onGameCancel(message: GameCancelFromServer) {
	gameInvite.revokeReceived(message.source);
}

function onBannedNotif(message: BanUserFromServer) {
	channelConvs.update((_) => {
		_.getBanned(message.channel).then(() => channelConvs.update((_) => _));
		return _;
	});
}

function onBlockedNotif(message: BlockUserFromServer) {
	userConvs.update((_) => _.delete(message.source));
}

// Used in +layout.svelte
export function forceRoute(): string | null {
	if (!connected()) return LOGGIN_ROUTE;
	if (resolveTotpRequired) return LOGGIN_TOTP_ROUTE;
	return null;
}

export function isBlocked(pathname: string): boolean {
	return loggedIn() && LOGGIN_ROUTES.includes(pathname);
}
export function redirectMainInvalidateGameParams() {
	goto('/Main', { replaceState: true });
	gameParams = null;
}
export function setGameParams(params: GameParams) {
	gameParams = params;
}
