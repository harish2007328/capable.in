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

// Helper: Decode a JWT payload without verification (we trust InsForge issued it)
const decodeJWT = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
};

// Helper: Check if a token is expired (with 5 minute buffer for proactive refresh)
const isTokenExpired = (token, bufferSeconds = 300) => {
    const payload = decodeJWT(token);
    if (!payload?.exp) return false; // No exp claim = doesn't expire
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < (now + bufferSeconds);
};

// Helper: Try to get a fresh token from the server's cookie-based session endpoint
const refreshFromCookie = async () => {
    try {
        const cookieRes = await fetch(`/api/auth/session`, { 
            credentials: 'include'
        });
        if (cookieRes.ok) {
            const cookieData = await cookieRes.json();
            if (cookieData.authenticated && cookieData.accessToken) {
                // Server successfully returned a session (possibly refreshed)
                if (cookieData.refreshed) {
                    console.log('🔄 Token silently refreshed by server');
                }
                localStorage.setItem('insforge_session_token', cookieData.accessToken);
                applyTokenToSDK(cookieData.accessToken);
                return {
                    accessToken: cookieData.accessToken,
                    user: cookieData.user
                };
            }
        }
    } catch (err) {
        console.warn('Cookie session refresh failed:', err.message);
    }
    return null;
};

// Helper: Validate a stored token and return a user object
const validateToken = async (token) => {
    try {
        const payload = decodeJWT(token);
        if (!payload) return null;

        // Check if token is hard-expired (past exp with no buffer)
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            console.warn("Token expired at", new Date(payload.exp * 1000));
            return null;
        }

        // Apply the token so subsequent SDK calls are authenticated
        applyTokenToSDK(token);

        // Build user object from JWT claims
        const user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role || 'authenticated',
        };

        // Enrich with profile data from InsForge
        try {
            const { data: profile } = await client.auth.getProfile(payload.sub);
            if (profile) {
                user.profile = profile;
                user.user_metadata = profile;
            }
        } catch {
            // Profile fetch failed, but token itself is valid — proceed with basic info
            user.profile = {};
        }

        return user;
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
            // Step 1a: If token is expired or about to expire, try cookie refresh FIRST
            if (isTokenExpired(storedToken, 0)) {
                // Token is hard-expired — go straight to cookie refresh
                console.log('Stored token expired, attempting cookie refresh...');
                localStorage.removeItem('insforge_session_token');
                applyTokenToSDK(null);
                
                const refreshed = await refreshFromCookie();
                if (refreshed) {
                    const session = { accessToken: refreshed.accessToken, user: refreshed.user };
                    const currentId = refreshed.user?.id;
                    if (currentId !== lastSessionId) {
                        notifyListeners('SIGNED_IN', session);
                    }
                    return { data: { session }, error: null };
                }
                
                // Cookie refresh failed — no session
                return { data: { session: null }, error: null };
            }
            
            // Step 1b: If token is about to expire (within 5 min), proactively refresh in background
            if (isTokenExpired(storedToken, 300)) {
                console.log('Token expiring soon, proactive refresh...');
                refreshFromCookie().catch(() => {}); // Fire-and-forget
            }
            
            // Step 1c: Token is still valid — validate and use it
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
                    // Validation failed (e.g. server rejected it) — try cookie refresh
                    console.warn("Stored token validation failed, trying cookie refresh...");
                    localStorage.removeItem('insforge_session_token');
                    applyTokenToSDK(null);
                    
                    const refreshed = await refreshFromCookie();
                    if (refreshed) {
                        const session = { accessToken: refreshed.accessToken, user: refreshed.user };
                        const currentId = refreshed.user?.id;
                        if (currentId !== lastSessionId) {
                            notifyListeners('SIGNED_IN', session);
                        }
                        return { data: { session }, error: null };
                    }
                }
            } catch (fetchErr) {
                // Network error — don't clear the token, user might be offline
                console.warn("Token validation failed (network):", fetchErr.message);
                return { data: { session: { accessToken: storedToken, user: null } }, error: null };
            }
        }

        // Step 2: No stored token — try to restore session from httpOnly cookie
        const refreshed = await refreshFromCookie();
        if (refreshed) {
            const session = { accessToken: refreshed.accessToken, user: refreshed.user };
            const currentId = refreshed.user?.id;
            if (currentId !== lastSessionId) {
                notifyListeners('SIGNED_IN', session);
            }
            return { data: { session }, error: null };
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
