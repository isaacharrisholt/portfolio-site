<script>
    import DOMPurify from 'isomorphic-dompurify';
    import { marked } from 'marked';
import About from './About.svelte';

    import Accordion from './Accordion.svelte';

    export let workExperience;
</script>

<div class="h-fit w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5 mx-auto p-4 flex flex-col justify-center border-4 rounded-xl border-white bg-white">
    {#each workExperience as experience, index}
    <Accordion open=false>
        <div slot="title">
            <h1 class="font-bold text-xl">{experience.company}</h1>
            <h2 class="font-bold text-lg">{experience.position}</h2>
        </div>

        <div slot="content" class="experience-block">
            {@html DOMPurify.sanitize(marked.parse(experience.description))}
        </div>
    </Accordion>
    {#if index < workExperience.length-1}
    <div class="h-4" />
    {/if}
    {/each}
</div>

<style>
    .experience-block :global(ul) {
        list-style-type: disc;
        padding-left: 2rem;
    }
</style>