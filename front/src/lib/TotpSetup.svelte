<script lang="ts">
	import { toDataURL } from 'qrcode';
	import { enableTotp } from '$lib/state';
	import { TOTP } from 'otpauth';
	import CodeDial from './CodeDial.svelte';
	import Modal from '$lib/Modal.svelte';

	export let show: boolean;
	const totp = new TOTP({
		issuer: 'Transcendance',
		label: '2fa'
	});
	let totpQrCode: Promise<string> = toDataURL(totp.toString());

	let code: string;

	function submit(token: string) {
		const success = totp.validate({ token }) == 0;
		if (success) {
			enableTotp(totp.secret.hex);
			show = false;
		} else code = '';
	}
</script>

<Modal bind:show>
	{#await totpQrCode then dataUrl}
		<img src={dataUrl} alt="qrcode to flash" />
	{/await}

	<CodeDial {submit} bind:code />
</Modal>
