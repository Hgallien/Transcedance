<script lang="ts">
	import { sendDirectMessage } from '$lib/state';
	import { onMount } from 'svelte';
	import PositiveIntegerInput from '../PositiveIntegerInput.svelte';

	export let content = '';
	export let show = false;
	export let predefinedTarget: number | undefined = undefined;
	let target: number;
	if (predefinedTarget !== undefined) target = predefinedTarget;
	let invalidTarget: boolean;
	let messageArea: HTMLTextAreaElement;

	function handleSubmit() {
		if (invalidTarget) return;
		sendDirectMessage({ target, content });
		show = false;
		return true;
	}
	onMount(() => {
		if (predefinedTarget !== undefined) {
			messageArea.focus();
		}
	});
</script>

<form id="formContainer" on:submit|preventDefault={handleSubmit}>
	{#if predefinedTarget === undefined}
		<div id="destinataire">
			<PositiveIntegerInput
				placeholder="ID of the target user:"
				bind:value={target}
				bind:invalid={invalidTarget}
			/>
		</div>
	{/if}
	<br />
	<textarea
		id="message"
		type="text"
		placeholder="Type a message..."
		bind:value={content}
		bind:this={messageArea}
	/>
	<button>
		<img id="btn-send-msg" src="send.png" alt="send message" />
	</button>
</form>

<style>
	#formContainer {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 30vw;
	}

	#destinataire {
		width: 100%;
	}
	#message {
		width: 100%;
		height: 5em;
	}
	#btn-send-msg {
		width: 2em;
		height: 2em;
	}
	textarea {
		resize: none;
	}
</style>
