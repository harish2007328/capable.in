
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

console.log("Creating with bearerToken...");
try {
    const d1 = new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode'
    });
    console.log("d1 options:", d1._options);
} catch (e) { console.log("d1 error:", e.message); }

console.log("\nCreating with apiKey...");
try {
    const d2 = new DodoPayments({
        apiKey: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode'
    });
    console.log("d2 options:", d2._options);
} catch (e) { console.log("d2 error:", e.message); }
