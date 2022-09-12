<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let show: boolean;

	enum DurationUnit {
		SECOND = 'seconds',
		MINUTE = 'minutes',
		HOUR = 'hours'
	}
	const durations: [number, DurationUnit][] = [
		[1, DurationUnit.SECOND],
		[10, DurationUnit.SECOND],
		[1, DurationUnit.MINUTE],
		[2, DurationUnit.MINUTE],
		[5, DurationUnit.MINUTE],
		[10, DurationUnit.MINUTE],
		[30, DurationUnit.MINUTE],
		[1, DurationUnit.HOUR],
		[2, DurationUnit.HOUR],
		[3, DurationUnit.HOUR]
	];
	function durationUnitInSeconds(unit: DurationUnit): number {
		switch (unit) {
			case DurationUnit.SECOND:
				return 1;
			case DurationUnit.MINUTE:
				return 60;
			case DurationUnit.HOUR:
				return 3600;
		}
	}
	function durationInSeconds(quantity: number, unit: DurationUnit): number {
		return quantity * durationUnitInSeconds(unit);
	}
	// let mode: number;
	let durationIndex: string = '2';
	$: duration = durations[+durationIndex];

	function durationToString(quantity: number, unit: DurationUnit) {
		return `${quantity} ${quantity != 1 ? unit : unit.slice(0, -1)}`;
	}

	const dispatch = createEventDispatcher<{ selectDuration: number }>();
	function handleSubmit() {
		dispatch('selectDuration', durationInSeconds(...duration));
		show = false;
	}
</script>

<div id="mute-user-modal">
	<span>Duration</span>
	<div class="duration-selector">
		<input type="range" min="0" max={`${durations.length - 1}`} bind:value={durationIndex} />
		<span>{durationToString(...duration)}</span>
	</div>
	<button class="confirm-button" on:click={handleSubmit}>Confirm</button>
	<!-- {/if} -->
</div>

<style>
	#mute-user-modal {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	.duration-selector {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.confirm-button {
		margin-left: auto;
		margin-right: auto;
	}
</style>
