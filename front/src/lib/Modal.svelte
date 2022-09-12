<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { newModal, removeModal } from './ts/modals';

	export let show = false;
	$: {
		if (show) newModal(close);
		else removeModal(close);
	}

	let dispatch = createEventDispatcher();
	function close() {
		show = false;
		dispatch('close');
	}
</script>

{#if show}
	<div id="modal">
		<slot />
	</div>
{/if}

<style>
	#modal {
		position: fixed;
		z-index: 2;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #fff;
		filter: drop-shadow(0 0 20px #333);
		font-family: 'Lato', sans-serif;
	}
</style>
