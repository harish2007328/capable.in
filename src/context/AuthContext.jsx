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

        const handleAuth = (event, session) => {
            if (!isMounted) return;

            setUser(session?.user ?? null);
            setLoading(false);

            // If we have an access token in the hash, we need to clean it up
            // but only after Supabase has had a chance to set the session.
            if (session && (window.location.hash || window.location.search.includes('access_token'))) {
                const url = new URL(window.location.href);
                // Clear the hash and OAuth specific query params
                url.hash = '';
                const params = ['access_token', 'refresh_token', 'expires_at', 'expires_in', 'token_type', 'type'];
                params.forEach(p => url.searchParams.delete(p));
                window.history.replaceState(null, '', url.pathname + url.search);
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

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
