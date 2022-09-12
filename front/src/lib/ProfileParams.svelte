<script lang="ts">
	import { resize } from '$lib/ts/avatar';
	import { uploadAvatar } from '$lib/state';
	import ProfileNameInput from './ProfileNameInput.svelte';

	export let name: string;
	export let avatar: string | null = null;

	let fileinput: HTMLInputElement;

	const onFileSelected = (event: any) => {
		let image = event.target.files[0];
		let reader = new FileReader();

		reader.readAsDataURL(image);
		new Promise((resolve) => (reader.onload = resolve))
			.then((event: any) => resize(event.target.result, 128, 128))
			.then((imageDataURL) => {
				avatar = imageDataURL;
				uploadAvatar(avatar);
			})
			.catch((e) => {});
	};
</script>

<div id="profileComponents">
	<div id="profilePicture">
		{#if avatar}
			<img class="avatar" src={avatar} alt="d" />
		{:else}
			<img
				class="avatar"
				src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png"
				alt=""
			/>
		{/if}
		<img
			class="upload"
			src="upload.png"
			alt="upload avatar"
			on:click={() => {
				fileinput.click();
			}}
		/>
		<div
			class="chan"
			on:click={() => {
				fileinput.click();
			}}
		/>
		<input
			style="display:none"
			type="file"
			accept=".jpg, .jpeg, .png"
			on:change={onFileSelected}
			bind:this={fileinput}
		/>
	</div>
	<ProfileNameInput bind:name />
</div>

<style>
	input {
		background-color: transparent;
		color: rgb(255, 0, 191);
	}
	#profileComponents {
		display: flex;
		flex-direction: row;
		gap: 5vw;
		justify-content: center;
		align-items: center;
		width: 50vw;
		height: 200px;
		margin-top: 100px;
		border: 1px solid #ff00b8;
	}
	#profilePicture {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-flow: column;
	}
	.upload {
		display: flex;
		height: 30px;
		width: 30px;
		cursor: pointer;
	}
	.avatar {
		display: flex;
		overflow: hidden;
		border-radius: 50%;
		width: 100px;
		height: 100px;
		margin: 10px;
	}
</style>
