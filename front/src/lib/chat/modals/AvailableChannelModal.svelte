<script lang="ts">
	import { sendJoinChannel, socket } from '$lib/state';
	import { ChannelSummary, GetInfoEvent, RequestFeedbackDto } from 'backFrontCommon';
	import { readable, type Readable } from 'svelte/store';

	let summaries: ChannelSummary[] = [];
	let inChannelArray: Readable<boolean>[];

	socket!.emit(GetInfoEvent.GET_CHANNELS_LIST, (feedback: RequestFeedbackDto<ChannelSummary[]>) => {
		console.log(JSON.stringify(feedback));
		if (feedback.success) {
			summaries = feedback.result!;
			inChannelArray = summaries.map(({ inChan }) => readable(inChan));
		} else console.error('could not get channels list');
	});
	function handleJoin(summary: ChannelSummary) {
		sendJoinChannel({ channel: summary.channel }).then(() => {
			summary.inChan = true;
			summaries = summaries;
		});
	}
</script>

<div id="available-channels">
	{#each summaries as summary, i}
		<span>{summary.channel}</span>
		{#if summary.inChan}
			<span>Already registered</span>
		{:else}
			<button on:click={() => handleJoin(summary)}>Join</button>
		{/if}
	{/each}
</div>

<style>
	#available-channels {
		display: grid;
		grid-template-columns: 9fr 1fr;
		width: 30vw;
	}
</style>
