<script lang="ts">
    import SocialIcon from "./SocialIcon.svelte";

    const socials: (
        {
            title: string,
            url: string,
            isSignature: boolean,
            faIcon: string
        }
    )[] = [
        {
            title: 'My blog',
            url: 'https://isaacharrisholt.com',
            isSignature: true,
            faIcon: ''
        },
        {
            title: 'GitHub',
            url: 'https://github.com/isaacharrisholt',
            faIcon: 'fa-brands fa-github',
            isSignature: false,
        },
        {
            title: 'Twitter',
            url: 'https://twitter.com/IsaacHarrisHolt',
            faIcon: 'fa-brands fa-twitter',
            isSignature: false
        },
        {
            title: 'LinkedIn',
            url: 'https://linkedin.com/in/isaac-harris-holt',
            faIcon: 'fa-brands fa-linkedin',
            isSignature: false
        },
        {
            title: 'Medium',
            url: 'https://medium.isaacharrisholt.com',
            faIcon: 'fa-brands fa-medium',
            isSignature: false
        },
    ]
</script>

<div class="h-screen w-9/10 md:w-[80vw] mx-auto py-20 px-8 flex flex-col justify-center">
    <div class="mb-8 mx-auto">
        <h1 class="font-mono text-4xl font-bold text-black dark:text-white text-center">Hey, I'm</h1>
        <h2 class="text-3xl md:text-6xl font-bold text-black dark:text-white text-center">Isaac Harris-Holt</h2>
        <h3 class="uppercase text-3xl md:text-4xl font-light font-sans text-black dark:text-white text-center">Software Engineer</h3>
    </div>
    <div class="grid gap-4 justify-center w-full" style="grid-template-columns: repeat(auto-fit, 4rem)">
        {#each socials as social}
            <SocialIcon {...social} />
        {/each}
    </div>
</div>