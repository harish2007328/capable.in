import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap,
    BarChart3,
    Route as RouteIcon,
    MessageSquare,
    ShieldCheck,
    Globe,
    Sparkles,
    Rocket,
    ArrowRight,
    Trophy,
    Target,
    Layers
} from 'lucide-react';
import Logo from '../components/Logo';

const FeaturesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            title: "Instant Validation",
            tag: "Speed",
            description: "Skip months of manual research. Our AI-driven engine validates your business hypotheses against real-time market signals in seconds.",
            image: "/feature_lightning.webp"
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
            title: "Market Intelligence",
            tag: "Insight",
            description: "Deep-dive into competitive landscapes, target demographics, and industry trends with data-backed accuracy.",
            image: "/feature_market.webp"
        },
        {
            icon: <RouteIcon className="w-6 h-6 text-fuchsia-500" />,
            title: "Dynamic Roadmaps",
            tag: "Strategy",
            description: "Get a personalized 60-day execution plan that adapts to your specific goals and industry requirements.",
            image: "/feature_roadmaps.webp"
        },
        {
            icon: <MessageSquare className="w-6 h-6 text-sky-500" />,
            title: "AI Business Mentor",
            tag: "Guidance",
            description: "An interactive coach that knows your project inside out, offering context-aware support throughout your journey.",
            image: "/feature_ai.webp"
        }
    ];

    return (
        <div className="relative w-full bg-white overflow-hidden">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Platform Capabilities</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-display font-normal text-gray-900 leading-[0.95] tracking-tightest mb-8">
                            Everything you need to <br />
                            <span className="font-display italic text-[var(--brand-accent)]">build with confidence.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-sans leading-relaxed">
                            We've combined deep market research, strategic planning, and AI guidance into a single, cohesive workflow for founders.
                        </p>
                    </motion.div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -z-10 w-full h-full pointer-events-none">
                    <div className="absolute top-48 right-[10%] w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]"></div>
                    <div className="absolute top-96 left-[5%] w-96 h-96 bg-sky-400/5 rounded-full blur-[120px]"></div>
                </div>
            </section>

            {/* --- FEATURE GRID --- */}
            <section className="py-20 md:py-32 bg-[#f9f9f9]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-soft hover:shadow-card transition-all duration-500"
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="p-4 rounded-2xl bg-gray-50 group-hover:bg-blue-50 transition-colors duration-500 border border-gray-100">
                                            {feature.icon}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                                            {feature.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-display text-gray-900 mb-4 group-hover:text-[var(--brand-accent)] transition-colors duration-500">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 text-lg leading-relaxed mb-12 flex-grow">
                                        {feature.description}
                                    </p>

                                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200/50">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-0 transition-opacity duration-700"></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CORE ADVANTAGES --- */}
            <section className="py-20 md:py-40 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative order-2 lg:order-1">
                            {/* Decorative element like the homepage */}
                            <div className="rounded-[40px] overflow-hidden aspect-square md:aspect-[4/5] relative shadow-2xl">
                                <img src="/market_analysis_vector.webp" alt="Advantage" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>

                                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
                                    <div className="flex items-center gap-4 text-white">
                                        <ShieldCheck className="w-8 h-8" />
                                        <div>
                                            <p className="font-bold text-lg leading-none mb-1">Privacy First</p>
                                            <p className="text-xs text-white/70 uppercase tracking-widest font-bold">End-to-end encrypted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12 order-1 lg:order-2">
                            <h2 className="text-4xl md:text-7xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Built for the <br />
                                <span className="font-display italic text-[var(--brand-accent)]">modern founder.</span>
                            </h2>

                            <div className="space-y-10">
                                {[
                                    { title: "No Backend Hassle", desc: "We don't store your sensitive business logic on some central database. Your project data lives locally with you.", icon: <Layers className="w-5 h-5" /> },
                                    { title: "Global Reach", desc: "Our engine understands markets across 150+ countries, adapting to local nuances and regulations automatically.", icon: <Globe className="w-5 h-5" /> },
                                    { title: "Highest Precision", desc: "Using advanced NLP and market scrapers to deliver accuracy that basic chat bots simply can't reach.", icon: <Target className="w-5 h-5" /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[var(--brand-accent)] transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-gray-500 leading-relaxed font-sans">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS BAR --- */}
            <section className="w-full py-20 border-y border-gray-100 bg-[#FAFBFF]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
                        {[
                            { number: "75%", label: "Faster Launch", desc: "Founders using Capable go from idea to launch 75% faster than traditional methods." },
                            { number: "1M+", label: "Signals Scanned", desc: "Our system processes millions of market data points to give you verified confidence." },
                            { number: "95%", label: "Success Rate", desc: "Founders report significantly higher clarity and conviction after their first 60 days." }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-4">
                                <h3 className="text-6xl md:text-8xl font-display text-gray-900 leading-none">{stat.number}</h3>
                                <p className="text-sm font-bold text-[var(--brand-accent)] uppercase tracking-wider">{stat.label}</p>
                                <p className="text-gray-400 font-sans leading-relaxed">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="py-20 md:py-40">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gray-900 rounded-[40px] p-12 md:p-24 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                        <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                            <h2 className="text-4xl md:text-7xl font-display text-white leading-tight tracking-tightest">
                                Your venture journey <span className="font-display italic text-blue-400">starts here.</span>
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link to="/login" className="bg-white text-gray-900 px-10 py-5 rounded-xl font-bold text-[16px] tracking-tight hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-white/5 flex items-center justify-center gap-2">
                                    Start Building Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/pricing" className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-10 py-5 rounded-xl font-bold text-[16px] tracking-tight hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FOOTER (Matches Homepage) --- */}
            <footer className="w-full bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-[12px] text-gray-400 font-sans tracking-tight">
                                © 2025 Capable Labs. All rights reserved.
                            </p>
                        </div>
                        <div className="flex items-center gap-8">
                            {['X', 'LinkedIn', 'GitHub'].map((item, i) => (
                                <a key={i} href="#" className="text-gray-400 hover:text-gray-900 transition-colors uppercase font-bold text-[10px] tracking-widest">
                                    {item}
                                </a>
                            ))}
                        </div>
                        <div>
                            <p className="text-[12px] text-gray-400 font-sans tracking-tight">
                                Build by <span className="font-bold text-gray-900">Harish 💙</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
