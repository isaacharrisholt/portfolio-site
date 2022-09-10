import {GoogleAuth} from "google-auth-library";

const auth = new GoogleAuth();

function setServiceAccount() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "/app/src/lib/service-account.json";
}

export async function makeIAPGetRequest(url: string) : Promise<Response> {
    setServiceAccount();
    const client = await auth.getIdTokenClient(url);
    const headers = await client.getRequestHeaders();
    console.log(`Headers: ${JSON.stringify(headers)}`);
    return fetch(url, {
        headers: headers,
    });
}

export async function makeIAPPostRequest(url: string, body: string) : Promise<Response> {
    setServiceAccount();
    const client = await auth.getIdTokenClient(url);
    const headers = await client.getRequestHeaders();
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
    });
}