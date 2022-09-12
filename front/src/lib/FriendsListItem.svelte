<script lang="ts">
	import GameInviteButton from './chat/buttons/GameInviteButton.svelte';
	import UserMiniature from './UserMiniature.svelte';
	import type { UserInfo } from 'backFrontCommon';

	export let friend: UserInfo;
</script>

<div class="friend">
	<UserMiniature userId={friend.id} />
	<p class="name">{friend.name}</p>
	<GameInviteButton user={friend} />
</div>

<style>
	.friend {
		width: 80vw;
		height: 70px;
		background: #05053d;
		display: flex;
		align-items: center;
		border: 1px solid #a80a2f;
	}

	.name {
		color: #a80a2f;
	}
</style>
