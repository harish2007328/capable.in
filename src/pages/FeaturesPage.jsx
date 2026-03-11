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
    Layers,
    Search,
    Eye,
    Workflow,
    Cpu
} from 'lucide-react';
import Logo from '../components/Logo';
import BottomCTASection from '../components/home/BottomCTASection';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const FeaturesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: <Search className="w-6 h-6 text-[#2991F8]" />,
            title: "Market Signal Mapping",
            description: "Scans current market structures to identify unmet search intent and competitive clusters."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-[#2991F8]" />,
            title: "Isolated Project Scopes",
            description: "Each venture is contained within its own encrypted database scope for total asset privacy."
        },
        {
            icon: <Cpu className="w-6 h-6 text-[#2991F8]" />,
            title: "Synthetic Reasoning",
            description: "Generates structural logic rather than generic templates using first-principles AI."
        },
        {
            icon: <Workflow className="w-6 h-6 text-[#2991F8]" />,
            title: "60-Day Action Map",
            description: "Generates a week-by-week execution plan from foundation to initial customer acquisition."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-[#2991F8]" />,
            title: "Economic Projections",
            description: "Calculates initial CAC and LTV heuristic models to validate venture profitability."
        },
        {
            icon: <Eye className="w-6 h-6 text-[#2991F8]" />,
            title: "Radical Clarity",
            description: "Strips away feature-bloat to focus on testing the core atomic problem of your business."
        }
    ];

    return (
        <div className="relative w-full bg-white overflow-hidden">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-24 pb-12 md:pt-36 md:pb-16 px-6">
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

            {/* --- FEATURE GRID (Linear 3x2) --- */}
            <section className="py-16 md:py-24 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="max-w-[1240px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="relative flex flex-col items-start group cursor-default p-8 md:p-10 rounded-[28px] bg-white border border-gray-100 shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden"
                            >
                                {/* Subtle CSS Grid Background Layer */}
                                <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                                <div className="relative z-10 w-12 h-12 rounded-[14px] bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200/50 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-400 group-hover:border-[#2991F8]/30">
                                    {feature.icon}
                                </div>
                                <h3 className="relative z-10 text-[20px] md:text-[22px] font-bold text-gray-900 mb-3 tracking-tight leading-snug group-hover:text-[var(--brand-accent)] transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="relative z-10 text-gray-500 text-[15px] leading-relaxed max-w-[95%]">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CORE ADVANTAGES --- */}
            <section className="py-20 md:py-40 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                    >
                        <motion.div variants={fadeUp} className="relative order-2 lg:order-1">
                            {/* Decorative element like the homepage */}
                            <div className="rounded-[40px] overflow-hidden aspect-square md:aspect-[4/5] relative shadow-2xl group">
                                <img src="/market_analysis_vector.webp" alt="Advantage" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                        </motion.div>

                        <div className="space-y-12 order-1 lg:order-2">
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-7xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Built for the <br />
                                <span className="font-display italic text-[var(--brand-accent)]">modern founder.</span>
                            </motion.h2>

                            <motion.div variants={staggerContainer} className="space-y-10">
                                {[
                                    { title: "No Backend Hassle", desc: "We don't store your sensitive business logic on some central database. Your project data lives locally with you.", icon: <Layers className="w-5 h-5" /> },
                                    { title: "Global Reach", desc: "Our engine understands markets across 150+ countries, adapting to local nuances and regulations automatically.", icon: <Globe className="w-5 h-5" /> },
                                    { title: "Highest Precision", desc: "Using advanced NLP and market scrapers to deliver accuracy that basic chat bots simply can't reach.", icon: <Target className="w-5 h-5" /> }
                                ].map((item, i) => (
                                    <motion.div variants={fadeUp} key={i} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[var(--brand-accent)] border border-gray-100 group-hover:border-blue-200 transition-all duration-300 shadow-sm">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-gray-500 leading-relaxed font-sans">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- STATS BAR --- */}
            <section className="w-full py-20 border-y border-gray-100 bg-[#FAFBFF]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24"
                    >
                        {[
                            { number: "75%", label: "Faster Launch", desc: "Founders using Capable go from idea to launch 75% faster than traditional methods." },
                            { number: "1M+", label: "Signals Scanned", desc: "Our system processes millions of market data points to give you verified confidence." },
                            { number: "95%", label: "Success Rate", desc: "Founders report significantly higher clarity and conviction after their first 60 days." }
                        ].map((stat, i) => (
                            <motion.div variants={fadeUp} key={i} className="space-y-4 text-center md:text-left">
                                <h3 className="text-6xl md:text-8xl font-display text-gray-900 leading-none">{stat.number}</h3>
                                <div className="w-12 h-1 bg-gradient-to-r from-[var(--brand-accent)] to-transparent mb-4 mx-auto md:mx-0"></div>
                                <p className="text-sm font-bold text-[var(--brand-accent)] uppercase tracking-wider">{stat.label}</p>
                                <p className="text-gray-500 font-sans leading-relaxed">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- WORKFLOW SECTION --- */}
            <section className="py-20 md:py-32 bg-white relative overflow-hidden">
                <div className="max-w-[1240px] mx-auto px-6">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
                    >
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-display font-normal text-gray-900 leading-tight mb-6 tracking-tightest">
                            The Synthesis <span className="font-display italic text-[var(--brand-accent)]">Protocol.</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-gray-500 leading-relaxed">
                            Capable follows a linear 4-phase sequence to move your abstract concept from zero to execution-ready.
                        </motion.p>
                    </motion.div>

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            { step: "01", title: "Idea Enhancement", desc: "Our Semantic Engine refines your raw input into a high-conviction mission statement.", icon: <Zap className="w-5 h-5" /> },
                            { step: "02", title: "Deep Discovery", desc: "We generate high-stakes strategic questions to probe for structural market friction.", icon: <Search className="w-5 h-5" /> },
                            { step: "03", title: "Synthetic Audit", desc: "A multi-lens audit covering positioning, revenue feasibility, and technical constraints.", icon: <ShieldCheck className="w-5 h-5" /> },
                            { step: "04", title: "Roadmap Generation", desc: "A surgical 60-day action plan that guides you from foundation to first user acquisition.", icon: <RouteIcon className="w-5 h-5" /> }
                        ].map((item, i) => (
                            <motion.div variants={fadeUp} key={i} className="relative group hover:-translate-y-2 transition-transform duration-500">
                                <div className="p-8 pb-10 rounded-[28px] bg-white border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-card transition-all duration-300 h-full flex flex-col relative z-10">
                                    <div className="text-[12px] font-bold text-gray-400 mb-6 uppercase tracking-widest group-hover:text-[var(--brand-accent)] transition-colors">Phase {item.step}</div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200/50 flex items-center justify-center text-[var(--brand-accent)] mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-[20px] font-bold text-gray-900 mb-3">{item.title}</h4>
                                    <p className="text-gray-500 text-[15px] leading-relaxed">{item.desc}</p>
                                </div>
                                {i !== 3 && <div className="hidden lg:block absolute top-[50%] -right-8 w-8 h-[1px] bg-gradient-to-r from-gray-200 to-transparent z-0 pointer-events-none"></div>}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- DELIVERABLES SECTION --- */}
            <section className="py-20 md:py-32 bg-[#F8FAFC]">
                <div className="max-w-[1240px] mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <div className="w-full lg:w-1/2 space-y-10">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={staggerContainer}
                            >
                                <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                                    <Trophy className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Tactical Deliverables</span>
                                </motion.div>
                                <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-6">
                                    Everything you need to <span className="font-display italic text-[var(--brand-accent)]">execute.</span>
                                </motion.h2>
                                <motion.p variants={fadeUp} className="text-lg text-gray-500 leading-relaxed mb-10">
                                    Every completed discovery session produces 4 high-value technical assets, giving you immediate tactical clarity to build.
                                </motion.p>
                                
                                <div className="space-y-6">
                                    {[
                                        { title: "The Venture Report", desc: "Comprehensive analysis covering summary, validation, and risks.", tag: "Digital Dashboard" },
                                        { title: "60-Day Action Map", desc: "Week-by-week execution steps from brand foundation to customer acquisition.", tag: "Interactive Board" }
                                    ].map((item, i) => (
                                        <motion.div variants={fadeUp} key={i} className="flex gap-5 border border-gray-100 bg-white p-6 rounded-[24px] shadow-sm hover:shadow-card hover:border-[#2991F8]/30 transition-all group">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-[#2991F8]/10 flex items-center justify-center transition-colors">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-accent)]"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-[var(--brand-accent)] transition-colors">{item.title}</h4>
                                                    <span className="text-[10px] w-fit bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">{item.tag}</span>
                                                </div>
                                                <p className="text-[15px] text-gray-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="w-full lg:w-1/2">
                            <motion.div 
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={fadeUp}
                                className="relative rounded-[40px] bg-white border border-gray-100 p-8 md:p-12 shadow-soft overflow-hidden group hover:shadow-card transition-all duration-700"
                            >
                                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-[80px] -z-10 mt-[-50px] mr-[-50px] group-hover:bg-blue-100 transition-colors duration-700"></div>
                                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                                        <h3 className="font-bold text-gray-900 text-xl tracking-tight">System Architecture</h3>
                                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-[12px] flex items-center justify-center"><Layers className="w-5 h-5 text-gray-400" /></div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {[
                                            { title: "Frontend Client", desc: "React 18 bundled with Vite for zero-lag interactions.", col: "bg-blue-100 text-blue-600 border-blue-200", lbl: "FE" },
                                            { title: "Node Orchestrator", desc: "High-speed backend JSON streaming & logic routing.", col: "bg-purple-100 text-purple-600 border-purple-200", lbl: "BE" },
                                            { title: "Venture Instances", desc: "Isolated PostgreSQL database structures for security.", col: "bg-emerald-100 text-emerald-600 border-emerald-200", lbl: "DB" },
                                            { title: "Inference Engine", desc: "Multi-layered agents utilizing specialized reasoning.", col: "bg-orange-100 text-orange-600 border-orange-200", lbl: "AI" }
                                        ].map((tech, i) => (
                                            <div key={i} className="flex gap-5 items-center group/item hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors cursor-default">
                                                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-xs ${tech.col} border bg-gradient-to-br from-white/50 group-hover/item:scale-110 transition-transform shadow-sm`}>
                                                    {tech.lbl}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[15px] text-gray-900">{tech.title}</p>
                                                    <p className="text-[13px] text-gray-500 mt-0.5">{tech.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === BOTTOM CTA BANNER === */}
            <BottomCTASection />

            {/* === FOOTER === */}
            <footer className="w-full bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4"
                    >
                        {/* Copyright */}
                        <motion.div variants={fadeUp} className="order-3 md:order-1">
                            <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                © 2025 Capable Labs. All rights reserved.
                            </p>
                        </motion.div>

                        {/* Social Icons */}
                        <motion.div variants={fadeUp} className="flex items-center gap-8 order-1 md:order-2">
                            {[
                                { icon: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z' },
                                { icon: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                                { icon: 'GitHub', path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' }
                            ].map((item, i) => (
                                <a key={i} href="#" aria-label={`Follow us on ${item.icon}`} className="text-gray-500 hover:text-gray-900 transition-all duration-300">
                                    <svg className="w-4 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
                                </a>
                            ))}
                        </motion.div>

                        {/* Credits */}
                        <motion.div variants={fadeUp} className="order-2 md:order-3">
                            <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                Build by <span className="font-bold text-gray-900 hover:text-[var(--brand-accent)] cursor-default transition-colors">Harish 💙</span>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
