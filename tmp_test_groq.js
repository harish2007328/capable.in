import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
console.log('API Key:', apiKey ? 'FOUND (' + apiKey.substring(0, 10) + '...)' : 'MISSING');

const groq = new Groq({ apiKey });

async function test() {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say hello' }],
            model: 'llama-3.3-70b-versatile',
        });
        console.log('Response:', completion.choices[0].message.content);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
