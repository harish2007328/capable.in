
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    endpoint: 'https://test.dodopayments.com'
});

async function debug() {
    try {
        const products = await dodo.products.list({ page_size: 10 });
        console.log("Products response object keys:", Object.keys(products));
        console.log("Full response:", JSON.stringify(products, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

debug();
