<script lang="ts">
    import DOMPurify from 'isomorphic-dompurify';
    import { marked } from 'marked';

    export let projects: any;
</script>

<div class="h-screen w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5 mx-auto px-8 flex flex-col justify-center">
    {#each projects as project}
    <h1><a href="{project.url}" target="_blank">{project.name}</a></h1>
    {@html DOMPurify.sanitize(marked.parse(project.description))}
    <h2>{project.skills}</h2>
    {/each}
</div>