import type { RequestEvent } from '@sveltejs/kit'
import { makeIAPPostRequest } from '$lib/iap';

const getAPIHost: () => string = () => {
    const host = process.env.API_HOST;
    if (host === undefined) {
        throw new Error('API_HOST is not defined');
    }
    return host;
};

export async function post({ request }: RequestEvent) {
    const data = await request.json();
    console.log(`Data: ${JSON.stringify(data)}`);
    const { name, email, message } = data;

    const url_base = getAPIHost();

    const apiResponse = makeIAPPostRequest(
        `${url_base}/form-messages`,
        JSON.stringify({
            name: name,
            email: email,
            message: message,
        })
    );
    const { status } = await apiResponse;

    return {
        status: status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    };
}