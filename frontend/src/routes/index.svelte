<script context="module">
    export async function load({ fetch }) {
        const [
            workExperienceData,
            projectsData,
        ] = await Promise.all([
            fetch("http://localhost:4000/work-experience").then(res => res.json()),
            fetch("http://localhost:4000/personal-projects").then(res => res.json()),
        ]);

        return {
            props: {
                workExperience: workExperienceData.message,
                projects: projectsData.message
            }
        };
    }
</script>

<script lang="ts">
    import Hero from "../components/Hero.svelte";
    import About from "../components/About.svelte";
    import WorkExperience from "../components/WorkExperience.svelte";
    import Projects from "../components/Projects.svelte";
    import Contact from "../components/Contact.svelte";

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

<div class="bg-gradient-to-br from-green-300 to-sky-400 w-full h-fit absolute">
    <Hero/>
<!--    <About/>-->
    <WorkExperience {workExperience}/>
    <Projects {projects}/>
    <Contact/>
</div>