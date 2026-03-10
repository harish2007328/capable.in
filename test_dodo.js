
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodoPayments = new DodoPayments({
    apiKey: 'pk_snd_00d98d270105488582b957a0c911dc79',
    endpoint: 'https://test.dodopayments.com'
});

async function test() {
    try {
        console.log("Attempting to list checkout sessions...");
        const sessions = await dodoPayments.checkoutSessions.list({ page_size: 1 });
        console.log("Success:", sessions);
    } catch (err) {
        console.error("Test Failed:", err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
        }
    }
}

test();
