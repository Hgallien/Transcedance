<script lang="ts">
	import { ChannelCategory, ChannelInfo, ChannelRights, ChannelUser } from 'backFrontCommon';
	import type { Id } from 'backFrontCommon';
	import SelectDurationButton from './buttons/SelectDurationButton.svelte';
	import { banUser, muteUser, sendInviteToChannel, unMuteUser } from '$lib/ts/channels';
	import UserMiniature from '$lib/UserMiniature.svelte';
	import {
		sendDeleteChannel,
		sendLeaveChannel,
		sendSetNewAdminToServer,
		sendUnbanUser,
		myself
	} from '$lib/state';
	import { beforeUpdate } from 'svelte';
	import UserName from './UserName.svelte';
	import PositiveIntegerInput from './PositiveIntegerInput.svelte';

	export let channel: string;
	export let channelInfo: ChannelInfo;

	let me: ChannelUser | undefined;
	let others: ChannelUser[];

	let inviteUserInvalid: boolean;
	let inviteUserId: number;

	beforeUpdate(() => {
		const i = channelInfo.users.findIndex((user) => user.id == $myself.id);
		if (i != -1) {
			me = channelInfo.users[i];
			others = channelInfo.users.filter((_, j) => j != i);
		} else {
			others = [...channelInfo.users];
		}
	});

	function channelRightsString(rights: ChannelRights): string {
		switch (rights) {
			case ChannelRights.OWNER:
				return 'Owner';
			case ChannelRights.ADMIN:
				return 'Admin';
			case ChannelRights.USER:
				return 'A simple user';
		}
	}

	function onMuteUser(userId: Id, duration: number) {
		muteUser({
			channel,
			target: userId,
			duration
		});
	}
	function onUnMuteUser(userId: Id) {
		unMuteUser({
			channel,
			target: userId
		});
	}
	function onBanUser(userId: Id, duration: number) {
		banUser({
			channel,
			target: userId,
			duration
		});
	}
	function onInviteUser() {
		if (inviteUserInvalid) return;
		sendInviteToChannel({ channel, target: inviteUserId });
	}
</script>

<div id="channel-details">
	<!-- Myself -->
	{#if me}
		<p id="channelRights">You are {channelRightsString(me.rights)}</p>
		{#if me.muted}
			<p>You are currently muted</p>
		{/if}
	{:else}
		<p>You are not in this channel</p>
	{/if}

	<!-- Other users -->
	{#each others as user}
		<div class="channel-details-user">
			<!-- User Info -->
			<UserMiniature userId={user.id} />
			<UserName userId={user.id} />
			<p id="rights">{channelRightsString(user.rights)}</p>

			<!-- Actions on User -->
			{#if me?.rights != ChannelRights.USER}
				{#if !user.muted}
					<SelectDurationButton
						source="muteIcon.png"
						on:selectDuration={(event) => onMuteUser(user.id, event.detail)}
					/>
				{:else}
					<img
						src="unmuteIcon.png"
						alt="unmute"
						width="30"
						height="30"
						on:click={() => onUnMuteUser(user.id)}
					/>
				{/if}
				<SelectDurationButton
					source="banIcon.png"
					on:selectDuration={(event) => onBanUser(user.id, event.detail)}
				/>
				{#if user.rights == ChannelRights.USER}
					<button on:click={() => sendSetNewAdminToServer({ channel, target: user.id })}
						>Set Admin</button
					>
				{/if}
			{/if}
		</div>
	{/each}

	<!-- Banned Users -->
	{#if me?.rights != ChannelRights.USER}
		<div class="channel-details-users">
			{#each channelInfo.bannedUsers as userId}
				<div class="channel-details-user banned">
					<UserMiniature {userId} />
					<UserName {userId} />
					<button on:click={() => sendUnbanUser({ channel, target: userId })}>Unban</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Actions on Channel -->
	{#if channelInfo.channelType == ChannelCategory.PRIVATE}
		<div id="invite-user">
			<span id="invite-user-text">Invite user</span>
			<div id="invite-user-input-and-button">
				<div id="invite-user-input">
					<PositiveIntegerInput
						placeholder="User Id"
						bind:invalid={inviteUserInvalid}
						bind:value={inviteUserId}
					/>
				</div>
				<button id="invite-user-button" on:click={onInviteUser}>Send</button>
			</div>
		</div>
	{/if}
	<button id="leave-button" on:click={() => sendLeaveChannel({ channel })}>Leave Channel</button>
	{#if me?.rights == ChannelRights.OWNER}
		<button id="delete-button" on:click={() => sendDeleteChannel({ channel })}
			>Delete channel</button
		>
	{/if}
</div>

<style>
	#channel-details {
		display: flex;
		flex-direction: column;
		width: 50vw;
		color: rgb(136, 172, 255);
		overflow: auto;
		justify-content: center;
	}
	#channelRights {
		text-align: center;
		color: rgb(104, 134, 240);
	}
	#rights {
		width: 10vw;
	}
	.channel-details-user {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
	}
	.banned {
		opacity: 0.7;
	}
	#delete-button {
		background-color: #a80a2f;
	}
	#invite-user {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	#invite-user-text {
		margin-right: auto;
	}
	#invite-user-input-and-button {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-left: auto;
		width: 50%;
	}
	#invite-user-input {
		width: 80%;
	}
	button {
		margin-left: 10px;
		margin-right: 10px;
	}
</style>
