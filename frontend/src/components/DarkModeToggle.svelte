<script lang="ts">
    export let dark: boolean;
    $: icon = dark ? 'fa-moon' : 'fa-sun';
</script>

<div class="absolute top-8 right-8 z-10">
    <button on:click={() => dark = !dark}>
        <i class="{icon} fa-solid text-3xl text-black dark:text-white"></i>
    </button>
</div>