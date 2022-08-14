<script>
    import sanitizeHtml from 'sanitize-html';
    import { marked } from 'marked';
    import moment from 'moment';

    import Accordion from './Accordion.svelte';
    import Chip from "./Chip.svelte";
    import Container from "./Container.svelte";

    export let workExperience;

    function reformatDate(date) {
        return moment(date, 'YYYY-MM-DD').format('MMMM YYYY');
    }
</script>

<Container id="work-experience">
    <h1 class="text-left text-3xl font-bold pb-4">Work experience</h1>
    {#each workExperience as experience, index}
        <Accordion open={index === 0} accordionGroup="workExperience">
            <div slot="title" class="flex flex-row flex-wrap w-full justify-between h-fit gap-2">
                <div>
                    <h1 class="font-bold text-xl text-left">{experience.company}</h1>
                    <h2 class="font-bold text-lg text-left">{experience.position}</h2>
                </div>
                <div class="flex flex-col justify-between">
                    <h3 class="text-md sm:text-right text-left font-bold">
                        {#if experience.end_date}
                            {reformatDate(experience.start_date)} - {reformatDate(experience.end_date)}
                        {:else}
                            {reformatDate(experience.start_date)} - Present
                        {/if}
                    </h3>
                    <div class="flex flex-row gap-2 justify-end">
                        {#each experience.skills as skill}
                            <Chip content={skill} />
                        {/each}
                    </div>
                </div>
            </div>

            <div slot="content" class="experience-block">
                {@html sanitizeHtml(marked.parse(experience.description)).replace('<a', '<a target="_blank"')}
            </div>
        </Accordion>
        {#if index < workExperience.length - 1}
            <div class="flex flex-col justify-center h-4">
                <hr class="border-b border-gray-200 w-4/5 m-auto align-middle" />
            </div>
        {/if}
    {/each}
</Container>

<style>
    .experience-block :global(ul) {
        list-style-type: disc;
        padding-left: 2rem;
    }

    .experience-block :global(a) {
        @apply text-gray-700 underline;
    }
</style>