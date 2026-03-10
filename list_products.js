
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    endpoint: 'https://test.dodopayments.com'
});

async function test() {
    try {
        console.log("Listing products for this account...");
        const products = await dodo.products.list({ page_size: 10 });
        if (products.data.length === 0) {
            console.log("⚠️ No products found in this account. You need to create a product in the Dodo Dashboard first.");
        } else {
            console.log("Found products:");
            products.data.forEach(p => console.log(`- ${p.name} (ID: ${p.product_id})`));
        }
    } catch (err) {
        console.error("❌ List failed:", err.message);
    }
}

test();
