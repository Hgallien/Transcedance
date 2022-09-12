<script lang="ts">
	import { onDestroy } from 'svelte';
	export let component: any;

	let props: any = {};
	const unsubscribers: (() => void)[] = [];

	Object.entries($$restProps).map(([k, v]) => {
		if (typeof v?.subscribe == 'function')
			unsubscribers.push(v.subscribe((x: any) => (props[k] = x)));
		else props[k] = v;
	});

	onDestroy(() => unsubscribers.forEach((u) => u()));
</script>

<svelte:component this={component} {...props} />
