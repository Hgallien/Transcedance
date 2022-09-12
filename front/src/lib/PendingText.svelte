<script lang="ts">
	export let tag: string;
	export let text: string | Promise<string>;
	const promisedText = Promise.resolve(text);
</script>

<svelte:element this={tag}>
	{#await promisedText}
		...
	{:then text}
		{text}
	{/await}
</svelte:element>

<style>
	* {
		color: rgb(144, 144, 144);
		font-size: smaller;
	}
</style>
