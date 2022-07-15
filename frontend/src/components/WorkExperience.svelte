<script>
    import DOMPurify from 'isomorphic-dompurify';
    import { marked } from 'marked';

    export let workExperience;
</script>

<div class="h-screen w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5 mx-auto px-8 flex flex-col justify-center">
    {#each workExperience as experience}
    <h1>{experience.company}</h1>
    <h2>{experience.position}</h2>
    {@html DOMPurify.sanitize(marked.parse(experience.description))}
    {/each}
</div>