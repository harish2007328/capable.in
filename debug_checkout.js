
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode'
});

async function run() {
    const productId = 'pdt_0Na8URZNePBzKQcqhygG7';
    try {
        console.log("Checking product:", productId);
        const product = await dodo.products.retrieve(productId);
        console.log("Product found:", product.name);
        
        console.log("Attempting test checkout session...");
        const session = await dodo.checkoutSessions.create({
            product_cart: [{ product_id: productId, quantity: 1 }],
            customer: { email: 'test@example.com' },
            return_url: 'http://localhost:3000'
        });
        console.log("Session created successfully!", session.checkout_url);
    } catch (err) {
        console.error("DEBUG FAILED:", err.message);
        if (err.response) console.log("Data:", err.response.data);
    }
}
run();
