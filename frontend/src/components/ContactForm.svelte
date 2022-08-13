<script lang="ts">
	let name: string = '';
	let email: string = '';
	let message: string = '';
	let submittable: boolean = false;

	function validate() {
		return name.length > 0 && email.length > 0 && message.length > 0;
	}

	function handleSubmit() {
		submitting = true;
        console.log('Submission received');
		grecaptcha.enterprise.ready(async () => {
			const action: string = 'CONTACT_FORM';
			const token: string = await grecaptcha.enterprise.execute(
				'6LeOouUgAAAAAM0vGJymyJ9_PhbXgCx9DaYB3E_2',
				{ action: action }
			);
			const response = await fetch('/auth/recaptcha', {
				method: 'POST',
				body: JSON.stringify({
					token: token,
					recaptchaAction: action,
				}),
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			})
			const { score } = await response.json();

			if (score < 0.5) {
				alert('reCaptcha failed. Are you a human?');
				submittable = true;
				return;
			}

			const apiResponse = fetch('http://localhost:4000/form-messages', {
				method: 'POST',
				body: JSON.stringify({
					name: name,
					email: email,
					message: message,
				}),
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			});
			const { status } = await apiResponse;
			if (status === 200) {
				name = '';
				email = '';
				message = '';
				alert('Message sent!');
			} else {
				alert(`Message failed to send! Status: ${status}`);
			}
			submittable = true;
		});
	}
</script>

<div class="h-screen w-9/10 sm:w-4/5 md:w-7/10 lg:w-3/5 mx-auto px-8 flex flex-col justify-center">
	<div class="h-fit">
		<h1 class="text-left text-3xl font-bold pb-4 text-white">Let's chat</h1>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid grid-cols-2 gap-4">
				<div class="lg:col-span-1 col-span-2">
					<input 
						type="text"
						id="name"
						class="form-input"
						placeholder="Name"
						bind:value={name} 
						on:keyup={() => (submittable = validate())}
					/>
				</div>
				<div class="lg:col-span-1 col-span-2">
					<input
						type="email"
						id="email"
						class="form-input"
						placeholder="Email"
						bind:value={email}
						on:keyup={() => (submittable = validate())}
					/>
				</div>
				<div class="col-span-2">
					<textarea
						id="message"
						class="form-input h-[25vh] resize-none"
						placeholder="Message"
						bind:value={message}
						on:keyup={() => (submittable = validate())}
					/>
				</div>
				<div class="col-span-2">
					<button
						type="submit"
						disabled={!submittable}
						class="border-4 border-white w-full bg-white p-2 rounded-xl font-bold text-2xl text-black hover:text-white hover:bg-transparent transition mix-blend-lighten disabled:bg-gray-200 dark:disabled:bg-gray-400 disabled:border-gray-200 dark:disabled:border-gray-400 disabled:text-black disabled:mix-blend-lighten"
					>
						Send
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
