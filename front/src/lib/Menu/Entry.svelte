<script lang="ts">
	export let href: string;
</script>

<h4>
	<a {href}><slot /></a>
</h4>

<style>
	h4:hover {
		background-color: blue;
		width: 100%;
		text-align: center;
	}
</style>
