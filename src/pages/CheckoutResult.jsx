import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CheckoutResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        // Simulating a verification step or just assuming success if Dodo redirected here
        // In a real app, you might call your backend to verify the session status
        const verifySession = async () => {
            // Mock verification delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            setStatus('success');
        };

        verifySession();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-slate-100"
            >
                {status === 'loading' && (
                    <div className="py-12 flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
                        <p className="text-slate-500">Please wait while we confirm your subscription...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Pro!</h2>
                        <p className="text-slate-600 mb-10 leading-relaxed">
                            Your payment was successful. Your account has been upgraded and you now have full access to all Pro features.
                        </p>

                        <div className="space-y-4">
                            <Link
                                to="/dashboard"
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/"
                                className="w-full py-4 text-slate-500 hover:text-slate-800 font-medium text-sm transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Failed</h2>
                        <p className="text-slate-600 mb-10 leading-relaxed">
                            Something went wrong with your transaction. No charges were made. Please try again or contact support if the issue persists.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                            >
                                Try Again
                            </button>
                            <Link
                                to="/"
                                className="w-full py-4 text-slate-500 hover:text-slate-800 font-medium text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CheckoutResult;
