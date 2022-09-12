<script lang="ts">
	import Popup from './Popup.svelte';
	import { popups } from '$lib/ts/popups';
</script>

<div id="game-invite-popups">
	{#each $popups as popup}
		<Popup {popup} />
	{/each}
</div>

<style>
	#game-invite-popups {
		position: absolute;
		display: flex;
		flex-direction: column;
		right: 0;
		top: 0;
	}
</style>
