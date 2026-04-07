import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import axios from 'axios';

const getServerUrl = () => {
    return '';
};

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const cachedUser = localStorage.getItem('capable_cached_user');
            if (cachedUser) {
                const parsed = JSON.parse(cachedUser);
                if (parsed && parsed.metadata && !parsed.user_metadata) {
                    parsed.user_metadata = parsed.metadata;
                }
                return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    });

    const [loading, setLoading] = useState(!user);



    const updateUser = React.useCallback(async (attributes) => {
        const payload = attributes?.data || attributes || {};
        if (payload.full_name && !payload.name) payload.name = payload.full_name;

        console.log("📤 Updating Profile with:", payload);
        const { data, error } = await supabase.auth.setProfile(payload);
        
        if (error) {
            console.error("❌ Update failed:", error);
            throw error;
        }
        
        const { data: sessionData } = await supabase.auth.getCurrentSession();
        if (sessionData?.session?.user) {
            let freshUser = sessionData.session.user;
            if (freshUser.metadata && !freshUser.user_metadata) freshUser.user_metadata = freshUser.metadata;
            setUser(freshUser);
            localStorage.setItem('capable_cached_user', JSON.stringify(freshUser));
        }

        return data;
    }, []);

    const lastSyncRef = React.useRef({ id: null, time: 0 });

    const syncProfileFromMetadata = React.useCallback(async (currentUser) => {
        if (!currentUser) return;
        
        // Anti-loop: Only sync once every 5 minutes per user unless forced
        const now = Date.now();
        if (lastSyncRef.current.id === currentUser.id && (now - lastSyncRef.current.time) < 300000) {
            return;
        }
        lastSyncRef.current = { id: currentUser.id, time: now };
        


        try {
            // 1. Fetch the full profile from the auth service to be sure
            const { data: fullProfile } = await supabase.auth.getProfile(currentUser.id);
            
            const metadata = currentUser.user_metadata || currentUser.metadata || {};
            const profile = { ...(currentUser.profile || {}), ...(fullProfile || {}) };
            
            // 2. Look deep into identities if metadata is empty
            let avatarFromIdentity = null;
            let nameFromIdentity = null;
            
            if (currentUser.identities && currentUser.identities.length > 0) {
                for (const identity of currentUser.identities) {
                    const idData = identity.identity_data || identity.metadata || {};
                    if (!avatarFromIdentity) avatarFromIdentity = idData.picture || idData.avatar_url;
                    if (!nameFromIdentity) nameFromIdentity = idData.full_name || idData.name;
                }
            }

            const finalName = profile.name || nameFromIdentity || metadata.full_name || metadata.name;
            const finalAvatar = profile.avatar_url || avatarFromIdentity || metadata.avatar_url || metadata.picture || profile.picture;

            // 3. Ensure a row exists in the 'profiles' table
            const { data: existingProfile, error: fetchError } = await supabase.database
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();
            
            if (fetchError) throw fetchError;

            if (!existingProfile) {
                const { data: emailCheck } = await supabase.database
                    .from('profiles')
                    .select('id')
                    .eq('email', currentUser.email)
                    .maybeSingle();

                if (!emailCheck) {
                    const { error: upsertErr } = await supabase.database
                        .from('profiles')
                        .upsert([{
                            id: currentUser.id,
                            email: currentUser.email,
                            name: finalName,
                            avatar_url: finalAvatar
                        }]);
                    if (upsertErr) console.warn('Profile upsert warning:', upsertErr.message);
                } else {
                    console.log('Profile with this email exists under another ID. Skipping insert to avoid 409.');
                }
            } else if ((!existingProfile.avatar_url && finalAvatar) || (finalName && !existingProfile.name)) {

                await supabase.database
                    .from('profiles')
                    .update({ 
                        avatar_url: finalAvatar || existingProfile.avatar_url, 
                        name: finalName || existingProfile.name 
                    })
                    .eq('id', currentUser.id);
            }
            
            // Update local state with the rich profile data
            if (existingProfile) {
                currentUser.profile = { ...currentUser.profile, ...existingProfile };
                setUser({ ...currentUser });
            }
        } catch (dbErr) {
            console.warn("Database profile sync failed:", dbErr.message);
        }
    }, [setUser]); 


    const checkSession = React.useCallback(async () => {
        try {
            const { data } = await supabase.auth.getSession();
            let fetchedUser = data?.session?.user ?? null;
            if (fetchedUser) {
                if (fetchedUser.metadata && !fetchedUser.user_metadata) fetchedUser.user_metadata = fetchedUser.metadata;
                if (!fetchedUser.profile) fetchedUser.profile = {};
                setUser(fetchedUser);
                syncProfileFromMetadata(fetchedUser);
                localStorage.setItem('capable_cached_user', JSON.stringify(fetchedUser));
                
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('access_token') || urlParams.has('insforge_code')) {
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState(null, '', cleanUrl);
                }
            } else {
                setUser(null);
                localStorage.removeItem('capable_cached_user');
            }
            setLoading(false);
            return fetchedUser;
        } catch (err) {
            console.error("Session check failed", err);
            setLoading(false);
            return null;
        }
    }, [syncProfileFromMetadata]);

    useEffect(() => {
        let isMounted = true;
        const authTimeout = setTimeout(() => {
            setLoading(prevLoading => {
                if (isMounted && prevLoading) return false;
                return prevLoading;
            });
        }, 6000);

        checkSession().finally(() => {
            if (isMounted) clearTimeout(authTimeout);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (isMounted) {
                let currentUser = session?.user ?? null;
                if (currentUser) {
                    if (currentUser.metadata && !currentUser.user_metadata) currentUser.user_metadata = currentUser.metadata;
                    if (!currentUser.profile) currentUser.profile = {};
                    setUser(currentUser);
                    syncProfileFromMetadata(currentUser);
                    localStorage.setItem('capable_cached_user', JSON.stringify(currentUser));
                } else {
                    setUser(null);
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
    }, [checkSession, syncProfileFromMetadata]);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Store token in localStorage for session persistence across reloads
        if (data?.accessToken) {
            localStorage.setItem('insforge_session_token', data.accessToken);
            
            // Also set httpOnly cookie for extra persistence
            try {
                await axios.post(`${getServerUrl()}/api/auth/set-cookie`, 
                    { accessToken: data.accessToken }, 
                    { withCredentials: true }
                );
            } catch (cookieErr) {
                console.warn('Cookie set failed (non-critical):', cookieErr.message);
            }
        }
        
        if (window.ProjectStorage?.migrateLocalToDatabase) {
            await window.ProjectStorage.migrateLocalToDatabase();
        }

        return data;
    };

    const signup = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (window.ProjectStorage?.migrateLocalToDatabase) {
            await window.ProjectStorage.migrateLocalToDatabase();
        }
        
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear httpOnly auth cookie
        try {
            await axios.post(`${getServerUrl()}/api/auth/logout`, {}, { withCredentials: true });
        } catch (cookieErr) {
            console.warn('Cookie clear failed (non-critical):', cookieErr.message);
        }

        localStorage.removeItem('capable_cached_user');
        localStorage.removeItem('insforge_session_token');
        if (supabase.http) supabase.http.userToken = null;
        if (window.ProjectStorage?.logout) window.ProjectStorage.logout();
        setUser(null);
    };

    const loginWithOAuth = async (provider) => {
        if (provider === 'google') {
            // Use our own Express server's Google OAuth flow
            // The server handles Google sign-in and creates/logs into InsForge account
            const serverUrl = import.meta.env.PROD
                ? '' // Same origin in production (server serves the frontend)
                : 'http://localhost:3001';
            window.location.href = `${serverUrl}/api/auth/google`;
            return;
        }
        // Fallback for other providers (if any) - use InsForge's built-in OAuth
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                prompt: 'select_account'
            }
        });
        if (error) throw error;
        return data;
    };

    const verifyEmail = async (email, otp) => {
        const { data, error } = await supabase.auth.verifyEmail({ email, otp });
        if (error) throw error;
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
