<script lang="ts">
	import { sendChangeName } from './state';

	export let name: string;

	let nameField: string = name;
	let changeName = false;

	function confirmChange() {
		name = nameField;
		sendChangeName({ name });
		changeName = false;
	}
</script>

{#if !changeName}
	<h1 on:click={() => (changeName = true)}>{name}</h1>
{:else}
	<div>
		<input bind:value={nameField} placeholder={name} />
		<img src="check.png" alt="confirm new name" width="30" height="30" on:click={confirmChange} />
	</div>
{/if}
