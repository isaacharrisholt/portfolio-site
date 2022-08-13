<script>
    import Container from './Container.svelte';
</script>

<Container>
    <div class="grid md:grid-flow-col gap-8">
        <div class="flex flex-col justify-center">
            <img
                src="https://isaacharrisholt.com/wp-content/uploads/2021/12/Personal-Profile-Image-Transparent-768x769.png.webp"
                alt=""
                class="rounded-xl"
            >
        </div>
        <div class="flex flex-col justify-start gap-4 md:col-span-2">
            <h1 class="text-left text-3xl font-bold pb-4">About me</h1>
            <p>
                Hey! I'm Isaac, a software engineer. I started programming when I was about
                13 years old, fell in love and haven't stopped since. I spent a lot of time
                automating everything I could think of automating, from finances to sports
                arbitrage, and ended up where I am today.
            </p>
            <p>
                My passions lie in technology, personal finance and the environment, and I
                love tinkering and building things! I'd love to start a conversation with
                you, so please get in touch!
            </p>
            <p>
                In the meantime,
                    <a href="#work-experience" class="text-gray-700 underline">scroll on</a>
                to learn about my work and projects.
            </p>
            <p>
                - Isaac
            </p>
        </div>
    </div>
</Container>