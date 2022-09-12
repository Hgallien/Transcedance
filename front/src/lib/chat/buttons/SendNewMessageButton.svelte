<script lang="ts">
	import Modal from '$lib/Modal.svelte';

	import SendNewMessageModal from '../modals/SendNewMessageModal.svelte';

	export let target: number | undefined = undefined;

	let show = false;
</script>

<div on:click={() => (show = true)}>
	<slot />
</div>

<Modal bind:show>
	<SendNewMessageModal bind:show bind:predefinedTarget={target} />
</Modal>
