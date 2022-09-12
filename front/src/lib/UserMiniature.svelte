<script lang="ts">
	import Profile from '$lib/Profile.svelte';
	import Modal from '$lib/Modal.svelte';
	import AvatarIcon from '$lib/AvatarIcon.svelte';
	import { getUser } from '$lib/state';

	export let userId: number;

	const user = getUser(userId);
	let showProfile = false;
</script>

<div class="icon-wrapper">
	<div class="icon">
		<div class="avatar">
			<AvatarIcon
				type={'user'}
				imageURL={$user.avatar ?? 'errorUser.png'}
				on:clickOnImage={() => (showProfile = true)}
			/>
		</div>
		<div class="dot" class:green={$user.isOnline} class:red={!$user.isOnline} />
	</div>
</div>
<Modal bind:show={showProfile}>
	<Profile user={$user} />
</Modal>

<style>
	.icon-wrapper {
		position: static;
	}
	.icon {
		position: relative;
	}
	.avatar {
		width: 100%;
		height: 100%;
	}
	.dot {
		position: absolute;
		right: 0;
		bottom: 0;
		height: 20%;
		width: 20%;
		border-radius: 50%;
		display: inline-block;
	}
	.green {
		background-color: #70bf47;
	}
	.red {
		background-color: #ee6b60;
	}
</style>
