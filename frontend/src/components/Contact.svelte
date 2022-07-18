<script lang="ts">
	import { createAssessment } from '../recaptcha';

	let name: string;
	let email: string;
	let message: string = '';
    let submitted = false;

	function handleSubmit() {
        console.log('Submission received');
		grecaptcha.enterprise.ready(async () => {
			const action: string = 'CONTACT_FORM';
			const token: string = await grecaptcha.enterprise.execute(
				'6LeOouUgAAAAAM0vGJymyJ9_PhbXgCx9DaYB3E_2',
				{ action: action }
			);
            alert(token);
			const score = createAssessment(token, action);
			alert(`Score: ${score}`);
		});
	}
</script>

<div class="h-screen w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5 mx-auto px-8 flex flex-col justify-center">
	<div class="h-fit">
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid grid-cols-2 gap-4">
				<div class="col-span-1">
					<input type="text" id="name" class="form-input" placeholder="Name" bind:value={name} />
				</div>
				<div class="col-span-1">
					<input
						type="email"
						id="email"
						class="form-input"
						placeholder="Email"
						bind:value={email}
					/>
				</div>
				<div class="col-span-2">
					<textarea
						id="message"
						class="form-input h-[25vh] resize-none"
						placeholder="Message"
						bind:value={message}
					/>
				</div>
				<div class="col-span-2">
					<button
						type="submit"
						class="border-4 border-white w-full bg-white p-2 rounded-xl font-bold text-2xl text-black hover:text-white hover:bg-transparent transition mix-blend-lighten"
					>
						Send
					</button>
				</div>
			</div>
		</form>
        <h1>{submitted}</h1>
        <h1>{name}</h1>
	</div>
</div>
