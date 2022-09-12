<script lang="ts">
	import { goto } from '$app/navigation';

	import { invalidateGameParams, setGameParams } from '$lib/state';
	import { onMount } from 'svelte';

	onMount(invalidateGameParams);

	function playGame(online: boolean, observe?: boolean, matchMaking?: boolean) {
		setGameParams({
			online,
			observe,
			matchMaking,
			valid: false,
			startAGame: true
		});
		goto('/ChooseGameMode');
	}
</script>

<div id="main">
	<div id="startGame">
		<h4><div on:click={() => playGame(true, false, true)}>Play Online</div></h4>
		<h4><div on:click={() => playGame(false)}>Play Offline</div></h4>
		<h4><a href="/Leaderboard"> Leaderboard </a></h4>
	</div>
</div>

<style>
	#main {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#startGame {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	h4 {
		font-size: 1.7em;
	}
	h4:hover {
		background-color: blue;
		width: 100%;
		text-align: center;
	}

	a {
		all: unset;
	}
</style>
