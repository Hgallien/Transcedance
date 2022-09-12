<script lang="ts">
	import { getUser } from '$lib/state';

	export let userId: number;

	const user = getUser(userId);
</script>

<span>{$user.name}</span>

<style>
	span {
		margin: 8px;
	}
</style>
