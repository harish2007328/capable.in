import { createClient } from '@insforge/sdk';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://4aqgz7mw.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzgxNjd9.iLnuD53-bjLDI-gtrOFZ3iFeYZBCMoxVQPMm_4Cnp2E';
// Your own backend for bridge verification
// Detect production vs development for the bridge
const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.origin; 

const client = createClient({ baseUrl, anonKey });

// --- AUTH STATE NOTIFIER ---
const authListeners = new Set();
const notifyListeners = (event, session) => {
    authListeners.forEach(cb => cb(event, session));
};

client.auth.getSession = async () => {
    try {
        let manualToken = localStorage.getItem('insforge_session_token');
        const cachedUser = localStorage.getItem('capable_cached_user');
        
        // Priority URL check
        const urlToken = new URLSearchParams(window.location.search).get('access_token');
        const tokenToVerify = urlToken || manualToken;

        // Cleanup: If either token is literal "null" or "undefined"
        if (tokenToVerify === 'null' || tokenToVerify === 'undefined' || !tokenToVerify) {
             if (!cachedUser) return { data: { session: null }, error: null };
        }

        // Attempt 1: Standard SDK session
        let { data, error } = await client.auth.getCurrentSession().catch(e => ({ data: null }));
        
        if (data?.session) {
            notifyListeners('SIGNED_IN', data.session);
            return { data, error };
        }

        // Attempt 2: Manual Token Validation (Bridge through our own backend)
        if (tokenToVerify && tokenToVerify !== 'null') {
            try {
                const response = await axios.get(`${serverUrl}/api/auth/sessions/current`, {
                    headers: { 'Authorization': `Bearer ${tokenToVerify}` }
                });
                
                if (response.status === 200 && response.data) {
                    const userData = response.data.user || response.data;
                    const verifiedToken = response.data.accessToken || response.data.access_token || tokenToVerify;
                    
                    if (userData && userData.email) {
                        if (urlToken) localStorage.setItem('insforge_session_token', urlToken);
                        const session = { user: userData, accessToken: verifiedToken, access_token: verifiedToken };
                        notifyListeners('SIGNED_IN', session);
                        return { data: { session }, error: null };
                    }
                }
            } catch (e) {
                console.warn("Session verification failed.");
                if (!urlToken) localStorage.removeItem('insforge_session_token');
            }
        }
        
        return { data: { session: null }, error: null };
    } catch (err) {
        return { data: { session: null }, error: err };
    }
};

client.auth.onAuthStateChange = (callback) => {
    authListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => { authListeners.delete(callback); } } } };
};

export const supabase = client;
