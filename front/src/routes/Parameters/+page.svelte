<script lang="ts">
	import { myself, disconnect, sendUnblockUser } from '$lib/state';
	import TotpSetupButton from '$lib/TotpSetupButton.svelte';
	import ProfileParams from '$lib/ProfileParams.svelte';
	import UserMiniature from '$lib/UserMiniature.svelte';
	import UserName from '$lib/chat/UserName.svelte';
</script>

<div id="app">
	<ProfileParams avatar={$myself.avatar} name={$myself.name} />
	<div id="blockedProfiles">
		{#each $myself.blocked as userId}
			<div class="blockedEntry">
				<UserMiniature {userId} />
				<UserName {userId} />
				<button class="unblockButton" on:click={() => sendUnblockUser({ target: userId })}>
					unblock
				</button>
			</div>
		{/each}
	</div>
	<div id="lastParams">
		<TotpSetupButton />
		<button id="disco" on:click={disconnect}> Disconnect </button>
	</div>
</div>

<style>
	* {
		font-family: 'Lato', sans-serif;
		color: #06bcff;
	}
	#app {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	#blockedProfiles {
		width: 50vw;
		overflow-x: hidden;
		overflow-y: auto;
		height: 600px;
		border: 1px solid #ff00b8;
		display: flex;
		flex-direction: column;
	}
	.blockedEntry {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.unblockButton {
		margin-left: auto;
	}
	button {
		margin: 20px;
	}
	#lastParams {
		width: 50vw;
		height: 80px;
		border: 1px solid #ff00b8;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	#disco {
		float: right;
		width: 150px;
		height: 30px;
	}
</style>
