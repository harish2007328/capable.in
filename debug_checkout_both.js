
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

async function test(env) {
    console.log(`\nTesting environment: ${env}`);
    const dodo = new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: env
    });
    try {
        const session = await dodo.checkoutSessions.create({
            product_cart: [{ product_id: 'pdt_0Na8URZNePBzKQcqhygG7', quantity: 1 }],
            customer: { email: 'test@example.com' },
            return_url: 'http://localhost:3000'
        });
        console.log(`✅ ${env} SUCCESS! URL: ${session.checkout_url}`);
        return true;
    } catch (err) {
        console.log(`❌ ${env} FAILED: ${err.status} - ${err.message}`);
        if (err.response) console.log("Data:", JSON.stringify(err.response.data));
        return false;
    }
}

async function run() {
    await test('test_mode');
    await test('live_mode');
}
run();
