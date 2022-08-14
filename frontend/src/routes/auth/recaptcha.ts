import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import type { RequestEvent } from '@sveltejs/kit'

const getAppEngineProjectID: () => string = () => {
	const id = process.env.APPENGINE_PROJECT_ID;
	if (id === undefined) {
		throw new Error('APPENGINE_PROJECT_ID is not defined');
	}
	return id;
};

const getRecaptchaSiteKey: () => string = () => {
	const key = process.env.RECAPTCHA_SITE_KEY;
	if (key === undefined) {
		throw new Error('RECAPTCHA_SITE_KEY is not defined');
	}
	return key;
};

// Returns the site key for the recaptcha service.
export async function get() {
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		},
		body: {
			key: getRecaptchaSiteKey(),
		}
	};
}

// Allows creation of assessments for the reCAPTCHA Enterprise API.
export async function post({ request }: RequestEvent) {
    const data = await request.json();
    console.log(`Data: ${JSON.stringify(data)}`);
    const { token, recaptchaAction } = data;
    const score: number | null = await createAssessment(token, recaptchaAction);

    if (!score) {
        return {
            status: 400,
            body: {
                error: 'Invalid token',
            },
        }
    }

    return {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: {
            score: score,
        }
    };
}

export async function createAssessment(
    token: string,
	recaptchaAction: string,
	projectID: string = getAppEngineProjectID(),
	recaptchaSiteKey: string = getRecaptchaSiteKey()
) {
	// Create the reCAPTCHA client & set the project path.
	const client = new RecaptchaEnterpriseServiceClient();
	const projectPath = client.projectPath(projectID);

	// Build the assessment request.
	const request = {
		assessment: {
			event: {
				token: token,
				siteKey: recaptchaSiteKey
			}
		},
		parent: projectPath
	};

	// client.createAssessment() can return a Promise or take a Callback
	const [response] = await client.createAssessment(request);

	// Check if the token is valid.
	if (!response.tokenProperties.valid) {
		console.log(
			'The CreateAssessment call failed because the token was: ' +
				response.tokenProperties.invalidReason
		);
        await client.close();
		return null;
	}

	// Check if the expected action was executed.
	// The `action` property is set by user client in the
	// grecaptcha.enterprise.execute() method.
	if (response.tokenProperties.action === recaptchaAction) {
		// Get the risk score and the reason(s).
		console.log('The reCAPTCHA score is: ' + response.riskAnalysis.score);

		response.riskAnalysis.reasons.forEach((reason) => {
			console.log(reason);
		});
        await client.close();
		return response.riskAnalysis.score;
	} else {
		console.log(
			'The action attribute in your reCAPTCHA tag ' +
				'does not match the action you are expecting to score'
		);
        await client.close();
		return null;
	}
}
