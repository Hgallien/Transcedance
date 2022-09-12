<script lang="ts">
	export let options: [string, string];
	export let mode = 0;

	function toggleMode() {
		if (mode == 0) mode = 1;
		else mode = 0;
	}
</script>

<div class="SwitchContainer">
	<label class="switch">
		<input type="checkbox" on:click={toggleMode} />
		<span class="slider round" />
	</label>
</div>
<div id="mode">
	{options[mode]}
</div>

<style>
	#mode {
		text-align: center;
	}
	.switch {
		position: relative;
		display: inline-block;
		width: 40px;
		height: 20px;
	}

	.SwitchContainer {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 16px;
		width: 16px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #2196f3;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #2196f3;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(18px);
		-ms-transform: translateX(18px);
		transform: translateX(18px);
	}

	.slider.round {
		border-radius: 21px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
