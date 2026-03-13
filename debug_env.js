
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode'
});

async function run() {
    try {
        console.log("Trying TEST mode...");
        const res = await dodo.products.list();
        console.log("TEST Success. Products found:");
        res.data.forEach(p => console.log(`- ${p.name}: ${p.product_id}`));
    } catch (err) {
        console.log("TEST Failed:", err.message, "Status:", err.status);
        
        console.log("\nTrying LIVE mode...");
        const dodoLive = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY,
            environment: 'live_mode'
        });
        try {
            const resLive = await dodoLive.products.list();
            console.log("LIVE Success:", JSON.stringify(resLive, null, 2));
        } catch (errLive) {
            console.log("LIVE Failed:", errLive.message, "Status:", errLive.status);
        }
    }
}
run();
