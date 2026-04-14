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
const getApiBase = () => import.meta.env.VITE_API_URL || '';

const refreshFromCookie = async () => {
    try {
        const apiBase = getApiBase();
        const url = `${apiBase}/api/auth/session`;
        const cookieRes = await fetch(url, { 
            credentials: 'include'
        });
        
        if (cookieRes.ok) {
            const cookieData = await cookieRes.json();
            if (cookieData.authenticated && cookieData.accessToken) {
                return {
                    refreshed: true,
                    hasProxyCookie: true,
                    session: {
                        accessToken: cookieData.accessToken,
                        user: cookieData.user
                    }
                };
            }
            return { refreshed: false, hasProxyCookie: cookieData.hasProxyCookie === true };
        }
        return { refreshed: false, hasProxyCookie: false };
    } catch (err) {
        console.warn('Cookie session refresh failed:', err.message);
        return { refreshed: false, hasProxyCookie: false };
    }
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
        // Step 1: Check localStorage for a stored token (fastest path for OAuth callbacks)
        const storedToken = localStorage.getItem('insforge_session_token');
        
        if (storedToken && !isTokenExpired(storedToken, 0)) {
            // Token appears valid, try to use it directly
            applyTokenToSDK(storedToken);
            try {
                // If token is close to expiry (within 5 mins), proactively refresh native cookie in background
                if (isTokenExpired(storedToken, 300)) {
                    console.log('Token expiring soon, proactive refresh...');
                    refreshFromCookie().then((res) => {
                        // Only ping the native InsForge endpoint if the user actually has a valid local cookie record
                        if (res && res.hasProxyCookie) {
                            client.auth.getCurrentSession().catch(() => {});
                        }
                    }).catch(() => {});
                }
                
                const user = await validateToken(storedToken);
                if (user) {
                    const session = { accessToken: storedToken, user };
                    if (user?.id !== lastSessionId) notifyListeners('SIGNED_IN', session);
                    return { data: { session }, error: null };
                }
            } catch (err) {
                console.warn("Stored token validation failed (network or other):", err.message);
                // If it was just a network error, validateToken returns null. We fall through to next steps.
            }
        }

        // Step 2: Try custom proxy server cookie refresh (Google OAuth)
        const proxyCheck = await refreshFromCookie();
        if (proxyCheck.refreshed && proxyCheck.session) {
            const session = proxyCheck.session;
            localStorage.setItem('insforge_session_token', session.accessToken);
            applyTokenToSDK(session.accessToken);

            if (session.user?.id !== lastSessionId) {
                notifyListeners('SIGNED_IN', session);
            }
            return { data: { session }, error: null };
        }

        // Step 3: Try the native InsForge SDK session (handles auto-refresh for email/password)
        try {
            // ONLY make this network request if we think the user might actually be an email/password user
            // If they don't even have a capable_auth cookie (hasProxyCookie = false), they are fully logged out.
            // Skipping getCurrentSession prevents the browser 401 Unauthorized console error from popping up.
            if (proxyCheck.hasProxyCookie) {
                const nativeResponse = await client.auth.getCurrentSession();
                if (nativeResponse.data?.session) {
                    const session = nativeResponse.data.session;
                    localStorage.setItem('insforge_session_token', session.accessToken);
                    applyTokenToSDK(session.accessToken);
                    
                    if (session.user?.id !== lastSessionId) {
                        notifyListeners('SIGNED_IN', session);
                    }
                    return { data: { session }, error: null };
                }
            } else {
                console.log('Skipping native session check to prevent 401: no proxy cookie found.');
            }
        } catch (nativeErr) {
            console.warn("Native getCurrentSession failed:", nativeErr.message);
        }

        // No valid token anywhere = no session
        localStorage.removeItem('insforge_session_token');
        applyTokenToSDK(null);
        return { data: { session: null }, error: null };
    } catch (err) {
        localStorage.removeItem('insforge_session_token');
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
