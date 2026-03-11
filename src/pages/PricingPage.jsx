import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Zap, Sparkles, Loader2, ZapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Pricing Assets
const heroVideo = "/hero-bg2-compressed.mp4";
const heroPoster = window.innerWidth < 768 ? "/mobile/hero-poster.webp" : "/hero-poster.webp";

// Animations
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const fadeLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const fadeRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const PricingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loadingPlan, setLoadingPlan] = useState(null);
    const videoRef = useRef(null);

    const isYearly = billingCycle === 'annual';

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Optimize video performance
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
            videoRef.current.style.transform = 'translateZ(0)';
        }
    }, []);

    const handleCheckout = async (planName, price) => {
        if (price === 0) {
            navigate('/dashboard');
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: { pathname: '/pricing' } } });
            return;
        }

        setLoadingPlan(planName);
        try {
            const response = await axios.post('/api/checkout', {
                productId: import.meta.env.VITE_DODO_PAYMENTS_PRODUCT_ID, // Use env var
                userEmail: user.email,
                userId: user.id,
                planType: planName.toLowerCase(),
                metadata: {
                    billingCycle: isYearly ? 'yearly' : 'monthly',
                    planName: planName
                }
            });

            if (response.data && response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                throw new Error(response.data?.error || "No checkout URL returned from server");
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
        <div className="relative w-full bg-white clip-path-bounds">
            {/* --- 100vh FULL SCREEN HERO SECTION --- */}
            <section className="relative w-full h-[100dvh] min-h-[700px] flex flex-col items-center overflow-hidden">
                {/* 1. Contained Video Background (Exact Homepage Styling) */}
                <div className="absolute inset-0 z-0 pt-[84px] px-2 md:px-3 pb-2 md:pb-3 pointer-events-none">
                    <div className="relative w-full h-full rounded-2xl md:rounded-[24px] overflow-hidden shadow-2xl">
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="none"
                            poster={heroPoster}
                            fetchPriority="high"
                            className="h-full w-full object-cover scale-[1.05]"
                            style={{
                                backfaceVisibility: 'hidden',
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                                backgroundColor: '#0c1428',
                                filter: 'brightness(0.95)'
                            }}
                        >
                            <source src={heroVideo} type="video/mp4" />
                        </video>
                        {/* Cinematic Dark Overlay */}
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.45), rgba(9, 106, 202, 0.45))' }}></div>
                        <div className="absolute inset-0 z-10 bg-black/10"></div>
                    </div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-30 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 px-6 md:px-12 xl:px-24 max-w-[1400px] mx-auto w-full h-full pt-[100px] pb-10"
                >
                    {/* --- LEFT SIDE: TITLE & COPY --- */}
                    <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
                        <motion.div variants={fadeLeft} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] cursor-default">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Transparent Pricing</span>
                        </motion.div>

                        <motion.h1 variants={fadeLeft} className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-display font-normal text-white leading-[1.05] tracking-tightest mb-6" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                            Scale.<br /><span className="font-display italic text-blue-200 opacity-90">With Vision.</span>
                        </motion.h1>

                        <motion.p variants={fadeLeft} className="text-[17px] text-white/80 font-sans font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
                            Start free to validate your idea, upgrade when you need priority AI and deep execution roadmaps. Cancel anytime.
                        </motion.p>
                    </div>

                    {/* --- RIGHT SIDE: PRICING CARDS --- */}
                    <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-end z-40">
                        {/* Billing Toggle Header */}
                        <motion.div variants={fadeRight} className="flex flex-col items-center justify-center w-full max-w-[640px] mb-8">
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 w-32 ${billingCycle === 'monthly'
                                        ? 'bg-white text-[var(--brand-accent)] shadow-sm scale-100'
                                        : 'text-white/70 hover:text-white hover:bg-white/5 active:scale-95'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`px-6 py-2 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${billingCycle === 'annual'
                                        ? 'bg-white text-[var(--brand-accent)] shadow-sm scale-100'
                                        : 'text-white/70 hover:text-white hover:bg-white/5 active:scale-95'
                                        }`}
                                >
                                    Annual <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${billingCycle === 'annual' ? 'bg-blue-100 text-blue-700' : 'bg-white/15 text-white'}`}>-20%</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Cards Wrapper */}
                        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-[640px] items-stretch">

                            {/* --- FREE PLAN --- */}
                            <motion.div variants={fadeRight} className="relative p-2 rounded-[36px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_32px_120px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:-translate-y-2 flex flex-col h-[480px]">
                                <div className="h-full rounded-[28px] bg-white p-8 pb-10 flex flex-col justify-start overflow-hidden relative shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-display text-gray-900">Free Plan</h3>
                                    </div>

                                    <div className="mb-6 flex items-baseline gap-1">
                                        <span className="text-5xl lg:text-6xl font-display text-gray-900">$0</span>
                                        <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider">/ forever</span>
                                    </div>

                                    <p className="text-[14px] text-gray-500 leading-relaxed mb-8 block h-10">
                                        Perfect for individuals looking to validate their first idea.
                                    </p>

                                    <div className="space-y-4">
                                        {[
                                            "1 Active Project",
                                            "Basic Market Analysis",
                                            "30-Day Static Roadmap",
                                            "Limited AI Mentor"
                                        ].map((ft, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-[var(--brand-accent)]" strokeWidth={3} />
                                                </div>
                                                <span className="text-[14px] text-gray-700 font-medium">{ft}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-3 opacity-50">
                                            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                <X className="w-3 h-3 text-gray-400" strokeWidth={3} />
                                            </div>
                                            <span className="text-[14px] text-gray-400 font-medium">CSV/PDF Exporting</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="absolute -bottom-6 left-6 right-6">
                                    <button
                                        onClick={() => handleCheckout("Starter", 0)}
                                        className="w-full py-4 rounded-[28px] bg-[#0c1428] hover:bg-[#1a2b54] text-white font-bold text-[13px] tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 inline-flex items-center justify-center gap-2 border border-gray-800"
                                    >
                                        Start Free
                                    </button>
                                </div>
                            </motion.div>

                            {/* --- PRO PLAN --- */}
                            <motion.div variants={fadeRight} className="relative p-2 rounded-[36px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_32px_120px_rgba(9,106,202,0.5)] transition-transform duration-500 hover:-translate-y-2 flex flex-col h-[480px] group">
                                <div className="absolute inset-0 bg-blue-500/10 blur-2xl group-hover:bg-blue-400/20 transition-colors pointer-events-none rounded-[36px]"></div>

                                <div className="h-full rounded-[28px] bg-gradient-to-b from-[#0c1428]/95 to-[#0b1b3d]/95 p-8 pb-10 flex flex-col justify-start overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    {/* Neon Backlight inside the card */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-accent)] rounded-full blur-[60px] opacity-40 -mr-10 -mt-10 pointer-events-none"></div>

                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <h3 className="text-2xl font-display text-white">Pro Plan</h3>
                                    </div>

                                    <div className="mb-6 flex items-baseline gap-1 relative z-10">
                                        <span className="text-5xl lg:text-6xl font-display text-white">
                                            ${isYearly ? "11.99" : "14.99"}
                                        </span>
                                        <span className="text-white/50 text-[13px] font-bold uppercase tracking-wider">{isYearly ? '/ mo, billed yearly' : '/ mo'}</span>
                                    </div>

                                    <p className="text-[14px] text-blue-100/70 leading-relaxed mb-8 block h-10 relative z-10">
                                        Deep market intelligence and real-time execution tracking.
                                    </p>

                                    <div className="space-y-4 relative z-10">
                                        {[
                                            "Unlimited Projects",
                                            "Deep Market Intelligence",
                                            "60-Day Adaptive Roadmap",
                                            "Unlimited AI Execution",
                                            "PDF & CSV Report Export"
                                        ].map((ft, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                                                    <Check className="w-3 h-3 text-blue-400" strokeWidth={3} />
                                                </div>
                                                <span className="text-[14px] text-white font-medium">{ft}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute -bottom-6 left-6 right-6 z-20">
                                    <button
                                        disabled={loadingPlan === 'Pro'}
                                        onClick={() => handleCheckout("Pro", isYearly ? 143.88 : 14.99)}
                                        className="relative w-full py-4 rounded-[28px] bg-white border border-gray-100 text-gray-900 font-bold text-[13px] tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-[0_8px_30px_rgba(255,255,255,0.15)] inline-flex items-center justify-center gap-2 overflow-hidden group/btn hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)]"
                                    >
                                        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent -translate-x-[150%] skew-x-12 group-hover/btn:translate-x-[50%] transition-transform duration-700 ease-out"></div>
                                        {loadingPlan === 'Pro' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin text-gray-900 z-10" /> <span className="z-10">Processing</span></>
                                        ) : (
                                            <><ZapIcon className="w-4 h-4 fill-gray-900 text-gray-900 z-10" /> <span className="z-10">Go Capable</span></>
                                        )}
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
