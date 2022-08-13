<script>
    import "../app.css";
    import DarkModeToggle from "../components/DarkModeToggle.svelte";

    let dark = true;
</script>

<html lang="en" class="scroll-smooth">
    <div class:dark>
        <DarkModeToggle bind:dark />
        <slot />
    </div>
</html>
