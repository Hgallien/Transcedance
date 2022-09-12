<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ClientGameContextOnlineObserver,
		ClientGameContextOffline,
		ClientGameContextOnlinePlayer,
		ClientGameContextOnline,
		ClientGameContext
	} from 'pong';
	import { goto } from '$app/navigation';
	import {
		socket,
		gameParams,
		redirectMainInvalidateGameParams,
		invalidateGameParams
	} from '$lib/state';
	import { delay } from 'pong/common/utils';

	const online = gameParams!.online;
	const observe = gameParams!.observe ?? false;
	const classic = gameParams!.classic ?? false;

	let gameIsOver: boolean = false;
	let gameOverText: string;
	let gameOverScoreDisplay: string;

	onMount(() => {
		const onFinish = (score1: number, score2: number) => {
			const winner = score1 >= score2 ? 0 : 1;
			if ((online && observe) || !online) {
				gameOverText = `The winner is Player ${winner + 1}`;
				gameOverScoreDisplay = `${score1} - ${score2}`;
			} else {
				const playerId = (ctx as ClientGameContextOnlinePlayer).playerId!;
				gameOverText = winner == playerId ? 'You won !' : 'You lost, like a looser :(';
				let sideStrings = ['You', 'Opponent'];
				if (playerId == 1) sideStrings = [sideStrings[1], sideStrings[0]];
				gameOverScoreDisplay = `(${sideStrings[0]}) ${score1} - ${score2} (${sideStrings[1]})`;
			}
			gameIsOver = true;
			delay(5000).then(redirectMainInvalidateGameParams);
		};
		const onError = (message: string) => {
			alert(message);
			delay(1000).then(redirectMainInvalidateGameParams);
		};

		let ctx: ClientGameContext;
		if (online) {
			if (observe) ctx = new ClientGameContextOnlineObserver(socket!, onFinish, onError);
			else ctx = new ClientGameContextOnlinePlayer(socket!, onFinish, onError);
		} else ctx = new ClientGameContextOffline(onFinish, classic);
		ctx.animate();
		ctx.startGame();

		return () => {
			if (!gameIsOver) {
				ctx.exitGame();
			}
		};
	});
</script>

<div id="game-container">
	{#if !gameIsOver}
		<canvas id="game-background" />
		<canvas id="game-screen" />
	{:else}
		<div id="gameover-screen">
			<h1 class="gameover-font">Game Over</h1>
			<h2 class="gameover-font">{gameOverText}</h2>
			<h2 class="gameover-font">{gameOverScoreDisplay}</h2>
		</div>
	{/if}
</div>

<style>
	#game-container {
		width: 67%;
		height: 67%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#game-background {
		position: absolute;
		z-index: 1;
	}
	#game-screen {
		position: absolute;
		z-index: 2;
	}
	#gameover-screen {
		position: absolute;
		display: flex;
		flex-direction: column;
		text-align: center;
		column-gap: 10px;
	}
	h1 {
		font-size: 2.5em;
	}
	h2 {
		font-size: 2em;
	}
	.gameover-font {
		color: rgb(251, 251, 0);
		-webkit-text-stroke: 2px #ff8400;
		text-shadow: 6px 6px 6px purple, 6px 6px 6px purple;
	}
</style>
