<script lang="ts">
    import ShortSignature from "./ShortSignature.svelte";

    export let title: string;
    export let url: string;
    export let faIcon: string;
    export let isSignature: boolean;
</script>

<a href={url} target="_blank" {title}>
    <div class="rounded-lg aspect-square text-center align-middle hover:drop-shadow-md hover:-translate-y-1 transition duration-200 transform">
        {#if isSignature}
            <ShortSignature/>
        {:else}
            <i class="{faIcon} text-5xl text-white w-full h-full align-middle"></i>
        {/if}
    </div>
</a>