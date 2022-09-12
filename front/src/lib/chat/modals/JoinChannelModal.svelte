<script lang="ts">
	import { sendJoinChannel } from '$lib/state';
	export let show = false;

	let channelName: string = '';
	let password: string | undefined;

	function handleSubmit() {
		show = false;
		sendJoinChannel({
			channel: channelName,
			password
		});
	}

	function handleBlur() {
		channelName = channelName.trim();
	}
</script>

<form id="joinChannel" on:submit|preventDefault={handleSubmit}>
	<input
		id="channelName"
		placeholder="Channel Name"
		bind:value={channelName}
		on:blur={handleBlur}
		required
	/>
	<input bind:value={password} placeholder="Optionnal password" />
	<input type="submit" value="Join channel" />
</form>

<style>
	#joinChannel {
		display: flex;
		flex-direction: column;
		width: 250px;
		gap: 20px;
		padding: 10px;
	}
</style>
