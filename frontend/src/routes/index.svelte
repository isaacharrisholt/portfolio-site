<script lang="ts">
    import Hero from "../components/Hero.svelte";
    import About from "../components/About.svelte";
    import WorkExperience from "../components/WorkExperience.svelte";
    import Projects from "../components/Projects.svelte";
    import Contact from "../components/Contact.svelte";
</script>

<svelte:head>
    <title>Isaac Harris-Holt</title>
    <script src="https://kit.fontawesome.com/17c91f29d1.js" crossorigin="anonymous"></script>
</svelte:head>

<div class="bg-gradient-to-br from-green-300 to-sky-400 w-full h-fit absolute">
    <Hero/>
    <About/>
    <WorkExperience/>
    <Projects/>
    <Contact/>
</div>