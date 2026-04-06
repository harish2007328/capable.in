import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import { ProjectStorage } from '../services/projectStorage';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const { refreshSession } = useAuth();
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const params = new URLSearchParams(window.location.search);
        
        // If access_token is in the URL (from our custom Google OAuth server flow),
        // store it in localStorage so the InsForge SDK can use it
        const accessToken = params.get('access_token');
        if (accessToken) {
            localStorage.setItem('insforge_session_token', accessToken);
            window.history.replaceState(null, '', '/auth/callback');
        }

        // Trigger refresh in context. 
        // InsForge SDK will detect the token from localStorage.
        refreshSession().then(async (user) => {
            if (user) {
                const from = sessionStorage.getItem('auth_redirect_to') || '/dashboard';
                sessionStorage.removeItem('auth_redirect_to');
                
                try {
                    await ProjectStorage.init();
                    
                    if (typeof ProjectStorage.migrateLocalToDatabase === 'function') {
                        await ProjectStorage.migrateLocalToDatabase();
                    }
                    
                    const projects = await ProjectStorage.getAll();
                    if (projects && projects.length > 0) {
                        navigate(from, { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } catch (err) {
                    navigate(from, { replace: true });
                }
            } else {
                navigate('/login', { 
                    replace: true, 
                    state: { error: 'Authentication failed. Please try again.' } 
                });
            }
        }).catch(err => {
            console.error("Auth callback error:", err);
            navigate('/login', { replace: true });
        });
    }, [refreshSession, navigate]);

    return <FullScreenLoader />;
};

export default AuthCallbackPage;
