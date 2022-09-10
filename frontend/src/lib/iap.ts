import {GoogleAuth} from "google-auth-library";

const auth = new GoogleAuth();

function getIAPAudience() {
    const audience = process.env.IAP_AUDIENCE_ID;
    if (audience === undefined) {
        throw new Error("IAP_AUDIENCE_ID is not defined");
    }
    return audience;
}

export async function makeIAPGetRequest(url: string): Promise<Response> {
    const client = await auth.getIdTokenClient(getIAPAudience());
    const headers = await client.getRequestHeaders();
    return fetch(url, {
        headers: headers,
    });
}

export async function makeIAPPostRequest(url: string, body: string): Promise<Response> {
    const client = await auth.getIdTokenClient(getIAPAudience());
    const headers = await client.getRequestHeaders();
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
    });
}