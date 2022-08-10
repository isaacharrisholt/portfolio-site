<script lang="ts">
    export let open: boolean;
</script>

<svg
        class:open
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        class="h-12 w-12 mr-2 stroke-black transition duration-500 -rotate-90"
>
    <path d="M19 9l-7 7-7-7"/>
</svg>

<style>
    .open {
        transform: rotate(0deg);
    }
</style>