<script lang="ts">
	import ConversationListItem from './ConversationListItem.svelte';
	import { getUser, getUserNow, storeMap } from '$lib/state';
	import { userConvs, channelConvs } from '$lib/ts/chatUtils';
	import ChannelBox from '$lib/chat/conversationBoxes/ChannelConvBox.svelte';
	import UserMiniature from '$lib/UserMiniature.svelte';
	import ConversationListItemText from './ConversationListItemText.svelte';
	import ConversationBox from './conversationBoxes/UserConvBox.svelte';
	import ChannelMiniature from '$lib/chat/ChannelMiniature.svelte';
	import DeStore from '$lib/DeStore.svelte';
	import AvailableChannelButton from './buttons/AvailableChannelButton.svelte';
</script>

<div>
	<br />
	<span class="header">User conversations</span>
	{#each $userConvs.convs as conversation (conversation.interlocutor)}
		<ConversationListItem bind:hasNewMessage={conversation.hasNewMessage}>
			<UserMiniature slot="icon" userId={conversation.interlocutor} />
			<DeStore
				component={ConversationListItemText}
				slot="item-text"
				text={storeMap(getUser(conversation.interlocutor), (user) => user.name)}
			/>
			<ConversationBox slot="conversation-modal" {conversation} />
		</ConversationListItem>
	{/each}
	<br />
	<br />
	<div id="channel-convs-header" class="header">
		<span>Channel conversations</span>
		<AvailableChannelButton />
	</div>
	{#each $channelConvs.convs as conversation (conversation.channel)}
		<ConversationListItem
			bind:hasNewMessage={conversation.hasNewMessage}
			bannedFromChannel={conversation.banned}
		>
			<ChannelMiniature channel={conversation.channel} slot="icon" />
			<ConversationListItemText slot="item-text" text={conversation.channel} />
			<ChannelBox slot="conversation-modal" {conversation} />
		</ConversationListItem>
	{/each}
</div>

<style>
	.header {
		display: block;
		color: #fa1ec7;
		padding: 10px;
		width: 80vw;
		background: #12072e;
	}

	#channel-convs-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
</style>
