<script lang="ts">
    import DOMPurify from 'isomorphic-dompurify';
    import {marked} from 'marked';
    import Accordion from "./Accordion.svelte";

    export let projects: any;
</script>

<div class="h-screen flex flex-col justify-center">
    <div class="accordion-box w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5">
        <h1 class="text-left text-2xl font-bold pb-4">Personal Projects</h1>
        {#each projects as project, index}
            <Accordion open={index === 0} accordionGroup="projects">
                <div slot="title" class="flex flex-row w-full justify-between h-fit">
                        <h1 class="font-bold text-xl text-left">{project.name}</h1>
                </div>

                <div slot="content" class="experience-block">
                    <a href={project.url} target="_blank"><h2 class="text-gray-700 underline">{project.url}</h2></a>
                    {@html DOMPurify.sanitize(marked.parse(project.description)).replace('<a', '<a target="_blank"')}
                </div>
            </Accordion>
            {#if index < project.length - 1}
                <div class="flex flex-col justify-center h-4">
                    <hr class="border-b border-gray-200 w-4/5 m-auto align-middle"/>
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .experience :global(ul) {
        list-style-type: disc;
    }
</style>