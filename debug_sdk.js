
import { DodoPayments } from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

const dodoPayments = new DodoPayments({
    apiKey: process.env.DODO_PAYMENTS_API_KEY,
    endpoint: 'https://test.dodopayments.com'
});

console.log("Is checkoutSessions defined?", !!dodoPayments.checkoutSessions);
if (dodoPayments.checkoutSessions) {
    console.log("Prototype keys of checkoutSessions:", Object.getOwnPropertyNames(Object.getPrototypeOf(dodoPayments.checkoutSessions)));
}

try {
    console.log("Attempting to call create...");
    // Just check if it's a function
    console.log("Type of dodoPayments.checkoutSessions.create:", typeof dodoPayments.checkoutSessions.create);
} catch (e) {
    console.log("Error checking create:", e.message);
}
