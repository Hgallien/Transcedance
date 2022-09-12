<script lang="ts">
	import Pong from '$lib/pong/Pong.svelte';
	import { gameParams, pongKeyForRefresh } from '$lib/state';

	let background = gameParams?.classic ? '/starsSky.png' : '/gameBackground.png';
</script>

<div id="Play" style="--background: url({background})">
	{#key $pongKeyForRefresh}
		<Pong />
	{/key}
</div>

<style>
	#Play {
		background-image: var(--background);
		transform: translateX();
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		background-size: cover;
		overflow: hidden;
	}
</style>
