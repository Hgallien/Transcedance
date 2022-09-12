<script lang="ts">
	import Modal from '$lib/Modal.svelte';

	import JoinChannelModal from '../modals/JoinChannelModal.svelte';

	let show = false;
</script>

<img
	src="joinChannel.png"
	alt="Create a channel"
	width="40px"
	height="40px"
	on:click={() => (show = true)}
/>
>

<Modal bind:show>
	<JoinChannelModal bind:show on:joinChannel />
</Modal>
