import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Rocket, ZapIcon, Globe, Shield } from 'lucide-react';

// Pricing Assets (Matching Home)
const heroVideo = "/hero-bg2-compressed.mp4";
const heroPoster = window.innerWidth < 768 ? "/mobile/hero-poster.webp" : "/hero-poster.webp";

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(false);
    const videoRef = useRef(null);

    const handleVideoLoad = (e) => {
        if (e.target) e.target.playbackRate = 0.75;
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const plans = [
        {
            name: "Starter Plan",
            description: "Perfect for individuals and builders looking to validate their first venture idea.",
            price: "0",
            period: "/mo",
            features: [
                "1 Active project",
                "Basic market analysis",
                "30-day static roadmap",
                "Limited AI mentor access",
                "Community support",
                "Local browser privacy",
                "Basic signal tracking",
                "Export as PDF",
                "Email notifications",
                "Mobile app access"
            ],
            type: "light"
        },
        {
            name: "Pro Plan",
            description: "Ideal for growing businesses needing a more sophisticated and scalable solution.",
            price: isYearly ? "120" : "15",
            period: isYearly ? "/yr" : "/mo",
            features: [
                "Unlimited active projects",
                "Deep market intelligence",
                "60-day adaptive roadmap",
                "Unlimited AI mentor chat",
                "Global market reach",
                "Priority signal detection",
                "Export reports (PDF/CSV)",
                "Advanced tracking",
                "White-label reports",
                "Team collaboration",
                "Full API access"
            ],
            type: "dark"
        }
    ];

    return (
        <div className="relative w-full bg-white lg:h-screen lg:overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
            {/* --- HERO SECTION --- */}
            <section className="relative w-full lg:h-full flex flex-col items-center overflow-x-hidden min-h-screen">
                {/* 1. Contained Video Background */}
                <div className="absolute inset-0 z-0 pt-[84px] px-2 md:px-3 pb-2 md:pb-3 pointer-events-none">
                    <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                        <video
                            ref={videoRef}
                            onLoadedMetadata={handleVideoLoad}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            poster={heroPoster}
                            className="h-full w-full object-cover"
                            style={{
                                filter: 'brightness(0.85)',
                                backgroundColor: '#0c1428'
                            }}
                        >
                            <source src={heroVideo} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.4), rgba(9, 106, 202, 0.6))' }}></div>
                    </div>
                </div>

                {/* --- CONTENT OVERLAY --- */}
                <div className="relative z-30 flex flex-col lg:flex-row items-center lg:items-center justify-between px-6 md:px-12 lg:px-20 max-w-[1500px] mx-auto w-full lg:h-full pt-[100px] lg:pt-[84px] pb-20 lg:pb-12 gap-10 lg:gap-12">
                    {/* Header Part - Left Side (Shrunk) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left lg:flex-1 lg:max-w-[550px]"
                    >
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                            <Sparkles className="w-3 h-3 text-blue-200" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">Plans</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-normal text-white leading-[1] mb-6 tracking-tightest">
                            Built for the <br />
                            <span className="font-display italic text-blue-100">relentless.</span>
                        </h1>

                        <p className="text-white/70 text-sm md:text-base font-sans leading-relaxed mb-6 max-w-sm mx-auto lg:mx-0">
                            Scale your vision with tools that adapt to your growth. Simple pricing for builders who mean business.
                        </p>
                    </motion.div>

                    {/* Integrated Pricing Cards - Right Side (Compact) */}
                    <div className="w-full lg:flex-[1.2] flex flex-col items-center lg:items-center gap-6">
                        {/* Billing Switcher (Center Top of Cards) */}
                        <div className="inline-flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${!isYearly ? 'bg-white text-blue-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${isYearly ? 'bg-white text-blue-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                            >
                                Yearly <span className="text-[8px] ml-1 opacity-70">(-33%)</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch w-full">
                            {plans.map((plan, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                                    className="relative p-1 rounded-[24px] bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl"
                                >
                                    <div className={`relative h-full rounded-[20px] p-7 md:p-8 flex flex-col border border-white/10 ${plan.type === 'dark'
                                        ? 'bg-[#12141a]/90'
                                        : 'bg-white/95'
                                        }`}>
                                        {plan.type === 'dark' && (
                                            <div className="absolute top-0 right-8 -translate-y-1/2 z-20">
                                                <div className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg italic flex items-center gap-2">
                                                    <ZapIcon className="w-3 h-3 text-white fill-white" />
                                                    Pro
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-10 text-left">
                                            <div className="flex items-baseline gap-2.5">
                                                <span className={`text-4xl lg:text-5xl font-display font-normal ${plan.type === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    ${plan.price}<span className="text-[12px] opacity-40">{plan.period}</span>
                                                </span>
                                                <span className={`text-xl font-display opacity-20 ${plan.type === 'dark' ? 'text-white' : 'text-gray-900'}`}>—</span>
                                                <h3 className={`text-2xl lg:text-3xl font-display font-normal tracking-tight ${plan.type === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {plan.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex-grow mb-6">
                                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-4 ${plan.type === 'dark' ? 'text-white/20' : 'text-gray-300'}`}>Capabilities</p>
                                            <ul className="space-y-2.5">
                                                {plan.features.slice(0, 10).map((feature, fIdx) => (
                                                    <li key={fIdx} className="flex items-center gap-2.5">
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.type === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'}`}>
                                                            <Check className={`w-2 h-2 ${plan.type === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={3} />
                                                        </div>
                                                        <span className={`text-[11px] font-sans truncate ${plan.type === 'dark' ? 'text-white/80' : 'text-gray-700 font-medium'}`}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Link
                                            to="/login"
                                            className={`w-full py-3.5 rounded-lg font-bold text-center text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-[0.98] ${plan.type === 'dark'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500'
                                                : 'bg-gray-900 text-white hover:bg-black'
                                                }`}
                                        >
                                            Get started
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TRUST SECTION (Matching Home Style) --- */}
            <section className="py-24 md:py-40 px-6 bg-[#FAFBFF]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: Globe, title: "Global Intel", desc: "Intelligence spanning 150+ international markets." },
                            { icon: Shield, title: "AES Security", desc: "Your venture data is protected by bank-level encryption." },
                            { icon: Rocket, title: "Rapid Scale", desc: "Built to support ventures from MVP to series A." },
                            { icon: Sparkles, title: "AI Precision", desc: "Market signals processed with 99.9% semantic accuracy." }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 rounded-2xl bg-white shadow-soft border border-gray-100">
                                    <item.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 tracking-tight">{item.title}</h4>
                                <p className="text-sm text-gray-500 font-sans leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER (Standard) --- */}
            <footer className="w-full bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                        <div className="order-3 md:order-1">
                            <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                © 2025 Capable Labs. All rights reserved.
                            </p>
                        </div>
                        <div className="flex items-center gap-8 order-1 md:order-2">
                            {[
                                { icon: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z', url: 'https://x.com/capable' },
                                { icon: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', url: 'https://linkedin.com/company/capable' }
                            ].map((item, i) => (
                                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-all duration-300">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
                                </a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 order-2 md:order-3">
                            <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                Build by <span className="font-bold text-gray-900 tracking-tight">Harish 💙</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PricingPage;
