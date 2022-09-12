<nav id="menu">
	<div id="options">
		<h1 class="typography">Transcendence</h1>
		<h4 class="typography">
			<a href="/StartAGame">Game</a>
		</h4>
		<h4 class="typography">
			<a href="/Chat">Chat</a>
		</h4>
		<h4 class="typography">
			<a href="/Parameters">Parameters</a>
		</h4>
	</div>
</nav>

<style>
	#menu {
		width: 100%;
		height: 100%;
	}
	#options {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 4vh;
	}
	h1 {
		font-size: 4em;
	}
	@media (max-width: 820px) {
		h1 {
			font-size: 3em;
		}
	}
	@media (max-width: 620px) {
		h1 {
			font-size: 2.4em;
		}
	}
	h4 {
		font-size: 2em;
	}
	h4:hover {
		background-color: blue;
		width: 100%;
		text-align: center;
	}
	a {
		all: unset;
	}
</style>
