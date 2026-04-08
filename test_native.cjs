const { createClient } = require('@insforge/sdk');
require('dotenv').config();

const insforge = createClient({
    baseUrl: process.env.VITE_INSFORGE_URL,
    anonKey: process.env.VITE_INSFORGE_ANON_KEY
});

async function run() {
    const email = `test3_${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    
    console.log("Signing in...");
    await insforge.auth.signUp({ email, password, name: 'Test User' });
    const { data } = await insforge.auth.signInWithPassword({ email, password });
    
    // Natively set token?
    if (insforge.http) insforge.http.userToken = data.accessToken;

    console.log("Testing native getSession()...");
    const sessionRes = await insforge.auth.getSession();
    console.log("Native getSession response keys:", Object.keys(sessionRes));
    console.log("Native data:", sessionRes.data);
    if(sessionRes.error) console.log("Native error:", sessionRes.error);
}

run().catch(console.error);
