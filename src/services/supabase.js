import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://4aqgz7mw.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzgxNjd9.iLnuD53-bjLDI-gtrOFZ3iFeYZBCMoxVQPMm_4Cnp2E';

const client = createClient({ baseUrl, anonKey });

// --- AUTH STATE NOTIFIER ---
const authListeners = new Set();
const notifyListeners = (event, session) => {
    authListeners.forEach(cb => cb(event, session));
};

// Patch getSession to work with InsForge SDK
client.auth.getSession = async () => {
    try {
        // Attempt standard SDK session (automatic token detection from URL/cookies)
        const { data, error } = await client.auth.getCurrentSession();
        
        if (data?.session) {
            notifyListeners('SIGNED_IN', data.session);
            return { data, error: null };
        }
        
        return { data: { session: null }, error: error || null };
    } catch (err) {
        return { data: { session: null }, error: err };
    }
};

client.auth.onAuthStateChange = (callback) => {
    authListeners.add(callback);
    return { 
        data: { 
            subscription: { 
                unsubscribe: () => { authListeners.delete(callback); } 
            } 
        } 
    };
};

export const supabase = client;
