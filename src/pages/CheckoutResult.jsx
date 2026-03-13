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

    useEffect(() => {
        // If the URL explicitly says active or succeeded, we can trust Dodo's redirect
        if (paramStatus === 'active' || paramStatus === 'succeeded') {
            setStatus('success');
            // Refresh session to get updated Pro status in Sidebar
            if (refreshSession) refreshSession();
            return;
        }

        if (!sessionId || sessionId === '{checkout_session_id}') {
            if (!paramStatus) {
                setStatus('error');
            }
            return;
        }

        const verifySession = async () => {
            try {
                const response = await axios.get(`/api/checkout/verify/${sessionId}`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
            >
                <div className="p-8">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center py-6">
                            <Loader2 className="w-12 h-12 text-slate-900 animate-spin mb-4" />
                            <h2 className="text-xl font-bold text-slate-900">Confirming...</h2>
                            <p className="text-sm text-slate-500 mt-1">Setting up your access</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upgrade Complete</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Welcome to the Pro family. Your subscription is now active.
                            </p>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-all"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Issue</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                We couldn't verify your payment. Please try again or check your bank account.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-black transition-all"
                                >
                                    Retry Payment
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3.5 text-slate-500 hover:text-slate-900 font-medium text-sm transition-all"
                                >
                                    Return Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutResult;
