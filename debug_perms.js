
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode'
});

async function run() {
    try {
        console.log("Testing payments.list...");
        const payments = await dodo.payments.list({ page_size: 1 });
        console.log("Payments success:", payments.data.length);
    } catch (err) {
        console.log("Payments failed:", err.message, err.status);
    }
}
run();
