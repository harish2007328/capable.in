
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode'
});

async function run() {
    try {
        const res = await dodo.products.list();
        console.log("Products found:");
        res.data.forEach(p => console.log(`- ${p.name}: ${p.product_id}`));
    } catch (err) {
        console.log("Error:", err.message);
    }
}
run();
