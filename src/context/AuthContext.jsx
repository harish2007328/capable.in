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

    // DEBUG: Log user state changes with deep inspection
    useEffect(() => {
        if (user) {
            console.log("👤 Auth User Object:", JSON.stringify(user, null, 2));
            
            // Check for identities which often hide the metadata
            if (user.identities) {
                console.log("- Identities found:", user.identities.length);
                user.identities.forEach((id, i) => {
                    console.log(`  Identity [${i}] (${id.provider}):`, id.identity_data || id.metadata);
                });
            }
        }
    }, [user]);

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

    const syncProfileFromMetadata = React.useCallback(async (currentUser) => {
        if (!currentUser) return;
        
        console.log("🔄 Syncing profile for:", currentUser.email);

        // 1. Fetch the full profile from the auth service to be sure
        const { data: fullProfile } = await supabase.auth.getProfile(currentUser.id);
        console.log("- Auth.getProfile result:", fullProfile);

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

        console.log("- Final Resolved Name:", finalName);
        console.log("- Final Resolved Avatar:", finalAvatar);

        // 3. Ensure a row exists in the 'profiles' table
        try {
            const { data: existingProfile, error: fetchError } = await supabase.database
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();
            
            if (fetchError) throw fetchError;

            if (!existingProfile) {
                console.log("🌱 Creating missing profile record in database...");
                await supabase.database
                    .from('profiles')
                    .insert({
                        id: currentUser.id,
                        email: currentUser.email,
                        name: finalName,
                        avatar_url: finalAvatar
                    });
            } else if ((!existingProfile.avatar_url && finalAvatar) || (finalName && !existingProfile.name)) {
                console.log("🔄 Updating profile record in database...");
                await supabase.database
                    .from('profiles')
                    .update({ 
                        avatar_url: finalAvatar || existingProfile.avatar_url, 
                        name: finalName || existingProfile.name 
                    })
                    .eq('id', currentUser.id);
                
                // Update local state with the rich profile data
                if (existingProfile) {
                    currentUser.profile = { ...currentUser.profile, ...existingProfile };
                    setUser({ ...currentUser });
                }
            }
        } catch (dbErr) {
            console.warn("Database profile sync failed:", dbErr.message);
        }
    }, [updateUser]);

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
        localStorage.removeItem('capable_cached_user');
        if (window.ProjectStorage?.logout) window.ProjectStorage.logout();
        setUser(null);
    };

    const loginWithOAuth = async (provider) => {
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
