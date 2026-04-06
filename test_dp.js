import "dotenv/config";
import { DodoPayments } from "dodopayments";

const dp = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode'
});

async function run() {
    try {
        const s = await dp.checkoutSessions.create({
            product_cart: [{
                product_id: 'pdt_0Na6mITO06djfopBpp1zr',
                quantity: 1
            }],
            customer: {
                email: 'test@example.com'
            },
            metadata: {
                userId: '123'
            },
            return_url: 'http://localhost'
        });
        
        console.log("CREATED ID:", s.checkout_session_id || s.id);
        
        const r = await dp.checkoutSessions.retrieve(s.checkout_session_id || s.id);
        console.log("METADATA:", r.metadata);
        console.log("STATUS (session):", r.status);
        console.log("PAYMENT_STATUS:", r.payment_status);
        console.log("ALL KEYS:", Object.keys(r));
    } catch (e) {
        console.error(e.message);
    }
}
run();
