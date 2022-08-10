<script>
    import "../app.css";
    import DarkModeToggle from "../components/DarkModeToggle.svelte";

    let dark = true;
</script>

<div class:dark>
    <DarkModeToggle bind:dark />
    <slot />
</div>
