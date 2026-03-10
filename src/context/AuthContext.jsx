import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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

    const checkSession = React.useCallback(async () => {
        try {
            const { data } = await supabase.auth.getSession();
            const fetchedUser = data?.session?.user ?? null;

            setUser(fetchedUser);
            if (fetchedUser) {
                // Persistent cache for instant visual load
                localStorage.setItem('capable_cached_user', JSON.stringify(fetchedUser));
                
                // Cleanup URL only AFTER session is confirmed
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('access_token')) {
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState(null, '', cleanUrl);
                }
            } else {
                localStorage.removeItem('capable_cached_user');
            }
            setLoading(false);
            return fetchedUser;
        } catch (err) {
            console.error("Session check failed", err);
            setLoading(false);
            return null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const authTimeout = setTimeout(() => {
            setLoading(prevLoading => {
                if (isMounted && prevLoading) {
                    console.warn('Auth initialization timed out. Entering Guest Mode.');
                    return false;
                }
                return prevLoading;
            });
        }, 6000); // Increased to 6s for slower networks

        checkSession().finally(() => {
            if (isMounted) {
                clearTimeout(authTimeout);
            }
        });

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
                clearTimeout(authTimeout);
            }
        });

        return () => {
            isMounted = false;
            authListener?.subscription?.unsubscribe();
            clearTimeout(authTimeout);
        };
    }, [checkSession]);

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

        // Clear all persistent and memory caches
        localStorage.removeItem('capable_cached_user');
        if (window.ProjectStorage && window.ProjectStorage.logout) {
            window.ProjectStorage.logout();
        }

        setUser(null);
    };

    const loginWithOAuth = async (provider) => {
        if (provider === 'google') {
            // Use our custom backend route to maintain branding
            window.location.href = '/api/auth/google';
            return;
        }

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

    const verifyEmail = async (email, otp) => {
        const { data, error } = await supabase.auth.verifyEmail({
            email,
            otp
        });
        if (error) throw error;
        setUser(data?.user || null);
        return data;
    };

    const value = {
        user,
        login,
        signup,
        verifyEmail,
        logout,
        loginWithOAuth,
        updateUser,
        refreshSession: checkSession,
        loading
    };



    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
