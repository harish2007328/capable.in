
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.DODO_PAYMENTS_API_KEY;

async function testEndpoint(name, url) {
    console.log(`\nTesting ${name} (${url})...`);
    const dodo = new DodoPayments({
        bearerToken: key,
        endpoint: url
    });
    try {
        // Just try to list products as a simple check
        const products = await dodo.products.list({ page_size: 1 });
        console.log(`✅ ${name} Success! Found ${products.data?.length || 0} products.`);
        return true;
    } catch (err) {
        console.log(`❌ ${name} Failed: ${err.message} (Status: ${err.status || err.statusCode})`);
        return false;
    }
}

async function run() {
    console.log("Key prefix:", key.substring(0, 8) + "...");
    const testWork = await testEndpoint("TEST", "https://test.dodopayments.com");
    if (!testWork) {
        await testEndpoint("LIVE", "https://live.dodopayments.com");
    }
}

run();
