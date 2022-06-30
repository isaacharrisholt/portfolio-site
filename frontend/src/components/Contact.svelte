<script>
    let name;
    let email;
    let message = '';

    function submit() {
        alert('submit');
    }
</script>

<div class="h-screen w-[60vw] mx-auto px-8 flex flex-col justify-center">
    <div class="h-fit">
        <form on:submit|preventDefault={submit}>
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-1">
                    <input
                            type="text"
                            id="name"
                            class="form-input"
                            placeholder="Name"
                            bind:value={name}
                    >
                </div>
                <div class="col-span-1">
                    <input
                            type="email"
                            id="email"
                            class="form-input"
                            placeholder="Email"
                            bind:value={email}
                    >
                </div>
                <div class="col-span-2">
                    <textarea
                            id="message"
                            class="form-input h-[25vh] resize-none"
                            placeholder="Message"
                            bind:value={message}
                    ></textarea>
                </div>
                <div class="col-span-2">
                    <button type="submit" class="border-4 border-white w-full bg-white p-2 rounded-xl font-bold text-2xl text-black hover:text-white hover:bg-transparent transition mix-blend-lighten" >
                        Send
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>