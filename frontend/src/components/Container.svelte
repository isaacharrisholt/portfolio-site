<script lang="ts">
    export let id: string;
</script>

<div class="h-screen flex flex-col justify-center" id={id}>
    <div
            class="h-fit mx-2 sm:mx-auto p-4 border-4 rounded-xl
                   border-white bg-white w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5"
    >
        <slot />
    </div>
</div>