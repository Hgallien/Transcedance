<script lang="ts">
	import Switch from '$lib/Switch.svelte';
	import type { UserInfo } from 'backFrontCommon';
	import * as gameInvite from '$lib/ts/gameInvite';

	export let show = false;
	export let user: UserInfo;

	let mode: number;

	function sendInvite() {
		gameInvite.send({ target: user.id, classic: mode == 0 });
		show = false;
	}
</script>

<div id="invitation">
	<Switch options={['Classic Mode', 'WeIrD Mode']} bind:mode />
	<button on:click={sendInvite}>
		Invit {user.name} to play
	</button>
</div>

<style>
	#invitation {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;
		padding: 15px;
	}
</style>
