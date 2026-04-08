const { createClient } = require('@insforge/sdk');
require('dotenv').config();

const insforge = createClient({
    baseUrl: process.env.VITE_INSFORGE_URL,
    anonKey: process.env.VITE_INSFORGE_ANON_KEY
});

async function run() {
    const email = `test_${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    console.log("Signing up...");
    const res1 = await insforge.auth.signUp({ email, password, name: 'Test User' });
    console.log("SignUp response keys:", Object.keys(res1.data || {}));
    if (res1.data) {
        console.log("SignUp data keys:", Object.keys(res1.data));
        console.log("accessToken present:", !!res1.data.accessToken);
        console.log("refreshToken present:", !!res1.data.refreshToken);
    }

    console.log("Signing in...");
    const res2 = await insforge.auth.signInWithPassword({ email, password });
    if (res2.data) {
        console.log("SignIn data keys:", Object.keys(res2.data));
        console.log("accessToken present:", !!res2.data.accessToken);
        console.log("refreshToken present:", !!res2.data.refreshToken);

        const payloadB64 = res2.data.accessToken.split('.')[1];
        const payloadStr = Buffer.from(payloadB64, 'base64').toString();
        const payload = JSON.parse(payloadStr);
        console.log("AccessToken Payload:", payload);
        if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const expiresInHours = (payload.exp * 1000 - Date.now()) / (1000 * 60 * 60);
            console.log("Expires at:", expDate.toISOString(), "which is in", expiresInHours.toFixed(2), "hours");
        } else {
            console.log("No 'exp' claim in token!");
        }
    }
}

run().catch(console.error);
