import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const email = `test2_` + Date.now() + `@test.com`;
    const password = `TestPassword123!`;
    const apiUrl = process.env.VITE_INSFORGE_URL;
    const apiKey = process.env.VITE_INSFORGE_ANON_KEY;

    try {
        console.log("Signup raw...");
        const res1 = await axios.post(`${apiUrl}/api/auth/signup`, {
            email, password, name: 'bob'
        }, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log("Headers from signup:", res1.headers);
        console.log("Set-Cookie:", res1.headers['set-cookie']);
        
        console.log("Login raw...");
        const res2 = await axios.post(`${apiUrl}/api/auth/login`, {
            email, password
        }, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log("Headers from login:", res2.headers);
        console.log("Set-Cookie:", res2.headers['set-cookie']);
        
    } catch(e) {
        console.error(e.response?.data || e.message);
    }
}
test();
