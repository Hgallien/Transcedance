<script lang="ts">
	import { getUser, myself } from '$lib/state';
	import type { ChatMessageDto } from 'backFrontCommon';

	export let message: ChatMessageDto;
	export let type: 'user' | 'channel';
	let sender = getUser(message.sender);
	let isMe = type == 'channel' ? message.sender == $myself.id : message.isMe!;
</script>

<article class={isMe ? 'user' : 'interlocutor'}>
	<span class="conv-entry">{message.content}</span>
	<br />
	{#if type == 'channel' && !isMe}
		<span>{$sender.name}</span>
	{/if}
</article>

<style>
	article {
		margin: 0.5em 0;
	}
	span {
		padding: 0.5em 1em;
		display: inline-block;
	}

	.interlocutor {
		text-align: left;
	}

	.interlocutor .conv-entry {
		background-color: #eee;
		border-radius: 1em 1em 1em 0;
	}

	.user {
		text-align: right;
		padding-right: 1em;
	}

	.user .conv-entry {
		background-color: #0074d9;
		color: white;
		border-radius: 1em 1em 0 1em;
		word-break: break-all;
	}
</style>
