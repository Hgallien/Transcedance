<script lang="ts">
	import { onMount } from 'svelte';

	export let value: number = 0;
	export let placeholder: string;
	export let invalid = false;
	let content = '';
	$: {
		if (!invalid) value = +content;
	}
	let inputElement: HTMLInputElement;
	onMount(() => {
		inputElement.focus();
	});

	function handleBlur(_event: FocusEvent) {
		content = content.trim();
		if (content != '0') content = content.replace(/^0*/g, '');
	}

	function handleInput() {
		invalid = !content.match(/^\s*\d*\s*$/);
		// content = content.replaceAll(/\D/g, '');
	}
</script>

<input
	{placeholder}
	contenteditable="true"
	bind:value={content}
	on:blur={handleBlur}
	on:input={handleInput}
	required
	bind:this={inputElement}
/>
{#if invalid}
	<span id="invalid-id">Input should be a positive integer</span>
{/if}

<style>
	input {
		width: 100%;
	}
	#invalid-id {
		color: red;
		font-size: 12px;
	}
</style>
