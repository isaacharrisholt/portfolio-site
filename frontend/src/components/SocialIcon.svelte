<script lang="ts">
    import ShortSignature from "./ShortSignature.svelte";

    export let title: string;
    export let url: string;
    export let faIcon: string;
    export let isSignature: boolean;
    export let relMe: boolean;
</script>

<a href={url} target="_blank" {title}>
    <div class="text-center hover:drop-shadow-md hover:-translate-y-1 transition duration-200">
        {#if isSignature}
            <ShortSignature/>
        {:else}
            <i
                class="{faIcon} text-5xl text-black dark:text-white"
                rel={relMe ? "me" : null}
            ></i>
        {/if}
    </div>
</a>
