import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let authTimeout;

        // Safety Timeout: Force loading to false if Supabase doesn't respond in 3 seconds
        // This prevents a white page on networks that block Supabase domains.
        authTimeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn('Auth initialization timed out. Entering Guest Mode.');
                setLoading(false);
            }
        }, 3000);

        const handleAuth = (event, session) => {
            if (!isMounted) return;

            setUser(session?.user ?? null);
            setLoading(false);
            clearTimeout(authTimeout); // Clear timeout once auth state is handled

            // If we have an access token in the hash, we need to clean it up
            // but only after Supabase has had a chance to set the session.
            if (session && (window.location.hash || window.location.search.includes('access_token'))) {
                // Remove hash and OAuth parameters from the URL without leaving a '#'
                const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]access_token=[^&]+/, '').replace(/[?&]refresh_token=[^&]+/, '').replace(/[?&]expires_at=[^&]+/, '').replace(/[?&]expires_in=[^&]+/, '').replace(/[?&]token_type=[^&]+/, '').replace(/[?&]type=[^&]+/, '');

                // Use replaceState to update the URL without the hash
                window.history.replaceState(null, '', cleanUrl);
            }
        };

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuth('INITIAL_SESSION', session);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            handleAuth(event, session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signup = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const loginWithOAuth = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) throw error;
        return data;
    };

    const updateUser = async (attributes) => {
        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error) throw error;
        return data;
    };

    const value = {
        user,
        login,
        signup,
        logout,
        loginWithOAuth,
        updateUser,
        loading
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                fontFamily: 'sans-serif'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>Loading application...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
