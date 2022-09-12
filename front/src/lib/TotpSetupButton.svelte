<script lang="ts">
	import { myself, disableTotp } from '$lib/state';
	import TotpSetup from '$lib/TotpSetup.svelte';

	let showTotpSetup = false;

	function enableTotp() {
		showTotpSetup = true;
	}
</script>

{#if !$myself.totpSecret}
	<button on:click={enableTotp}> enable 2fa </button>
{:else}
	<button on:click={disableTotp}> disable 2fa </button>
{/if}
<TotpSetup bind:show={showTotpSetup} />

<style>
	button {
		margin: 6px;
	}
</style>
