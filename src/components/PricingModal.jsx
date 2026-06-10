import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, ZapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLANS, isPro } from '../config/planConfig';
import axios from 'axios';

const PricingModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loadingPlan, setLoadingPlan] = useState(null);

    if (!isOpen) return null;

    const isYearly = billingCycle === 'annual';
    const userIsPro = isPro(user);

    const handleCheckout = async (planKey) => {
        if (planKey === 'free') {
            navigate('/project');
            onClose();
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: { pathname: '/pricing' } } });
            onClose();
            return;
        }

        if (userIsPro) {
            onClose();
            return;
        }

        setLoadingPlan('pro');
        try {
            const response = await axios.post('/api/checkout', {
                userEmail: user.email,
                userId: user.id,
                planType: 'pro',
                metadata: {
                    billingCycle: isYearly ? 'yearly' : 'monthly',
                    planName: 'Pro'
                },
                returnUrl: window.location.origin
            });

            if (response.data?.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message;
            alert(`Payment setup failed: ${errorMsg}`);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[680px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 pb-0 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-display text-slate-900">Choose Your Plan</h2>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Scale your vision with the right tools. Cancel anytime.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex justify-center mt-6">
                        <div className="bg-slate-100 p-1.5 rounded-full flex gap-1">
                            {['monthly', 'annual'].map((cycle) => (
                                <button
                                    key={cycle}
                                    onClick={() => setBillingCycle(cycle)}
                                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                                        billingCycle === cycle
                                            ? 'bg-white text-[var(--brand-accent)] shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {cycle === 'monthly' ? 'Monthly' : (
                                        <>Annual <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ml-1 ${billingCycle === 'annual' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>-20%</span></>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plans Grid — matches PricingPage exactly */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-8 overflow-y-auto custom-scrollbar">

                        {/* FREE PLAN */}
                        <div className="relative p-6 rounded-[28px] bg-white border-2 border-slate-100 flex flex-col">
                            <h3 className="text-xl font-display text-gray-900 mb-4">{PLANS.free.name}</h3>

                            <div className="mb-4 flex items-baseline gap-1">
                                <span className="text-4xl font-display text-gray-900">$0</span>
                                <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider">{PLANS.free.priceLabel}</span>
                            </div>

                            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                                {PLANS.free.tagline}
                            </p>

                            <div className="space-y-3 flex-1">
                                {PLANS.free.features.map((ft, i) => (
                                    <div key={i} className={`flex items-center gap-3 ${!ft.included ? 'opacity-50' : ''}`}>
                                        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${ft.included ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                            {ft.included ? (
                                                <Check className="w-3 h-3 text-[var(--brand-accent)]" strokeWidth={3} />
                                            ) : (
                                                <X className="w-3 h-3 text-gray-400" strokeWidth={3} />
                                            )}
                                        </div>
                                        <span className={`text-[13px] font-medium ${ft.included ? 'text-gray-700' : 'text-gray-400'}`}>{ft.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleCheckout('free')}
                                className="w-full mt-6 py-3.5 rounded-2xl bg-[#0c1428] text-white font-bold text-[12px] tracking-wider uppercase hover:bg-[#1a2b54] transition-all active:scale-95 shadow-md"
                            >
                                {PLANS.free.cta}
                            </button>
                        </div>

                        {/* PRO PLAN */}
                        <div className="relative p-6 rounded-[28px] bg-gradient-to-b from-[#0c1428] to-[#0b1b3d] flex flex-col overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                            {/* Neon Backlight */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-accent)] rounded-full blur-[50px] opacity-40 -mr-8 -mt-8 pointer-events-none"></div>

                            <h3 className="text-xl font-display text-white mb-4 relative z-10">{PLANS.pro.name}</h3>

                            <div className="mb-4 flex items-baseline gap-1 relative z-10">
                                <span className="text-4xl font-display text-white">
                                    ${isYearly ? PLANS.pro.price.annual : PLANS.pro.price.monthly}
                                </span>
                                <span className="text-white/50 text-[13px] font-bold uppercase tracking-wider">
                                    {isYearly ? PLANS.pro.priceLabel.annual : PLANS.pro.priceLabel.monthly}
                                </span>
                            </div>

                            <p className="text-[13px] text-blue-100/70 leading-relaxed mb-6 relative z-10">
                                {PLANS.pro.tagline}
                            </p>

                            <div className="space-y-3 flex-1 relative z-10">
                                {PLANS.pro.features.map((ft, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-blue-400" strokeWidth={3} />
                                        </div>
                                        <span className="text-[13px] text-white font-medium">{ft.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={loadingPlan === 'pro' || userIsPro}
                                onClick={() => handleCheckout('pro')}
                                className="relative w-full mt-6 py-3.5 rounded-2xl bg-white text-gray-900 font-bold text-[12px] tracking-wider uppercase transition-all active:scale-95 shadow-lg inline-flex items-center justify-center gap-2 overflow-hidden group/btn hover:shadow-xl z-10 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent -translate-x-[150%] skew-x-12 group-hover/btn:translate-x-[50%] transition-transform duration-700 ease-out"></div>
                                {userIsPro ? (
                                    <span className="z-10">✓ Current Plan</span>
                                ) : loadingPlan === 'pro' ? (
                                    <><Loader2 className="w-4 h-4 animate-spin text-gray-900 z-10" /> <span className="z-10">Processing</span></>
                                ) : (
                                    <><ZapIcon className="w-4 h-4 fill-gray-900 text-gray-900 z-10" /> <span className="z-10">{PLANS.pro.cta}</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PricingModal;
