<script lang="ts">
	import { beforeUpdate, afterUpdate } from 'svelte';
	import ConversationEntry from './ConversationEntry.svelte';
	import { ChannelConversation } from '$lib/ts/chatUtils';
	import { sendChannelMessage } from '$lib/state';

	export let conversation: ChannelConversation;

	let div: HTMLDivElement;
	let autoscroll: boolean;

	beforeUpdate(() => {
		autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);
	});

	function handleKeydown(event: KeyboardEvent) {
		const inputElement = event.target as HTMLInputElement;
		if (event.key === 'Enter') {
			const text = inputElement.value;
			inputElement.value = '';
			if (!text) return;

			sendChannelMessage({
				channel: conversation.dto.channel,
				content: text
			});
		}
	}
</script>

<div class="chat">
	<div id="title">
		<h2>{conversation.channel}</h2>
	</div>
	<div class="scrollable" bind:this={div}>
		{#each conversation.history as message}
			<ConversationEntry {message} type={'channel'} />
		{/each}
	</div>

	<input on:keydown={handleKeydown} />
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 50vh;
		font-family: 'Lato', sans-serif;
		width: 500px;
	}

	.scrollable {
		flex: 1 1 auto;
		border-top: 1px solid #eee;
		margin: 0 0 0.5em 0;
		overflow-y: auto;
		overflow-x: hidden;
	}

	#title {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 0.5vw;
	}
	h2 {
		font-family: 'Lato', sans-serif;
		font-size: 1.5em;
	}
</style>
