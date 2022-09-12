<script lang="ts">
	import Modal from '$lib/Modal.svelte';

	import AddFriendModal from '../modals/AddFriendModal.svelte';

	let show = false;
</script>

<img
	src="add-button.png"
	alt="add friend"
	width="25px"
	height="25px"
	on:click={() => (show = true)}
/>

<Modal bind:show>
	<AddFriendModal bind:show />
</Modal>
