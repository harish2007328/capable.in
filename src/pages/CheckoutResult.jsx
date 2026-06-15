import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import axios from 'axios';

const CheckoutResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshSession } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const sessionId = searchParams.get('session_id');
    const paramStatus = searchParams.get('status');
    const videoRef = React.useRef(null);

    const heroVideo = "/hero-bg2-compressed.mp4";
    const heroPoster = window.innerWidth < 768 ? "/mobile/hero-poster.webp" : "/hero-poster.webp";

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = 0.75;

        const subId = searchParams.get('subscription_id');
        const hasSession = sessionId && sessionId !== '{checkout_session_id}';
        const hasSub = subId && subId !== '{subscription_id}';

        if (!hasSession && !hasSub) {
            if (paramStatus === 'active' || paramStatus === 'succeeded') {
                setStatus('success');
                if (refreshSession) refreshSession();
            } else if (!paramStatus) {
                setStatus('error');
            }
            return;
        }

        const verifySession = async () => {
            try {
                const response = await axios.get(`/api/checkout/verify`, {
                    params: { session_id: hasSession ? sessionId : undefined, subscription_id: hasSub ? subId : undefined }
                });
                const data = response.data;
                if (data.status === 'succeeded' || data.status === 'active' || data.payment_status === 'succeeded') {
                    setStatus('success');
                    if (refreshSession) refreshSession();
                } else if (data.status === 'failed' || data.payment_status === 'failed') {
                    setStatus('error');
                } else {
                    setTimeout(verifySession, 3000);
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus('error');
            }
        };

        verifySession();
    }, [sessionId, paramStatus, refreshSession]);

    return (
        <div className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
            {/* Background Video (Same as Homepage) */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={heroPoster}
                    className="h-full w-full object-cover scale-[1.05]"
                    style={{ filter: 'brightness(0.6)' }}
                >
                    <source src={heroVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
            </div>

            {/* Ultra-Minimal Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[340px] px-8 py-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
                        <h2 className="text-xl font-display text-white tracking-tight">Verifying Payment...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-sky-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-6 h-6 text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-display text-white mb-2 leading-tight">Welcome to Pro</h2>
                        <p className="text-white/60 text-sm mb-8">Your subscription is now active.</p>

                        <button
                            onClick={() => navigate('/onboard')}
                            className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
                        >
                            Start Onboarding
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-display text-white mb-2 leading-tight">Payment Failed</h2>
                        <p className="text-white/60 text-sm mb-8">Something went wrong. No charges were made.</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full btn-primary text-sm py-3"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-2 text-white/50 hover:text-white font-medium text-xs transition-all tracking-wider uppercase"
                            >
                                Return to Home
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default CheckoutResult;
