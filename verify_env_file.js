
import { DodoPayments } from 'dodopayments';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function test(env) {
    const dodo = new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: env
    });
    try {
        await dodo.checkoutSessions.create({
            product_cart: [{ product_id: 'pdt_0Na8URZNePBzKQcqhygG7', quantity: 1 }],
            customer: { email: 'test@example.com' },
            return_url: 'http://localhost:3000'
        });
        return `${env}: SUCCESS`;
    } catch (err) {
        return `${env}: FAILED (${err.status})`;
    }
}

async function run() {
    const results = [];
    results.push(await test('test_mode'));
    results.push(await test('live_mode'));
    fs.writeFileSync('env_results.txt', results.join('\n'));
    console.log("Results written to env_results.txt");
}
run();
