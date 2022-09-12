<script lang="ts">
	import UserMiniature from '$lib/UserMiniature.svelte';
	import type { Id } from 'backFrontCommon';
	import AddFriendButton from './buttons/AddFriendButton.svelte';
	import UserName from './UserName.svelte';

	export let friends: Id[];
</script>

<div id="online-friends">
	<div id="online">
		<!-- <br> -->
		<div class="title-line">
			<span class="title-element">Friends</span>
			<div class="title-element"><AddFriendButton /></div>
		</div>
		<!-- <br> -->
	</div>
	{#if friends.length > 0}
		<div class="onlineFriends">
			{#each friends as userId}
				<div class="one-friend">
					<UserMiniature {userId} />
					<UserName {userId} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.onlineFriends {
		width: 80vw;
		display: flex;
		overflow-x: auto;
	}

	#online {
		color: #fa1ec7;
	}

	#online-friends {
		width: 80vw;
		background: #12072e;
	}

	.title-line {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.title-element {
		margin: 10px;
	}

	.one-friend {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		row-gap: 15px;
		padding: 15px;
		color: #fa1ec7;
	}
</style>
