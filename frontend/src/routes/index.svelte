<script lang="ts">
    import Hero from "../components/Hero.svelte";
    import About from "../components/About.svelte";
    import WorkExperience from "../components/WorkExperience.svelte";
    import Projects from "../components/Projects.svelte";
    import ContactForm from "../components/ContactForm.svelte";

    export let workExperience: any;
    export let projects: any;
</script>

<svelte:head>
    <title>Isaac Harris-Holt</title>
    <script src="https://kit.fontawesome.com/17c91f29d1.js" crossorigin="anonymous"></script>
    <script src="https://www.google.com/recaptcha/enterprise.js?render=6LeOouUgAAAAAM0vGJymyJ9_PhbXgCx9DaYB3E_2"></script>
    <style>
        .grecaptcha-badge { 
            visibility: hidden;
        }
    </style>
</svelte:head>

<div class="bg-gradient-to-br from-green-300 dark:from-slate-800 to-sky-400 dark:to-blue-800 w-full h-fit absolute">
    <Hero/>
<!--    <About/>-->

    {#if workExperience.length > 0}
        <WorkExperience {workExperience}/>
    {/if}

    {#if projects.length > 0}
        <Projects {projects}/>
    {/if}

    <ContactForm/>
</div>