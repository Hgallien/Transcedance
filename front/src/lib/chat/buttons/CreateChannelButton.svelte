<script lang="ts">
	import Modal from '$lib/Modal.svelte';

	import CreateChannelModal from '../modals/CreateChannelModal.svelte';
	let show = false;
</script>

<img
	src="addGroup.png"
	alt="Create a channel"
	width="40px"
	height="40px"
	on:click={() => (show = true)}
/>

<Modal bind:show>
	<CreateChannelModal bind:show on:createChannel />
</Modal>

<style>
	img {
		float: right;
	}
</style>
