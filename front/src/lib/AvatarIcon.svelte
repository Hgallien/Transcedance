<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let imageURL: string | undefined;
	export let type: 'user' | 'channel';

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		dispatch('clickOnImage');
		event.stopPropagation();
	}
</script>

<img
	class="icon"
	class:user-icon={type == 'user'}
	src={imageURL}
	alt="contact"
	on:click={handleClick}
/>

<style>
	.icon {
		overflow: hidden;
		width: 60px;
		height: 60px;
		margin-left: 1%;
		margin-right: 2%;
		margin-top: auto;
		margin-bottom: auto;
	}

	.user-icon {
		-webkit-border-radius: 50%;
		border-radius: 50%;
		background-color: white;
	}
</style>
