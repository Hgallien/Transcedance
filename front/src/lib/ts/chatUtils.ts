import type {
	ActiveChannelConversationDto,
	ActiveUserConversationDto,
	ChatMessageDto,
	UserHistoryDto
} from 'backFrontCommon';
import { writable } from 'svelte/store';
import type { CMFromServer, DMFromServer } from 'backFrontCommon/chatEvents';
import type { Id } from 'backFrontCommon/general';
import { delay } from 'pong/common/utils';

export abstract class Conversation<DTOType extends { history: ChatMessageDto[] }> {
	hasNewMessage: boolean = false;
	constructor(public dto: DTOType) {}

	get history(): ChatMessageDto[] {
		return this.dto.history;
	}
	addMessage(message: ChatMessageDto) {
		this.history.push(message);
		if (!message.isMe) this.hasNewMessage = true;
	}
}

export class UserConversation extends Conversation<ActiveUserConversationDto> {
	constructor(interlocutor: Id) {
		super({
			interlocutor,
			history: []
		});
	}
	get interlocutor(): Id {
		return this.dto.interlocutor;
	}
}

export class ChannelConversation extends Conversation<ActiveChannelConversationDto> {
	banned: boolean = false;
	constructor(channel: string) {
		super({
			channel,
			history: []
		});
	}
	get channel(): string {
		return this.dto.channel;
	}
}

export class UserConversationList {
	convs: UserConversation[] = [];

	addMessage(message: ChatMessageDto, interlocutor?: Id): UserConversationList {
		const convInterlocutor = interlocutor ?? message.sender;
		let conv = this.convs.find((conv) => conv.dto.interlocutor == convInterlocutor);
		if (conv == undefined) {
			conv = new UserConversation(convInterlocutor);
			this.convs.push(conv);
		}
		conv.addMessage(message);
		return this;
	}

	receiveMessageFromServer(message: DMFromServer): UserConversationList {
		this.addMessage({
			sender: message.source,
			content: message.content,
			isMe: message.isMe ?? false
		});
		return this;
	}

	delete(userId: Id): UserConversationList {
		const i = this.convs.findIndex((conv) => conv.interlocutor == userId);
		if (i != -1) this.convs.splice(i, 1);
		return this;
	}
}

export class ChannelConversationList {
	convs: ChannelConversation[] = [];

	addMessage(message: ChatMessageDto, channel: string): ChannelConversationList {
		let conv = this.convs.find((conv) => conv.dto.channel == channel);
		if (conv == undefined) {
			conv = new ChannelConversation(channel);
			this.convs.push(conv);
		}
		conv.addMessage(message);
		// conv.dto.history.push(message);
		return this;
	}

	receiveMessageFromServer(message: CMFromServer): ChannelConversationList {
		this.addMessage(
			{
				sender: message.source,
				content: message.content,
				isMe: false
			},
			message.channel
		);
		return this;
	}

	create(channel: string): ChannelConversationList {
		if (this.convs.find((conv) => conv.dto.channel == channel) == undefined) {
			this.convs.push(new ChannelConversation(channel));
		}
		return this;
	}

	async getBanned(channel: string) {
		const i = this.convs.findIndex((conv) => conv.channel == channel);
		if (i == -1) return;
		this.convs[i].banned = true;
		await delay(1000);
		this.convs.splice(i, 1);
	}

	delete(channel: string): ChannelConversationList {
		const i = this.convs.findIndex((conv) => conv.channel == channel);
		if (i != -1) this.convs.splice(i, 1);
		return this;
	}
}

export const userConvs = writable(new UserConversationList());
export const channelConvs = writable(new ChannelConversationList());

export function updateChatHistory(convsHistory: UserHistoryDto) {
	userConvs.update((userConversationList) => {
		userConversationList.convs = [];
		for (const convDto of convsHistory.userHistory) {
			for (const messageDto of convDto.history) {
				userConversationList.addMessage(messageDto, convDto.interlocutor);
			}
		}
		return userConversationList;
	});

	channelConvs.update((channelConversationList) => {
		channelConversationList.convs = [];
		for (const convDto of convsHistory.channelHistory) {
			if (convDto.history.length == 0) channelConversationList.create(convDto.channel);
			for (const messageDto of convDto.history) {
				channelConversationList.addMessage(messageDto, convDto.channel);
			}
		}
		return channelConversationList;
	});
}
