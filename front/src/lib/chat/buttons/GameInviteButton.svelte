<script lang="ts">
	import GameInviteModal from '../modals/GameInviteModal.svelte';
	import type { UserInfo } from 'backFrontCommon';
	import Modal from '$lib/Modal.svelte';

	let show = false;
	export let user: UserInfo;
</script>

<img
	on:click={() => (show = true)}
	class="play"
	src="joystick.png"
	alt="play"
	width="40px"
	height="40px"
/>

<Modal bind:show>
	<GameInviteModal bind:show {user} />
</Modal>

<style>
	.play {
		margin-left: auto;
		padding: 5%;
	}
</style>
