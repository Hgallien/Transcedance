<script lang="ts">
	// import GameInvit from '$lib/chat/modals/GameInviteModal.svelte';
	import { beforeUpdate, afterUpdate } from 'svelte';
	import ConversationEntry from './ConversationEntry.svelte';
	import BlockUserButton from '../buttons/BlockUserButton.svelte';
	import GameInviteButton from '../buttons/GameInviteButton.svelte';
	import { getUser, sendDirectMessage } from '$lib/state';
	import { UserConversation } from '$lib/ts/chatUtils';

	export let conversation: UserConversation;
	let interlocutor = getUser(conversation.interlocutor);

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
			const content = inputElement.value;
			inputElement.value = '';
			if (!content) return;

			sendDirectMessage({
				target: conversation.dto.interlocutor,
				content
			});
		}
	}
</script>

<!-- to refacto -->
<div class="chat">
	<div id="title">
		<h2>{$interlocutor.name}</h2>
		<div id="options">
			<BlockUserButton user={$interlocutor} />
			<GameInviteButton user={$interlocutor} />
		</div>
	</div>
	<div class="scrollable" bind:this={div}>
		{#each conversation.history as message}
			<ConversationEntry {message} type={'user'} />
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

	#options {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12px;
	}
	h2 {
		font-family: 'Lato', sans-serif;
		font-size: 1.5em;
	}
</style>
