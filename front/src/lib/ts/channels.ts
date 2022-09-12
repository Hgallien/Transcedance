import { ChatEvent, ChatError, ChatFeedbackDto } from 'backFrontCommon';
import type { ClientToServerEvents } from 'backFrontCommon';
import { socket, updateChannel } from '$lib/state';
import { channelConvs } from '$lib/ts/chatUtils';

const channelAction = <Key extends keyof ClientToServerEvents>(event: Key) => {
	return <DTO extends Parameters<ClientToServerEvents[Key]>[0] & { channel: string }>(dto: DTO) => {
		const callback = (feedback: ChatFeedbackDto) => {
			if (feedback.success) {
				updateChannel(dto.channel);
			} else {
				alert(feedback.errorMessage);
				if (feedback.errorMessage == ChatError.CHANNEL_NOT_FOUND) {
					console.log('Heyo');
					channelConvs.update((c) => {
						c.delete(dto.channel);
						return c;
					});
				}
			}
		};
		socket!.emit(event, ...([dto, callback] as Parameters<ClientToServerEvents[Key]>));
	};
};
export const banUser = channelAction(ChatEvent.BAN_USER);
export const muteUser = channelAction(ChatEvent.MUTE_USER);
export const unMuteUser = channelAction(ChatEvent.UNMUTE_USER);
export const sendInviteToChannel = channelAction(ChatEvent.INVITE_TO_PRIVATE_CHANNEL);

// export type Len<ArrayType extends any[]> = ArrayType extends {length: infer L} ? L : never;
// export type ArgsFromDTO<DTO> = DTO extends undefined ? [] : [DTO]
// export type SocketIOArgs<DTO, Result> = [...ArgsFromDTO<DTO>, FeedbackCallbackWithResult<Result>];
// export type ParametersForKey<Key extends keyof ClientToServerEvents> = Parameters<ClientToServerEvents[Key]>;
// export type ArgsLenForKey<Key extends keyof ClientToServerEvents> = Len<ParametersForKey<Key>>;
// export type DTOForKey<Key extends keyof ClientToServerEvents> = ArgsLenForKey<Key> extends 1 ? undefined : ArgsLenForKey<Key> extends 2 ? ParametersForKey<Key>[0] : never;

// const request = <Key extends keyof ClientToServerEvents>(event: Key) => {
// 	return (...dtoArg: ArgsFromDTO<DTOForKey<Key>>) => {
// 		const callback = (feedback: ChatFeedbackDto) => {
// 			if (feedback.success) {

// 			} else {
// 				alert(feedback.errorMessage);
// 			}
// 		};
// 		socket!.emit(event, ...([...dtoArg, callback] as unknown as Parameters<ClientToServerEvents[Key]>));
// 	};
// };
