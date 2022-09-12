<script lang="ts">
	import { sendFriendInvite } from '$lib/state';
	import PositiveIntegerInput from '../PositiveIntegerInput.svelte';

	export let show: boolean = false;
	let target: number;
	let invalidTarget: boolean;

	function handleSubmit() {
		if (invalidTarget) return;
		sendFriendInvite({ target });
		show = false;
	}
</script>

<form id="addNewFriend" on:submit|preventDefault={handleSubmit}>
	Add a friend
	<PositiveIntegerInput
		placeholder="Friend's ID:"
		bind:value={target}
		bind:invalid={invalidTarget}
	/>
	<br />
	<div>
		<input type="submit" value="Add" />
		<button on:click={() => (show = false)}>Cancel</button>
	</div>
</form>

<style>
	form {
		overflow: hidden;
	}
</style>
