<script context="module">
    const closers = new Map();
</script>

<script lang="ts">
    import Chevron from "./Chevron.svelte";
    import {slide} from 'svelte/transition';
    import {onMount} from "svelte";

    export let open: boolean;
    export let accordionGroup: string;

    onMount(() => {
        if (!closers.get(accordionGroup)) {
            closers.set(accordionGroup, new Set());
        }
        closers.get(accordionGroup).add(close);
        return () => {
            closers.get(accordionGroup).delete(close);
        }
    });

    function close() {
        open = false;
    }

    function closeOthers() {
        closers.get(accordionGroup).forEach(e => {
            if (e !== close) {
                e();
            }
        });
    }

    const onClick = () => {
        open = !open;
        closeOthers();
    };
</script>

<section>
    <button on:click={onClick} class="w-full">
        <div class="flex flex-row justify-start items-center">
            <Chevron {open}/>
            <slot name="title"/>
        </div>
    </button>

    {#if open}
        <div transition:slide={{ duration: 500 }}>
            <slot name="content"/>
        </div>
    {/if}

</section>