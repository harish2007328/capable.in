import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://4aqgz7mw.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzgxNjd9.iLnuD53-bjLDI-gtrOFZ3iFeYZBCMoxVQPMm_4Cnp2E';

const client = createClient({ baseUrl, anonKey });

client.auth.getSession = async () => {
    try {
        const { data, error } = await client.auth.getCurrentSession();
        return { data: { session: data?.session || null }, error };
    } catch (err) {
        return { data: { session: null }, error: err };
    }
};

client.auth.onAuthStateChange = (callback) => {
    return { data: { subscription: { unsubscribe: () => { } } } };
};

export const supabase = client;
