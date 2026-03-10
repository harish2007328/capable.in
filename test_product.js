
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    endpoint: 'https://test.dodopayments.com'
});

async function test() {
    try {
        const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
        console.log(`Checking product: ${productId}`);
        const product = await dodo.products.retrieve(productId);
        console.log("✅ Product Found:", product.name);
    } catch (err) {
        console.error("❌ Product check failed:", err.message);
        if (err.response) console.error("Data:", err.response.data);
    }
}

test();
