import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshSession } = useAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('access_token');

        if (token && token !== 'null' && token !== 'undefined') {
            console.log("Saving token and initializing session...");
            localStorage.setItem('insforge_session_token', token);
            
            // Trigger refresh in context and wait for completion
            refreshSession().then((user) => {
                if (user) {
                    console.log("🚀 Session established for:", user.email);
                    const from = sessionStorage.getItem('auth_redirect_to') || '/dashboard';
                    sessionStorage.removeItem('auth_redirect_to');
                    navigate(from, { replace: true });
                } else {
                    console.error("❌ Session verification failed: user is null");
                    navigate('/login', { replace: true, state: { error: 'Verification failed' } });
                }
            });
        } else if (localStorage.getItem('insforge_session_token')) {
            // Already have a token, just ensure context sees it
            refreshSession().then(() => navigate('/dashboard', { replace: true }));
        } else {
            console.error("No token found in callback URL");
            navigate('/login', { replace: true });
        }
    }, [refreshSession, navigate]);

    return <FullScreenLoader />;
};

export default AuthCallbackPage;
