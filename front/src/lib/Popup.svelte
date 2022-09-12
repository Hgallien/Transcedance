<script lang="ts">
	import { onMount } from 'svelte';
	import { popupMethods, type CanBePopup } from './ts/popups';

	export let popup: CanBePopup;

	let acceptButton: HTMLButtonElement;
	let closeButton: HTMLButtonElement;
	onMount(() => {
		if (popup.hasButton && popup.onAccept) {
			acceptButton.onclick = popup.onAccept.bind(popup);
		}
		closeButton.onclick = () => {
			if (popup.onClose) popup.onClose();
			popupMethods.removePopup(popup);
		};
	});
</script>

<div class="alert {popup.popupCategory}">
	{popup.text}
	{#if popup.hasButton}
		<button type="button" bind:this={acceptButton}>{popup.buttonLabel}</button>
	{/if}
	<button type="button" aria-label="Close" bind:this={closeButton}>
		<span aria-hidden="true">&times;</span>
	</button>
</div>

<style>
	.alert {
		margin-bottom: 5px;
	}

	.alert-warning {
		background-color: #fff3cd;
	}

	.alert-error {
		background-color: #f8d7da;
	}
</style>
