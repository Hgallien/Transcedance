<script lang="ts">
	import Modal from '$lib/Modal.svelte';
	import NotificationIcon from './NotificationIcon.svelte';

	export let hasNewMessage: boolean = false;
	export let bannedFromChannel: boolean = false;

	let showConv = false;
	let thisRef: any;

	function handleClickOpenModal(event: MouseEvent) {
		if (event.target == thisRef) showConv = true;
	}

	$: {
		if (hasNewMessage && showConv) hasNewMessage = false;
	}
</script>

<div class="line" class:bannedFromChannel bind:this={thisRef} on:click={handleClickOpenModal}>
	<div class="item">
		<slot name="icon" />
	</div>
	<div class="item">
		<slot name="item-text" class="item" />
	</div>
	{#if hasNewMessage}
		<div id="notification-icon" class="item">
			<NotificationIcon />
		</div>
	{/if}
</div>

<Modal bind:show={showConv}>
	<slot name="conversation-modal" />
</Modal>

<style>
	.line {
		align-items: center;
		padding: 10px;
		width: 80vw;
		height: 50px;
		background: #040128;
		display: flex;
		border: 1px solid #ff00b8;
	}
	.item {
		padding: 10px;
	}
	.bannedFromChannel {
		background: #a80a2f;
	}
	#notification-icon {
		margin-left: auto;
	}
</style>
