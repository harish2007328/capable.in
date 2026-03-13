
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const key = process.env.DODO_PAYMENTS_API_KEY;
    console.log("Testing with key:", key);
    
    for (const env of ['test_mode', 'live_mode']) {
        console.log(`\n--- Testing ${env} ---`);
        try {
            const dodo = new DodoPayments({
                bearerToken: key,
                environment: env
            });
            const res = await dodo.products.list({ page_size: 1 });
            console.log(`${env} Response:`, JSON.stringify(res, null, 2));
        } catch (err) {
            console.log(`${env} Error:`, err.message, "Status:", err.status);
            if (err.response) console.log("Response Data:", err.response.data);
        }
    }
}
run();
