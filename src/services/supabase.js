import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://4aqgz7mw.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzgxNjd9.iLnuD53-bjLDI-gtrOFZ3iFeYZBCMoxVQPMm_4Cnp2E';

const client = createClient({ baseUrl, anonKey });

// --- AUTH STATE NOTIFIER ---
let lastSessionId = null;
const authListeners = new Set();
const notifyListeners = (event, session) => {
    const currentId = session?.user?.id || session?.id || null;
    if (event === 'SIGNED_IN' && currentId === lastSessionId) return; // Skip redundant
    if (session) lastSessionId = currentId;
    else lastSessionId = null;
    
    authListeners.forEach(cb => cb(event, session));
};

// Patch getSession to work with InsForge SDK
// For server-side auth (Google OAuth), the SDK's getCurrentSession() fails because
// there's no httpOnly refresh cookie. So we first try to validate the stored token directly.
client.auth.getSession = async () => {
    try {
        // Step 1: Check for a stored access token (set by Google OAuth callback)
        const storedToken = localStorage.getItem('insforge_session_token');
        
        if (storedToken) {
            // Push token into SDK's internal http client so .database requests work seamlessly!
            if (client.http) {
                client.http.userToken = storedToken;
            }
            try {
                // Validate the token directly against the InsForge API
                const response = await fetch(`${baseUrl}/api/auth/sessions/current`, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const user = result.user || result;
                    const session = {
                        accessToken: storedToken,
                        user: user
                    };
                    
                    const currentId = user?.id;
                    if (currentId !== lastSessionId) {
                        notifyListeners('SIGNED_IN', session);
                    }
                    return { data: { session }, error: null };
                } else {
                    // Token is invalid/expired — remove it
                    console.warn("Stored token is invalid, clearing...");
                    localStorage.removeItem('insforge_session_token');
                    if (client.http) client.http.userToken = null;
                }
            } catch (fetchErr) {
                console.warn("Token validation fetch failed:", fetchErr.message);
            }
        }
        
        // No stored token = no session
        if (client.http) client.http.userToken = null;
        
        // We intentionally skip getCurrentSession() because it tries /api/auth/refresh 
        // with httpOnly cookies, which don't exist when auth is done server-side (Google OAuth).
        return { data: { session: null }, error: null };
    } catch (err) {
        if (client.http) client.http.userToken = null;
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
