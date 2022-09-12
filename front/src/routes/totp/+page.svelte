<script lang="ts">
	import { sendTotpToken } from '$lib/state';
	import CodeDial from '$lib/CodeDial.svelte';
</script>

<h1>2FA Code</h1>
<CodeDial submit={sendTotpToken} />
