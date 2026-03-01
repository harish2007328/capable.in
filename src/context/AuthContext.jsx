import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Lottie from 'lottie-react';
import loaderAnimation from '../assets/loader.json';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const cachedUser = localStorage.getItem('capable_cached_user');
            return cachedUser ? JSON.parse(cachedUser) : null;
        } catch (e) {
            return null;
        }
    });
    // Set loading to false initially if we have a cached user, so the UI can render instantly
    const [loading, setLoading] = useState(!user);

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

        const checkSession = async () => {
            if (!isMounted) return;
            try {
                const { data } = await supabase.auth.getSession();
                const fetchedUser = data?.session?.user ?? null;

                if (isMounted) {
                    setUser(fetchedUser);
                    if (fetchedUser) {
                        localStorage.setItem('capable_cached_user', JSON.stringify(fetchedUser));
                    } else {
                        localStorage.removeItem('capable_cached_user');
                    }
                    setLoading(false);
                    clearTimeout(authTimeout);
                }

                if (data?.session && (window.location.hash || window.location.search.includes('access_token'))) {
                    const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]access_token=[^&]+/, '').replace(/[?&]refresh_token=[^&]+/, '').replace(/[?&]expires_at=[^&]+/, '').replace(/[?&]expires_in=[^&]+/, '').replace(/[?&]token_type=[^&]+/, '').replace(/[?&]type=[^&]+/, '');
                    window.history.replaceState(null, '', cleanUrl);
                }
            } catch (err) {
                console.error("Session check failed", err);
                if (isMounted) setLoading(false);
            }
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (isMounted) {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    localStorage.setItem('capable_cached_user', JSON.stringify(currentUser));
                } else {
                    localStorage.removeItem('capable_cached_user');
                }
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            if (authListener?.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data?.user || null);
        return data;
    };

    const signup = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setUser(data?.user || null);
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        localStorage.removeItem('capable_cached_user');
        setUser(null);
    };

    const loginWithOAuth = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            redirectTo: window.location.origin,
        });
        if (error) throw error;
        return data;
    };

    const updateUser = async (attributes) => {
        let payload = attributes;
        if (supabase.auth.setProfile) {
            // InsForge setProfile expects a flat object; Supabase nested it under `data`
            payload = attributes.data ? attributes.data : attributes;
            // Also map Supabase full_name to name
            if (payload.full_name && !payload.name) {
                payload.name = payload.full_name;
            }
        }

        const { data, error } = await (supabase.auth.setProfile ? supabase.auth.setProfile(payload) : supabase.auth.updateUser(payload));
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
            {children}
        </AuthContext.Provider>
    );
};
