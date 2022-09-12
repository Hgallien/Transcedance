<script lang="ts">
	export let code: string = '';

	export const CODE_LENGTH = 6;

	export let submit: (code: string) => void;

	function updateCode(ev: KeyboardEvent) {
		if (ev.key == 'Backspace') code = code.slice(0, code.length - 1);

		if (code.length == CODE_LENGTH) return;

		if (ev.key.match(/^\d$/)) {
			code = code + ev.key;
			if (code.length == CODE_LENGTH) submit(code);
		}
	}
</script>

<svelte:window on:keydown={updateCode} />

<h1>{code.padEnd(CODE_LENGTH, '_').split('').join(' ')}</h1>
