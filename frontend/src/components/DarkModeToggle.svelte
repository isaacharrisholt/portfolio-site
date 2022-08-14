<script lang="ts">
    export let dark: boolean;
    $: icon = dark ? 'fa-moon' : 'fa-sun';
</script>

<div class="fixed top-8 right-8 z-10">
    <button on:click={() => dark = !dark}>
        <i class="{icon} fa-solid md:text-3xl text-4xl text-black dark:text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]"></i>
    </button>
</div>