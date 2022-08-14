<script lang="ts">
    import sanitizeHtml from 'sanitize-html';
    import {marked} from 'marked';
    import Accordion from "./Accordion.svelte";
    import Chip from "./Chip.svelte";
    import Container from "./Container.svelte";

    export let projects: any;
</script>

<Container>
    <h1 class="text-left text-3xl font-bold pb-4">Personal projects</h1>
    {#each projects as project, index}
        <Accordion open={index === 0} accordionGroup="projects">
            <div slot="title" class="flex flex-row flex-wrap w-full justify-between h-fit gap-2">
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
                <a href={project.url} target="_blank"><p class="text-gray-700 underline">{project.url}</p></a>
                {@html sanitizeHtml(marked.parse(project.description)).replace('<a', '<a target="_blank"')}
            </div>
        </Accordion>
        {#if index < projects.length - 1}
            <div class="flex flex-col justify-center h-4 py-1">
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