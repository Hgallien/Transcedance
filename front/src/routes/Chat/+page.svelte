<script lang="ts">
	import OnlineFriends from '$lib/chat/OnlineFriends.svelte';
	import ConversationLists from '$lib/chat/ConversationLists.svelte';
	import CreateChannelButton from '$lib/chat/buttons/CreateChannelButton.svelte';
	import SendNewMessageButton from '$lib/chat/buttons/SendNewMessageButton.svelte';
	import JoinChannelButton from '$lib/chat/buttons/JoinChannelButton.svelte';
	import { myself, getUser } from '$lib/state';
	import { channelConvs } from '$lib/ts/chatUtils';
	import AvatarIcon from '$lib/AvatarIcon.svelte';
	import Modal from '$lib/Modal.svelte';
	import Profile from '$lib/Profile.svelte';

	$myself.channels.forEach((channel) => {
		$channelConvs.create(channel);
	});

	const myUser = getUser($myself.id);

	let showMyProfile: boolean = false;
</script>

<div id="header">
	<AvatarIcon
		type={'user'}
		imageURL={$myself.avatar ?? 'errorUser.png'}
		on:clickOnImage={() => (showMyProfile = true)}
	/>
</div>
<Modal bind:show={showMyProfile}>
	<Profile user={$myUser} />
</Modal>

<div id="chat">
	<div id="title">
		<h1>Chat</h1>
		<div id="options">
			<CreateChannelButton />
			<JoinChannelButton />
			<SendNewMessageButton>
				<img id="btn-new-message" src="pencil.png" width="40" height="40" alt="write msg" />
			</SendNewMessageButton>
		</div>
	</div>

	<div id="mainContainer">
		<OnlineFriends friends={$myself.friendlist} />
		<br />
		<ConversationLists />
	</div>
</div>

<style>
	* {
		font-family: 'Press Start 2P';
	}

	#chat {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	#title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-left: 10vw;
		margin-right: 10vw;
	}

	#options {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 20px;
	}

	#mainContainer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	h1 {
		justify-content: left;
		font-style: normal;
		color: #fa1ec7;
		line-height: 300%;
		-webkit-text-stroke: 2px #00bfff;
		font-size: 3em;
	}
	#btn-new-message {
		float: right;
	}
	#header {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: left;
		gap: 10px;
		background: #12072e;
		color: #fa1ec7;
		font-size: 0.5em;
		margin: 10px;
	}
</style>
