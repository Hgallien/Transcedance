<script lang="ts">
	import { goto } from '$app/navigation';
	import { gameParams, redirectMainInvalidateGameParams } from '$lib/state';

	function play(classic: boolean) {
		if (!gameParams || !gameParams.startAGame) return redirectMainInvalidateGameParams();
		gameParams.classic = classic;
		gameParams.valid = true;
		if (gameParams?.matchMaking) goto('/WaitingRoom', { replaceState: true });
		else goto('/Play', { replaceState: true });
	}
</script>

<div id="gameModes">
	<div id="options">
		<h4><div on:click={() => play(true)}>Classic</div></h4>
		<h4><div on:click={() => play(false)}>Weird</div></h4>
	</div>
</div>

<style>
	#gameModes {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#options {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	h4 {
		font-size: 2em;
	}
	h4:hover {
		background-color: blue;
		width: 100%;
		text-align: center;
	}
</style>
