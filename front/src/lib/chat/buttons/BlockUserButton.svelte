<script lang="ts">
	import Modal from '$lib/Modal.svelte';

	import type { UserInfo } from 'backFrontCommon';
	import BlockUserModal from '../modals/BlockUserModal.svelte';

	export let user: UserInfo;

	let show = false;
</script>

<img
	src="blockingIcon.png"
	alt="block user"
	width="25px"
	height="25px"
	on:click={() => (show = true)}
/>

<Modal bind:show>
	<BlockUserModal bind:show {user} />
</Modal>
