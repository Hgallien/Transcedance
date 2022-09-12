<script lang="ts">
	import { sendGetLeaderboard } from '$lib/state';

	import { LeaderboardItemDto } from 'backFrontCommon';
	import { onMount } from 'svelte';

	let entries: LeaderboardItemDto[] = [];
	onMount(() => {
		sendGetLeaderboard().then((_) => (entries = _));
	});
</script>

<div id="leaderboard">
	<h1>Leaderboard</h1>
	<div id="leaderboard-entries-border">
		<div id="leaderboard-entries">
			<span>Rank</span>
			<span>Name</span>
			<span>Score</span>
			<span>Won</span>
			<span>Lost</span>
			{#each entries as entry, i}
				<span class="user-place numeric">{i + 1} </span>
				<span class="user-name">{entry.name}</span>
				<span class="user-score numeric">{entry.score}</span>
				<span class="user-victory-count">+ {entry.victory}</span>
				<span class="user-defeat-count">- {entry.defeat}</span>
			{/each}
		</div>
	</div>
</div>

<style>
	#leaderboard {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	#leaderboard-entries-border {
		background-color: white;
		padding: 1px;
	}

	#leaderboard-entries {
		font-family: 'Press start 2P';
		color: white;
		display: grid;
		grid-template-columns: 1fr 5fr 3fr 1fr 1fr;
		gap: 1px;
	}
	#leaderboard-entries > span {
		background-color: black;
		padding: 25px;
		overflow-x: hidden;
	}
	.user-name {
		color: #ff29ea;
		text-align: left;
	}
	.user-score {
		background-color: #fff047;
		text-align: right;
	}
	.user-victory-count {
		color: #03fc03;
		text-align: center;
	}
	.user-defeat-count {
		color: #fc3003;
		text-align: center;
	}
</style>
