
import { DodoPayments } from 'dodopayments';

const dodoPayments = new DodoPayments({
    apiKey: '',
    endpoint: 'https://test.dodopayments.com'
});

console.log("Is checkoutSessions defined with empty apiKey?", !!dodoPayments.checkoutSessions);
if (dodoPayments.checkoutSessions) {
    console.log("Type of create:", typeof dodoPayments.checkoutSessions.create);
}
