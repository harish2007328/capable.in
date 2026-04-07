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

// Helper: Apply token to SDK internal state
const applyTokenToSDK = (token) => {
    if (client.http) {
        client.http.userToken = token;
    }
};

// Helper: Validate a token directly against InsForge
const validateToken = async (token) => {
    try {
        // Apply the token to the SDK's internal state first
        applyTokenToSDK(token);
        // Then use getCurrentSession which validates against InsForge
        const { data, error } = await client.auth.getCurrentSession();
        if (error || !data?.session?.user) {
            applyTokenToSDK(null);
            return null;
        }
        return data.session.user;
    } catch {
        applyTokenToSDK(null);
        return null;
    }
};

// Patch getSession to work with InsForge SDK
client.auth.getSession = async () => {
    try {
        // Step 1: Check localStorage for a stored token (fastest path)
        const storedToken = localStorage.getItem('insforge_session_token');
        
        if (storedToken) {
            applyTokenToSDK(storedToken);
            try {
                const user = await validateToken(storedToken);
                if (user) {
                    const session = { accessToken: storedToken, user };
                    const currentId = user?.id;
                    if (currentId !== lastSessionId) {
                        notifyListeners('SIGNED_IN', session);
                    }
                    return { data: { session }, error: null };
                } else {
                    // Token invalid — clear it and fall through to cookie check
                    console.warn("Stored token is invalid, trying cookie...");
                    localStorage.removeItem('insforge_session_token');
                    applyTokenToSDK(null);
                }
            } catch (fetchErr) {
                // Network error — don't clear the token, user might be offline
                console.warn("Token validation failed (network):", fetchErr.message);
                return { data: { session: { accessToken: storedToken, user: null } }, error: null };
            }
        }

        // Step 2: Try to restore session from httpOnly cookie (auto-login on reload)
        try {
            const cookieRes = await fetch(`/api/auth/session`, { 
                credentials: 'include' // Send cookies with request
            });
            if (cookieRes.ok) {
                const cookieData = await cookieRes.json();
                if (cookieData.authenticated && cookieData.accessToken) {
                    // Cookie has a valid token — store it in localStorage for fast access next time
                    localStorage.setItem('insforge_session_token', cookieData.accessToken);
                    applyTokenToSDK(cookieData.accessToken);
                    const session = {
                        accessToken: cookieData.accessToken,
                        user: cookieData.user
                    };
                    const currentId = cookieData.user?.id;
                    if (currentId !== lastSessionId) {
                        notifyListeners('SIGNED_IN', session);
                    }
                    return { data: { session }, error: null };
                }
            }
        } catch (cookieErr) {
            // Cookie check failed (network error, server down) — no session
            console.warn("Cookie session check failed:", cookieErr.message);
        }

        // No valid token anywhere = no session
        applyTokenToSDK(null);
        return { data: { session: null }, error: null };
    } catch (err) {
        applyTokenToSDK(null);
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

