import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Check, X, Zap, Sparkles, Loader2, ZapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLANS, isPro } from '../config/planConfig';
import axios from 'axios';

// Pricing Assets

// Animations
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeLeft = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeRight = {
    hidden: { opacity: 0, x: 12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const PricingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const userIsPro = isPro(user);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const videoRef = useRef(null);

    const isYearly = billingCycle === 'annual';

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
            videoRef.current.style.transform = 'translateZ(0)';
        }
    }, []);

    const handleCheckout = async (planName, price) => {
        if (price === 0) { navigate('/project'); return; }
        if (!user) { navigate('/login', { state: { from: { pathname: '/pricing' } } }); return; }

        setLoadingPlan(planName);
        try {
            const response = await axios.post('/api/checkout', {
                userEmail: user.email,
                userId: user.id,
                planType: planName.toLowerCase(),
                metadata: { billingCycle: isYearly ? 'yearly' : 'monthly', planName },
                returnUrl: window.location.origin
            });
            if (response.data?.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                throw new Error(response.data?.error || "No checkout URL returned from server");
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            alert(`Payment setup failed: ${err.response?.data?.details || err.response?.data?.error || err.message}`);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="relative w-full bg-transparent">

            {/* ============ MOBILE LAYOUT (< lg) ============ */}
            <div className="lg:hidden relative w-full">
                {/* Mobile Hero — title only over video */}
                <div className="relative h-[52vh] min-h-[280px] flex flex-col items-center justify-center overflow-hidden">


                    {/* Title content */}
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="relative z-30 flex flex-col items-center text-center px-6 pt-[84px]"
                    >
                        <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 cursor-default">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Transparent Pricing</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-display font-normal text-white leading-[1.05] tracking-tightest mb-3" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                            Scale.<br /><span className="font-display italic text-blue-200 opacity-90">With Vision.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} className="text-[14px] text-white/70 font-sans leading-relaxed max-w-xs">
                            Start free, upgrade when you're ready. Cancel anytime.
                        </motion.p>
                    </motion.div>
                </div>

                {/* Mobile Cards — clean white section below hero */}
                <div className="bg-white px-4 py-8 pb-16">
                    {/* Billing toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full p-1 shadow-sm">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white text-[var(--brand-accent)] shadow-sm' : 'text-gray-500'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all duration-300 flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-white text-[var(--brand-accent)] shadow-sm' : 'text-gray-500'}`}
                            >
                                Annual <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${billingCycle === 'annual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>-20%</span>
                            </button>
                        </div>
                    </div>

                    {/* Two cards stacked */}
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">

                        {/* Free Plan */}
                        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-xl font-display text-gray-900 mb-1">Free Plan</h3>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-display text-gray-900">$0</span>
                                <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">/ forever</span>
                            </div>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-5">Perfect for individuals validating their first idea.</p>
                            <div className="space-y-3 mb-6">
                                {PLANS.free.features.map((ft, i) => (
                                    <div key={i} className={`flex items-center gap-3 ${!ft.included ? 'opacity-50' : ''}`}>
                                        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${ft.included ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                            {ft.included ? <Check className="w-3 h-3 text-[var(--brand-accent)]" strokeWidth={3} /> : <X className="w-3 h-3 text-gray-400" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-[13px] font-medium ${ft.included ? 'text-gray-700' : 'text-gray-400'}`}>{ft.text}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => handleCheckout("Starter", 0)}
                                className="w-full btn-secondary text-[13px] py-3 uppercase tracking-wider font-bold"
                            >
                                Start Free
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="rounded-2xl bg-gradient-to-b from-[#0c1428] to-[#0b1b3d] p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-[var(--brand-accent)] rounded-full blur-[50px] opacity-40 -mr-8 -mt-8 pointer-events-none"></div>
                            <h3 className="text-xl font-display text-white mb-1 relative z-10">Pro Plan</h3>
                            <div className="flex items-baseline gap-1 mb-2 relative z-10">
                                <span className="text-4xl font-display text-white">${isYearly ? PLANS.pro.price.annual : PLANS.pro.price.monthly}</span>
                                <span className="text-white/50 text-[12px] font-bold uppercase tracking-wider">{isYearly ? PLANS.pro.priceLabel.annual : PLANS.pro.priceLabel.monthly}</span>
                            </div>
                            <p className="text-[13px] text-blue-100/70 leading-relaxed mb-5 relative z-10">Deep market intelligence and real-time execution tracking.</p>
                            <div className="space-y-3 mb-6 relative z-10">
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
                                disabled={loadingPlan === 'Pro' || userIsPro}
                                onClick={() => handleCheckout("Pro", isYearly ? PLANS.pro.price.annual * 12 : PLANS.pro.price.monthly)}
                                className="relative w-full btn-primary text-[13px] py-3 uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 z-10"
                            >
                                {userIsPro ? '✓ Current Plan' : loadingPlan === 'Pro' ? <><Loader2 className="w-4 h-4 animate-spin text-white" /> Processing</> : <><ZapIcon className="w-4 h-4 fill-white text-white" /> {PLANS.pro.cta}</>}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* ============ DESKTOP LAYOUT (lg+) ============ */}
            <section className="hidden lg:flex relative w-full h-[100dvh] flex-col items-center overflow-hidden">


                <motion.div
                    initial="hidden" animate="visible" variants={staggerContainer}
                    className="relative z-30 flex flex-row items-center justify-between gap-8 px-12 xl:px-24 max-w-[1400px] mx-auto w-full h-full pt-[100px] pb-10"
                >
                    {/* Left: Title */}
                    <div className="w-5/12 flex flex-col items-start text-left">
                        <motion.div variants={fadeLeft} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] cursor-default">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Transparent Pricing</span>
                        </motion.div>
                        <motion.h1 variants={fadeLeft} className="text-6xl xl:text-[80px] font-display font-normal text-white leading-[1.05] tracking-tightest mb-6" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                            Scale.<br /><span className="font-display italic text-blue-200 opacity-90">With Vision.</span>
                        </motion.h1>
                        <motion.p variants={fadeLeft} className="text-[17px] text-white/80 font-sans font-medium leading-relaxed max-w-sm">
                            Start free to validate your idea, upgrade when you need priority AI and deep execution roadmaps. Cancel anytime.
                        </motion.p>
                    </div>

                    {/* Right: Cards */}
                    <div className="w-7/12 flex flex-col items-end z-40">
                        {/* Billing Toggle */}
                        <motion.div variants={fadeRight} className="flex flex-col items-center justify-center w-full max-w-[640px] mb-8">
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 w-32 ${billingCycle === 'monthly' ? 'bg-white text-[var(--brand-accent)] shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`px-6 py-2 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-[var(--brand-accent)] shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                                >
                                    Annual <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${billingCycle === 'annual' ? 'bg-blue-100 text-blue-700' : 'bg-white/15 text-white'}`}>-20%</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Cards */}
                        <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-6 w-full max-w-[640px]">

                            {/* Free */}
                            <motion.div variants={fadeRight} className="relative p-2 rounded-[36px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_32px_120px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:-translate-y-2 flex flex-col h-[480px]">
                                <div className="h-full rounded-[28px] bg-white p-8 pb-10 flex flex-col overflow-hidden relative shadow-sm">
                                    <h3 className="text-2xl font-display text-gray-900 mb-6">Free Plan</h3>
                                    <div className="mb-6 flex items-baseline gap-1">
                                        <span className="text-6xl font-display text-gray-900">$0</span>
                                        <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider">/ forever</span>
                                    </div>
                                    <p className="text-[14px] text-gray-500 leading-relaxed mb-8 h-10">Perfect for individuals looking to validate their first idea.</p>
                                    <div className="space-y-4">
                                        {PLANS.free.features.map((ft, i) => (
                                            <div key={i} className={`flex items-center gap-3 ${!ft.included ? 'opacity-50' : ''}`}>
                                                <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${ft.included ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                                    {ft.included ? <Check className="w-3 h-3 text-[var(--brand-accent)]" strokeWidth={3} /> : <X className="w-3 h-3 text-gray-400" strokeWidth={3} />}
                                                </div>
                                                <span className={`text-[14px] font-medium ${ft.included ? 'text-gray-700' : 'text-gray-400'}`}>{ft.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 left-6 right-6">
                                    <button
                                        onClick={() => handleCheckout("Starter", 0)}
                                        className="w-full btn-secondary text-[13px] py-4 uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2"
                                    >
                                        Start Free
                                    </button>
                                </div>
                            </motion.div>

                            {/* Pro */}
                            <motion.div variants={fadeRight} className="relative p-2 rounded-[36px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_32px_120px_rgba(9,106,202,0.5)] transition-transform duration-500 hover:-translate-y-2 flex flex-col h-[480px] group">
                                <div className="absolute inset-0 bg-blue-500/10 blur-2xl group-hover:bg-blue-400/20 transition-colors pointer-events-none rounded-[36px]"></div>
                                <div className="h-full rounded-[28px] bg-gradient-to-b from-[#0c1428]/95 to-[#0b1b3d]/95 p-8 pb-10 flex flex-col overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-accent)] rounded-full blur-[60px] opacity-40 -mr-10 -mt-10 pointer-events-none"></div>
                                    <h3 className="text-2xl font-display text-white mb-6 relative z-10">Pro Plan</h3>
                                    <div className="mb-6 flex items-baseline gap-1 relative z-10">
                                        <span className="text-6xl font-display text-white">${isYearly ? PLANS.pro.price.annual : PLANS.pro.price.monthly}</span>
                                        <span className="text-white/50 text-[13px] font-bold uppercase tracking-wider">{isYearly ? PLANS.pro.priceLabel.annual : PLANS.pro.priceLabel.monthly}</span>
                                    </div>
                                    <p className="text-[14px] text-blue-100/70 leading-relaxed mb-8 h-10 relative z-10">Deep market intelligence and real-time execution tracking.</p>
                                    <div className="space-y-4 relative z-10">
                                        {PLANS.pro.features.map((ft, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-blue-400" strokeWidth={3} />
                                                </div>
                                                <span className="text-[14px] text-white font-medium">{ft.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 left-6 right-6 z-20">
                                    <button
                                        disabled={loadingPlan === 'Pro' || userIsPro}
                                        onClick={() => handleCheckout("Pro", isYearly ? PLANS.pro.price.annual * 12 : PLANS.pro.price.monthly)}
                                        className="relative w-full btn-primary text-[13px] py-4 uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 overflow-hidden"
                                    >
                                        {userIsPro ? <span className="z-10 text-white">✓ Current Plan</span> : loadingPlan === 'Pro' ? <><Loader2 className="w-4 h-4 animate-spin text-white z-10" /> <span className="z-10 text-white">Processing</span></> : <><ZapIcon className="w-4 h-4 fill-white text-white z-10" /> <span className="z-10 text-white">{PLANS.pro.cta}</span></>}
                                    </button>
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>
                </motion.div>
            </section>

        </div>
    );
};

export default PricingPage;
