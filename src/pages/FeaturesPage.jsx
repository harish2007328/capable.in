import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Zap, BarChart3, ShieldCheck, Globe,
    Target, Layers, Search, Workflow, Cpu, Route as RouteIcon,
    CheckCircle2, TrendingUp, BrainCircuit, Lock, Clock
} from 'lucide-react';
import BottomCTASection from '../components/home/BottomCTASection';

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } }
};

const FeaturesPage = () => {
    React.useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="relative w-full bg-white">

            {/* ═══════════════════════════════════════════════
                HERO — BLUE (matches homepage hero exactly)
                30% blue: this full-height section
            ════════════════════════════════════════════════ */}
            <section className="relative w-full h-[100dvh] min-h-[620px] flex flex-col items-center overflow-hidden">

                {/* Contained rounded panel — same as homepage */}
                <div className="absolute inset-0 z-0 pt-[84px] px-2 md:px-3 pb-2 md:pb-3 pointer-events-none">
                    <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden">
                        {/* Deep navy base */}
                        <div className="absolute inset-0" style={{ backgroundColor: '#0c1428' }} />
                        {/* Blue gradient overlay — same as homepage */}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,82,163,0.9) 0%, rgba(7,59,153,0.85) 50%, rgba(0,20,60,0.95) 100%)' }} />
                        {/* Subtle radial glow */}
                        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(41,145,248,0.25) 0%, transparent 70%)' }} />
                        {/* Grid texture */}
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                    </div>
                </div>

                {/* Hero content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="relative z-30 flex flex-col items-center justify-center px-4 max-w-7xl mx-auto w-full flex-1 pt-[100px] md:pt-[120px] pb-8"
                >
                    {/* Badge — identical to homepage */}
                    <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Intelligent Venture Platform</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={fadeUp} className="max-w-5xl text-center mb-6">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-normal text-white leading-[1.1] tracking-[-0.05em]" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                            Stop guessing.{' '}
                            <span className="font-display italic">Start building</span>
                            {' '}with real intelligence.
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto text-center font-sans font-normal leading-relaxed mb-10 px-4">
                        Capable gives you validated market intelligence, a custom 60-day roadmap, and AI guidance — all in one workflow built for founders who move fast.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/login"
                            state={{ mode: 'signup' }}
                            className="inline-flex items-center gap-2 bg-white text-[var(--brand-accent)] px-8 py-3.5 rounded-md font-bold text-sm tracking-wide hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/20"
                        >
                            Try It Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-md font-bold text-sm tracking-wide hover:bg-white/20 active:scale-[0.98] transition-all duration-200 backdrop-blur-sm"
                        >
                            View Pricing
                        </Link>
                    </motion.div>

                    {/* Social proof strip */}
                    <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-white/10 pt-8 w-full max-w-3xl">
                        {[
                            { n: '1,000+', l: 'Founders served' },
                            { n: '75%', l: 'Faster to launch' },
                            { n: '150+', l: 'Markets covered' },
                            { n: '95%', l: 'Satisfaction rate' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-display font-normal text-white leading-none tracking-tight mb-0.5">{s.n}</p>
                                <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest">{s.l}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════════
                CAPABILITIES GRID — WHITE (70%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Section header — 2-col split like ServicesSection */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Built for the way founders{' '}
                                <span className="font-display italic text-[var(--brand-accent)]">actually work.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp} className="pt-2 lg:pt-4">
                            <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                                Every feature in Capable was designed around a single question: what does a founder need to go from raw idea to funded, validated business — without wasting time or money?
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* 3-col feature cards */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {[
                            {
                                icon: <Search className="w-5 h-5" />,
                                title: "Live Market Intelligence",
                                desc: "Scans thousands of real-time market signals to surface demand clusters, whitespace opportunities, and where competitors are falling short."
                            },
                            {
                                icon: <BrainCircuit className="w-5 h-5" />,
                                title: "First-Principles AI Reasoning",
                                desc: "Goes beyond keyword matching. Our AI stress-tests your core business model using structured logic — not generic templates."
                            },
                            {
                                icon: <Workflow className="w-5 h-5" />,
                                title: "60-Day Execution Roadmap",
                                desc: "A week-by-week action plan that takes you from zero to first customer — covering brand, product, marketing, and revenue milestones."
                            },
                            {
                                icon: <BarChart3 className="w-5 h-5" />,
                                title: "Financial Viability Models",
                                desc: "Auto-generated CAC, LTV, and break-even estimates so you can assess profitability before writing a single line of code."
                            },
                            {
                                icon: <Lock className="w-5 h-5" />,
                                title: "Private Venture Vaults",
                                desc: "Each project lives in its own encrypted scope. Your IP, strategy, and data never touch a shared infrastructure layer."
                            },
                            {
                                icon: <Target className="w-5 h-5" />,
                                title: "Competitor Deconstruction",
                                desc: "Deep analysis of who's already in your space — their positioning, weaknesses, and the gaps you can own from day one."
                            },
                        ].map((f, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col group hover:border-[var(--brand-accent)]/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 text-[var(--brand-accent)] group-hover:bg-[var(--brand-accent)] group-hover:text-white group-hover:border-[var(--brand-accent)] transition-all duration-300">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-display font-normal text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                HOW IT WORKS — BLUE (30%)
                Full-bleed dark blue section
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-[#0052a3] py-20 md:py-28 relative overflow-hidden">
                {/* Glow accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#0066CC]/30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#003d7a]/60 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6">

                    {/* Header */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 items-end border-b border-white/15 pb-12"
                    >
                        <motion.div variants={fadeUp}>
                            <p className="text-blue-300 font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">The Process</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-display font-normal text-white leading-[1.05] tracking-tightest">
                                From idea to roadmap{' '}
                                <span className="font-display italic text-blue-200">in four steps.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <p className="text-blue-100/70 text-base sm:text-lg font-sans leading-relaxed border-l-2 border-white/20 pl-6 sm:pl-8">
                                Capable follows a linear four-phase sequence. Each phase builds on the last — moving your abstract concept through rigorous analysis and into a concrete, executable plan.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* 4 steps grid */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {[
                            {
                                step: '01',
                                title: 'Idea Refinement',
                                desc: 'Describe your concept. Our Semantic Engine turns raw input into a high-conviction mission statement with clear scope boundaries.',
                                icon: <Zap className="w-4 h-4" />
                            },
                            {
                                step: '02',
                                title: 'Strategic Questioning',
                                desc: 'You answer a set of high-stakes founder questions designed to surface market friction, customer pain, and hidden assumptions.',
                                icon: <Search className="w-4 h-4" />
                            },
                            {
                                step: '03',
                                title: 'Deep Synthesis Audit',
                                desc: 'A multi-lens analysis covering market size, competition, positioning, revenue mechanics, and execution risk.',
                                icon: <BarChart3 className="w-4 h-4" />
                            },
                            {
                                step: '04',
                                title: 'Roadmap Delivery',
                                desc: 'A full Venture Report and surgical 60-day action plan delivered to your dashboard — ready to execute from day one.',
                                icon: <RouteIcon className="w-4 h-4" />
                            },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="rounded-2xl bg-white/10 border border-white/15 p-8 flex flex-col backdrop-blur-sm hover:bg-white/15 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-full bg-white text-[var(--brand-accent)] flex items-center justify-center font-bold text-[13px] shrink-0">
                                        {item.step}
                                    </div>
                                    <div className="h-px flex-1 bg-white/20" />
                                </div>
                                <h3 className="text-xl font-display font-normal text-white mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-blue-100/70 text-[15px] leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                WHY CAPABLE — WHITE (70%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start pt-12 border-t border-gray-300/50"
                    >
                        {/* Left col */}
                        <motion.div variants={fadeUp}>
                            <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Why Capable</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-10">
                                The unfair advantage{' '}
                                <span className="font-display italic text-[var(--brand-accent)]">smart founders use.</span>
                            </h2>

                            <div className="flex flex-col gap-4">
                                {[
                                    {
                                        icon: <Globe className="w-5 h-5" />,
                                        title: "150+ Global Markets",
                                        desc: "Our research engine understands local nuances, regulations, and consumer behaviour across 150+ countries — not just Western markets."
                                    },
                                    {
                                        icon: <Clock className="w-5 h-5" />,
                                        title: "75% Faster Than Traditional Research",
                                        desc: "What would take a consultant team weeks to deliver, Capable produces in minutes — without sacrificing depth or accuracy."
                                    },
                                    {
                                        icon: <TrendingUp className="w-5 h-5" />,
                                        title: "Validated, Not Just Analysed",
                                        desc: "We don't just show data — we pressure-test your assumptions against real market signals to tell you if your idea actually works."
                                    },
                                    {
                                        icon: <Layers className="w-5 h-5" />,
                                        title: "Your Data Stays Yours",
                                        desc: "Isolated project scopes mean your sensitive business strategy is never pooled with other users' data. Full stop."
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 group p-5 rounded-2xl border border-gray-200 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[var(--brand-accent)] group-hover:bg-[var(--brand-accent)] group-hover:text-white group-hover:border-[var(--brand-accent)] transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-display font-normal text-lg text-gray-900 mb-1 tracking-tight">{item.title}</h4>
                                            <p className="text-gray-500 leading-relaxed font-sans text-[14px]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right col — image + overlay card */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-4">
                            <div className="rounded-2xl overflow-hidden border border-gray-300 relative group h-[280px] sm:h-[360px]">
                                <img
                                    src="/market_analysis_vector.webp"
                                    alt="Market analysis dashboard"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#003d7a]/80 via-[#0052a3]/20 to-transparent" />
                                <div className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 text-white">
                                        <ShieldCheck className="w-5 h-5 text-blue-200 shrink-0" />
                                        <div>
                                            <p className="font-bold text-sm leading-none mb-0.5">Privacy First Architecture</p>
                                            <p className="text-xs text-white/60 uppercase tracking-widest font-bold">End-to-end encrypted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist card */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-7">
                                <p className="text-gray-900 font-bold text-[11px] uppercase tracking-[0.2em] mb-5">What you get on day one</p>
                                <div className="flex flex-col gap-3">
                                    {[
                                        "Full market opportunity analysis",
                                        "Competitive landscape breakdown",
                                        "Revenue model validation",
                                        "60-day week-by-week action map",
                                        "AI mentor for ongoing guidance",
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                                            <span className="text-gray-700 text-[14px] font-sans">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                TESTIMONIAL — BLUE (30%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-0 pb-20 md:pb-28">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
                        className="rounded-2xl bg-gradient-to-br from-[#0066CC] via-[#0052a3] to-[#073B99] p-10 sm:p-14 lg:p-16 flex flex-col lg:flex-row gap-10 items-center justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="relative w-full lg:w-7/12">
                            <p className="text-2xl sm:text-3xl font-display text-white leading-[1.4] tracking-tight mb-6">
                                "Capable didn't just validate my idea — it showed me exactly where I was wrong, and gave me a smarter path forward. We launched in 6 weeks."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
                                    P
                                </div>
                                <div>
                                    <p className="text-white font-bold text-[15px]">Priya K.</p>
                                    <p className="text-white/50 font-sans text-[12px] font-bold tracking-widest uppercase">Founder, Niche Commerce</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-full lg:w-4/12 border-t lg:border-t-0 lg:border-l border-white/20 pt-8 lg:pt-0 lg:pl-12 flex flex-col gap-6">
                            {[
                                { n: '6 weeks', l: 'From idea to launch' },
                                { n: '3×', l: 'Faster than expected' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <p className="text-3xl font-display font-normal text-white leading-none tracking-tightest mb-1">{s.n}</p>
                                    <p className="text-blue-200/60 text-[12px] font-bold uppercase tracking-widest">{s.l}</p>
                                </div>
                            ))}
                            <Link
                                to="/login"
                                state={{ mode: 'signup' }}
                                className="mt-2 inline-flex items-center justify-center gap-2 bg-white text-[var(--brand-accent)] px-6 py-3 rounded-xl font-bold text-sm tracking-tight hover:bg-blue-50 active:scale-[0.98] transition-all duration-200"
                            >
                                Start Free Today <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                DELIVERABLES — WHITE (70%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-20 md:py-28 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start"
                    >
                        {/* Left */}
                        <motion.div variants={fadeUp}>
                            <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">What You Receive</p>
                            <h2 className="text-3xl sm:text-4xl lg:text-[54px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-6">
                                Two high-value assets,{' '}
                                <span className="font-display italic text-[var(--brand-accent)]">instantly delivered.</span>
                            </h2>
                            <p className="text-gray-500 font-sans leading-relaxed text-base mb-10">
                                Every completed analysis session produces two concrete deliverables — each designed to move you from thinking into doing, as fast as possible.
                            </p>
                            <div className="flex flex-col gap-4">
                                {[
                                    {
                                        title: "The Venture Report",
                                        desc: "A comprehensive 8-section analysis: market opportunity, competitor landscape, customer segments, revenue models, risk assessment, and more.",
                                        tag: "Digital Dashboard",
                                        detail: "Interactive, shareable, exportable"
                                    },
                                    {
                                        title: "60-Day Action Map",
                                        desc: "A surgical week-by-week execution board covering brand foundation, product build, go-to-market, and first customer acquisition milestones.",
                                        tag: "Live Board",
                                        detail: "Track progress as you execute"
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 border border-gray-300 bg-white p-7 rounded-2xl hover:border-[var(--brand-accent)]/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[var(--brand-accent)] group-hover:bg-[var(--brand-accent)] group-hover:text-white transition-all duration-300">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                <h4 className="font-display font-normal text-xl text-gray-900 tracking-tight group-hover:text-[var(--brand-accent)] transition-colors">{item.title}</h4>
                                                <span className="text-[10px] w-fit bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">{item.tag}</span>
                                            </div>
                                            <p className="text-[14px] text-gray-500 leading-relaxed mb-2">{item.desc}</p>
                                            <p className="text-[12px] text-[var(--brand-accent)] font-bold">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — tech stack */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-4">
                            <div className="rounded-2xl border border-gray-300 bg-white p-8 sm:p-10">
                                <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
                                    <h3 className="font-display font-normal text-2xl text-gray-900 tracking-tight">System Architecture</h3>
                                    <div className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { lbl: "FE", title: "React 18 + Vite", desc: "Instant UI — no lag, no waiting.", col: "bg-blue-50 text-blue-600 border-blue-100" },
                                        { lbl: "BE", title: "Node Orchestrator", desc: "Streaming JSON logic engine for real-time output.", col: "bg-purple-50 text-purple-600 border-purple-100" },
                                        { lbl: "DB", title: "Isolated Postgres", desc: "Per-project encrypted database scopes.", col: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                                        { lbl: "AI", title: "Multi-Agent Inference", desc: "Layered reasoning across specialised AI models.", col: "bg-orange-50 text-orange-600 border-orange-100" },
                                    ].map((tech, i) => (
                                        <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${tech.col}`}>{tech.lbl}</div>
                                            <div>
                                                <p className="font-bold text-[14px] text-gray-900">{tech.title}</p>
                                                <p className="text-[13px] text-gray-500 mt-0.5">{tech.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing nudge card */}
                            <div className="rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 to-white p-7 flex flex-col gap-5">
                                <div>
                                    <p className="text-gray-900 font-bold text-base mb-1">Ready to see it in action?</p>
                                    <p className="text-gray-500 text-[14px] leading-relaxed">Start free — no credit card required. Your first analysis is on us.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        to="/login"
                                        state={{ mode: 'signup' }}
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                                    >
                                        Get Started Free
                                    </Link>
                                    <Link
                                        to="/pricing"
                                        className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all duration-300"
                                    >
                                        Pricing
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                BOTTOM CTA + FOOTER
            ════════════════════════════════════════════════ */}
            <BottomCTASection />

            <footer className="w-full bg-white py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[12px] text-gray-400 font-sans">© 2025 Capable Labs. All rights reserved.</p>
                        <div className="flex items-center gap-8">
                            {[
                                { label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z' },
                                { label: 'LinkedIn', d: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                                { label: 'GitHub', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
                            ].map((s, i) => (
                                <a key={i} href="#" aria-label={s.label} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                                </a>
                            ))}
                        </div>
                        <p className="text-[12px] text-gray-400 font-sans">Built by <span className="font-bold text-gray-900">Harish 💙</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
