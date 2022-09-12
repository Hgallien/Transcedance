<script lang="ts">
	import Modal from '$lib/Modal.svelte';
	import AvailableChannelModal from '../modals/AvailableChannelModal.svelte';

	let show = false;
</script>

<button on:click={() => (show = true)}>Available channels</button>

<Modal bind:show>
	<AvailableChannelModal />
</Modal>
