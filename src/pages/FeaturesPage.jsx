import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, BarChart3, Route as RouteIcon, ShieldCheck,
    Globe, Sparkles, ArrowRight, Trophy, Target,
    Layers, Search, Eye, Workflow, Cpu
} from 'lucide-react';
import BottomCTASection from '../components/home/BottomCTASection';

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
};

const FeaturesPage = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const features = [
        { icon: <Search className="w-5 h-5 text-[var(--brand-accent)]" />, title: "Market Signal Mapping", description: "Scans current market structures to identify unmet search intent and competitive clusters." },
        { icon: <ShieldCheck className="w-5 h-5 text-[var(--brand-accent)]" />, title: "Isolated Project Scopes", description: "Each venture is contained within its own encrypted database scope for total asset privacy." },
        { icon: <Cpu className="w-5 h-5 text-[var(--brand-accent)]" />, title: "Synthetic Reasoning", description: "Generates structural logic rather than generic templates using first-principles AI." },
        { icon: <Workflow className="w-5 h-5 text-[var(--brand-accent)]" />, title: "60-Day Action Map", description: "Generates a week-by-week execution plan from foundation to initial customer acquisition." },
        { icon: <BarChart3 className="w-5 h-5 text-[var(--brand-accent)]" />, title: "Economic Projections", description: "Calculates initial CAC and LTV heuristic models to validate venture profitability." },
        { icon: <Eye className="w-5 h-5 text-[var(--brand-accent)]" />, title: "Radical Clarity", description: "Strips away feature-bloat to focus on testing the core atomic problem of your business." }
    ];

    return (
        <div className="relative w-full bg-white">

            {/* === HERO === */}
            <section className="w-full bg-white pt-28 pb-16 md:pt-36 md:pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="max-w-4xl"
                    >
                        <motion.p variants={fadeUp} className="text-gray-400 font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                            Platform Capabilities
                        </motion.p>
                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-6">
                            Everything you need to <br className="hidden sm:block" />
                            <span className="font-display italic text-[var(--brand-accent)]">build with confidence.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl font-sans leading-relaxed">
                            We've combined deep market research, strategic planning, and AI guidance into a single, cohesive workflow for founders.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* === FEATURE GRID === */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-12 border-t border-gray-300/50"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeUp}
                                className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col hover:border-gray-400 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-display font-normal text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* === CORE ADVANTAGES === */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start pt-12 border-t border-gray-300/50"
                    >
                        {/* Left: headline + list */}
                        <motion.div variants={fadeUp}>
                            <p className="text-gray-400 font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Why Capable</p>
                            <h2 className="text-4xl sm:text-5xl lg:text-[60px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-8">
                                Built for the <span className="font-display italic text-[var(--brand-accent)]">modern founder.</span>
                            </h2>

                            <div className="flex flex-col gap-8 mt-10">
                                {[
                                    { title: "No Backend Hassle", desc: "We don't store your sensitive business logic on some central database. Your project data lives locally with you.", icon: <Layers className="w-5 h-5" /> },
                                    { title: "Global Reach", desc: "Our engine understands markets across 150+ countries, adapting to local nuances and regulations automatically.", icon: <Globe className="w-5 h-5" /> },
                                    { title: "Highest Precision", desc: "Using advanced NLP and market scrapers to deliver accuracy that basic chat bots simply can't reach.", icon: <Target className="w-5 h-5" /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[var(--brand-accent)] group-hover:border-blue-200 transition-all">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-display font-normal text-xl text-gray-900 mb-1 tracking-tight">{item.title}</h4>
                                            <p className="text-gray-500 leading-relaxed font-sans text-[15px]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: image card */}
                        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-gray-300 relative group h-[300px] sm:h-[400px] md:h-[500px]">
                            <img src="/market_analysis_vector.webp" alt="Market analysis" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl">
                                <div className="flex items-center gap-3 text-white">
                                    <ShieldCheck className="w-6 h-6" />
                                    <div>
                                        <p className="font-bold text-base leading-none mb-1">Privacy First</p>
                                        <p className="text-xs text-white/70 uppercase tracking-widest font-bold">End-to-end encrypted</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* === STATS === */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 border-t border-gray-300/50"
                    >
                        {[
                            { number: "75%", label: "Faster Launch", desc: "Founders using Capable go from idea to launch 75% faster than traditional methods." },
                            { number: "1M+", label: "Signals Scanned", desc: "Our system processes millions of market data points to give you verified confidence." },
                            { number: "95%", label: "Success Rate", desc: "Founders report significantly higher clarity and conviction after their first 60 days." }
                        ].map((stat, i) => (
                            <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-gray-300 p-8 sm:p-10">
                                <p className="text-5xl sm:text-6xl font-display font-normal text-gray-900 leading-none tracking-tightest mb-4">{stat.number}</p>
                                <p className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <p className="text-gray-500 font-sans text-[14px] leading-relaxed">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* === WORKFLOW / PHASES === */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="text-4xl sm:text-5xl lg:text-[60px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                The Synthesis <span className="font-display italic text-[var(--brand-accent)]">Protocol.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp} className="flex flex-col">
                            <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-xl pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                                Capable follows a linear 4-phase sequence to move your abstract concept from zero to execution-ready.
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {[
                            { step: '01', title: 'Idea Enhancement', desc: 'Our Semantic Engine refines your raw input into a high-conviction mission statement.', icon: <Zap className="w-4 h-4" /> },
                            { step: '02', title: 'Deep Discovery', desc: 'We generate high-stakes strategic questions to probe for structural market friction.', icon: <Search className="w-4 h-4" /> },
                            { step: '03', title: 'Synthetic Audit', desc: 'A multi-lens audit covering positioning, revenue feasibility, and technical constraints.', icon: <ShieldCheck className="w-4 h-4" /> },
                            { step: '04', title: 'Roadmap Generation', desc: 'A surgical 60-day action plan that guides you from foundation to first user acquisition.', icon: <RouteIcon className="w-4 h-4" /> }
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp} className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col hover:border-gray-400 transition-colors group">
                                <div className="w-8 h-8 shrink-0 mb-6 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center font-bold text-[13px]">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-display font-normal text-gray-900 mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* === DELIVERABLES === */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp} className="w-full lg:w-1/2">
                            <p className="text-gray-400 font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Tactical Deliverables</p>
                            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-6">
                                Everything you need to <span className="font-display italic text-[var(--brand-accent)]">execute.</span>
                            </h2>
                            <p className="text-gray-500 font-sans leading-relaxed text-base mb-10">
                                Every completed discovery session produces high-value technical assets, giving you immediate tactical clarity to build.
                            </p>

                            <div className="flex flex-col gap-4">
                                {[
                                    { title: "The Venture Report", desc: "Comprehensive analysis covering summary, validation, and risks.", tag: "Digital Dashboard" },
                                    { title: "60-Day Action Map", desc: "Week-by-week execution steps from brand foundation to customer acquisition.", tag: "Interactive Board" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 border border-gray-300 bg-white p-6 sm:p-8 rounded-2xl hover:border-gray-400 transition-colors group">
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-accent)]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                                <h4 className="font-display font-normal text-xl text-gray-900 tracking-tight group-hover:text-[var(--brand-accent)] transition-colors">{item.title}</h4>
                                                <span className="text-[10px] w-fit bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">{item.tag}</span>
                                            </div>
                                            <p className="text-[15px] text-gray-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: tech stack card */}
                        <motion.div variants={fadeUp} className="w-full lg:w-1/2">
                            <div className="rounded-2xl border border-gray-300 bg-white p-8 sm:p-10">
                                <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
                                    <h3 className="font-display font-normal text-2xl text-gray-900 tracking-tight">System Architecture</h3>
                                    <div className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {[
                                        { title: "Frontend Client", desc: "React 18 bundled with Vite for zero-lag interactions.", col: "bg-blue-50 text-blue-600 border-blue-200", lbl: "FE" },
                                        { title: "Node Orchestrator", desc: "High-speed backend JSON streaming & logic routing.", col: "bg-purple-50 text-purple-600 border-purple-200", lbl: "BE" },
                                        { title: "Venture Instances", desc: "Isolated PostgreSQL database structures for security.", col: "bg-emerald-50 text-emerald-600 border-emerald-200", lbl: "DB" },
                                        { title: "Inference Engine", desc: "Multi-layered agents utilizing specialized reasoning.", col: "bg-orange-50 text-orange-600 border-orange-200", lbl: "AI" }
                                    ].map((tech, i) => (
                                        <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${tech.col}`}>
                                                {tech.lbl}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[14px] text-gray-900">{tech.title}</p>
                                                <p className="text-[13px] text-gray-500 mt-0.5">{tech.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* === BOTTOM CTA === */}
            <BottomCTASection />

            {/* === FOOTER === */}
            <footer className="w-full bg-white py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[12px] text-gray-400 font-sans tracking-tight">© 2025 Capable Labs. All rights reserved.</p>
                        <div className="flex items-center gap-8">
                            {[
                                { icon: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z' },
                                { icon: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                                { icon: 'GitHub', path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' }
                            ].map((item, i) => (
                                <a key={i} href="#" aria-label={`Follow us on ${item.icon}`} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
                                </a>
                            ))}
                        </div>
                        <p className="text-[12px] text-gray-400 font-sans tracking-tight">
                            Built by <span className="font-bold text-gray-900">Harish 💙</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
