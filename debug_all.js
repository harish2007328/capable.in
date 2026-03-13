
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const key = process.env.DODO_PAYMENTS_API_KEY;
    console.log("Testing with key:", key);
    
    for (const env of ['test_mode', 'live_mode']) {
        console.log(`\n--- Testing ${env} ---`);
        const dodo = new DodoPayments({
            bearerToken: key,
            environment: env
        });
        try {
            const res = await dodo.products.list({ page_size: 1 });
            console.log(`${env} Success! Found ${res.data.length} products.`);
        } catch (err) {
            console.log(`${env} Failed: ${err.message} (${err.status})`);
        }
    }
}
run();
