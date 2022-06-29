<script lang="ts">
    import SocialIcon from "./SocialIcon.svelte";

    let jobTitle = "Software Engineer";

    let socials = [
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        },
        {
            name: 'github',
            url: 'https://github.com/isaacharrisholt',
        }
    ]
</script>

<div class="h-screen w-[80vw] mx-auto my-20 px-8">
    <div class="mb-8">
        <h1 class="font-mono text-2xl font-bold">Hey, I'm</h1>
        <h2 class="text-3xl md:text-4xl font-bold">Isaac Harris-Holt</h2>
        <h3 class="uppercase text-xl md:text-2xl font-light font-sans">{jobTitle}</h3>
    </div>
    <div class="grid grid-cols-3 flex-wrap w-full gap-4">
        {#each socials as social}
            <SocialIcon url={social.url} />
        {/each}
    </div>
</div>