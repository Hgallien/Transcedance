<script lang="ts">
	import { UserInfo } from 'backFrontCommon';
	import { getUser, storeMap } from '$lib/state';
	import DeStore from './DeStore.svelte';
	import ProfileParamHistory from './ProfileParamHistory.svelte';

	export let user: UserInfo;
</script>

<div>
	<hr width="200px" />
	<div id="statisticsLine">
		<div class="stats">
			<div id="classement">Classement</div>
			<div class="statsValue">
				#{user.ranking}
			</div>
		</div>
	</div>
	<hr width="200px" />
	{#each user.matchHistory as { opponent: opponentId, winner, score, opponentScore }}
		<div class="gameHistory">
			<DeStore
				component={ProfileParamHistory}
				slot="text"
				text={storeMap(getUser(opponentId), (opponent) => {
					return `Against ${opponent.name}: ${
						winner ? 'Victory' : 'Defeat'
					} (${score} - ${opponentScore})`;
				})}
			/>
		</div>
	{/each}
</div>

<style>
	#statisticsLine {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	.stats {
		display: flex;
		flex-direction: column;
	}
	.statsValue {
		font-weight: bolder;
	}
	.gameHistory {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	hr {
		margin: 2px 25px;
	}
</style>
