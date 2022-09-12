<script lang="ts">
	import type { UserInfo } from 'backFrontCommon';
	import { sendBlockUser } from '$lib/state';

	export let user: UserInfo;
	export let show = false;

	function handleBlockUser() {
		sendBlockUser({ target: user.id });
		show = false;
	}
	function handleClose() {
		show = false;
	}
</script>

<div>
	<h4>Confirm blocking user {user.name} ?</h4>
	<div>
		<button on:click={handleBlockUser}>Yes</button>
		<button on:click={handleClose}>Cancel</button>
	</div>
</div>
