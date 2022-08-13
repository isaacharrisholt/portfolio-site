<script lang="ts">
    import DOMPurify from 'isomorphic-dompurify';
    import {marked} from 'marked';
    import Accordion from "./Accordion.svelte";
    import Chip from "./Chip.svelte";
    import Container from "./Container.svelte";

    export let projects: any;
</script>

<Container>
    <h1 class="text-left text-2xl font-bold pb-4">Personal Projects</h1>
    {#each projects as project, index}
        <Accordion open={index === 0} accordionGroup="projects">
            <div slot="title" class="flex flex-row w-full justify-between h-fit">
                <div>
                    <h1 class="font-bold text-xl text-left">{project.name}</h1>
                </div>
                <div class="flex flex-row gap-2 justify-end">
                    {#each project.skills as skill}
                        <Chip content={skill} />
                    {/each}
                </div>
            </div>

            <div slot="content" class="project-block">
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
</Container>

<style>
    .project-block :global(ul) {
        list-style-type: disc;
        padding-left: 2rem;
    }

    .project-block :global(a) {
        @apply text-gray-700 underline;
    }
</style>