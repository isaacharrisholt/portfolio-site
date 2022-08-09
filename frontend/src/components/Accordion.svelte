<script lang="ts">
  export let open: boolean = true;

  import { slide } from 'svelte/transition';

  const onClick = () => open = !open;
</script>

<section>
  <button on:click={onClick}>
    <slot name="title" />
  </button>

  {#if open}
  <div transition:slide={{ duration: 500 }}>
    <p>Hey</p>
    <slot name="content" />
  </div>
  {/if}

</section>