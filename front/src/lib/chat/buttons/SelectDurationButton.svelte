<script lang="ts">
	import Modal from '$lib/Modal.svelte';
	import SelectDurationModal from '../modals/SelectDurationModal.svelte';

	export let source: string;
	let show: boolean = false;
</script>

<img src={source} alt="mute or ban user" on:click={() => (show = true)} width="30" height="30" />

<Modal bind:show>
	<SelectDurationModal bind:show on:selectDuration />
</Modal>
