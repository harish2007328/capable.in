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

        console.log("🔄 Processing authentication callback...");
        console.log("📍 Current URL:", window.location.href);
        const params = new URLSearchParams(window.location.search);
        params.forEach((v, k) => console.log(`- Query Param [${k}]:`, v));
        if (window.location.hash) console.log("- Hash Fragment:", window.location.hash);
        
        // Trigger refresh in context. 
        // InsForge SDK will automatically detect the token in the URL.
        refreshSession().then(async (user) => {
            if (user) {
                console.log("✅ Welcome!", user.email);
                const from = sessionStorage.getItem('auth_redirect_to') || '/dashboard';
                sessionStorage.removeItem('auth_redirect_to');
                
                try {
                    await ProjectStorage.init();
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
                console.error("❌ Authentication failed: No session established.");
                navigate('/login', { 
                    replace: true, 
                    state: { error: 'Authentication failed. Please try again.' } 
                });
            }
        }).catch(err => {
            console.error("❌ Callback error:", err);
            navigate('/login', { replace: true });
        });
    }, [refreshSession, navigate]);

    return <FullScreenLoader />;
};

export default AuthCallbackPage;
