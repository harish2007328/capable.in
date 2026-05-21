import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const heroVideo = '/hero-bg2-compressed.mp4';
const heroPoster = typeof window !== 'undefined' && window.innerWidth < 768 ? '/mobile/hero-poster.webp' : '/hero-poster.webp';
import {
    ArrowRight, Zap, BarChart3, ShieldCheck, Globe,
    Target, Layers, Search, Workflow, Cpu, Route as RouteIcon,
    CheckCircle2, TrendingUp, BrainCircuit, Lock, Clock,
    Sparkles, XCircle, Plus, Play, FileText, Check
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

    useEffect(() => { window.scrollTo(0, 0); }, []);
    const videoRef = useRef(null);
    const [activeEcosystemTab, setActiveEcosystemTab] = useState('developers');
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
            videoRef.current.style.transform = 'translateZ(0)';
        }
    }, []);

    return (
        <div className="relative w-full bg-white">

            {/* ═══════════════════════════════════════════════
                HERO — BLUE (matches homepage hero exactly)
                30% blue: this full-height section
            ════════════════════════════════════════════════ */}
            <section className="relative w-full h-[100dvh] min-h-[620px] flex flex-col items-center overflow-hidden">

                {/* Exact same video container as homepage hero */}
                <div className="absolute inset-0 z-0 pt-[84px] px-2 md:px-3 pb-2 md:pb-3 pointer-events-none">
                    <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="none"
                            poster={heroPoster}
                            className="h-full w-full object-cover"
                            style={{
                                backfaceVisibility: 'hidden',
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                                backgroundColor: '#0c1428',
                                filter: 'brightness(0.9)'
                            }}
                        >
                            <source src={heroVideo} type="video/mp4" />
                            <track kind="captions" srcLang="en" label="English" />
                        </video>
                        {/* Same blue overlay as homepage */}
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }} />
                    </div>
                </div>

                {/* Hero content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="relative z-30 flex flex-col items-center justify-center px-4 max-w-7xl mx-auto w-full flex-1 pt-[90px] md:pt-[115px] pb-4 md:pb-8"
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

                    {/* Section header — exact ServicesSection pattern */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 sm:mb-20 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp}>
                            <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Capabilities</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Built for the way founders{' '}
                                <span className="font-display italic text-[var(--brand-accent)]">actually work.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp} className="flex flex-col">
                            <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-lg mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                                Every feature in Capable was designed around a single question: what does a founder need to go from raw idea to funded, validated business — without wasting time or money?
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* 3-col feature cards with custom micro-UI visuals */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {[
                            {
                                icon: <Search className="w-5 h-5" />,
                                title: "Live Market Intelligence",
                                desc: "Scans thousands of real-time market signals to surface demand clusters, whitespace opportunities, and where competitors are falling short.",
                                visual: (
                                    <div className="h-32 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-between overflow-hidden relative font-mono text-[10px]">
                                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                                            <span className="text-gray-400">SIGNAL SCANNER</span>
                                            <span className="text-[var(--brand-accent)] font-bold animate-pulse">● LIVE</span>
                                        </div>
                                        <div className="flex items-end justify-between h-14 pt-2">
                                            {[40, 25, 60, 45, 80, 55, 95, 70, 85].map((h, i) => (
                                                <div key={i} className="w-[10%] bg-blue-100 border-t-2 border-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                                            <span>DEMAND CLUSTERS SURFACED: +14</span>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: <BrainCircuit className="w-5 h-5" />,
                                title: "First-Principles Reasoning",
                                desc: "Goes beyond simple keyword matching. Our AI stress-tests your core business model using structured logic — not generic templates.",
                                visual: (
                                    <div className="h-32 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-between relative font-mono text-[9px]">
                                        <div className="flex items-center justify-between text-gray-400 border-b border-gray-200/60 pb-2">
                                            <span>LOGIC PIPELINE</span>
                                            <span className="text-emerald-600 font-bold">100% VALIDATED</span>
                                        </div>
                                        <div className="flex flex-col gap-2 my-2">
                                            <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-gray-200">
                                                <span className="text-gray-500">Hypothesis validation</span>
                                                <span className="text-emerald-500 font-bold">PASS</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-gray-200">
                                                <span className="text-gray-500">Revenue model stress</span>
                                                <span className="text-emerald-500 font-bold">PASS</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: <Workflow className="w-5 h-5" />,
                                title: "60-Day Action Roadmap",
                                desc: "A week-by-week action plan that takes you from zero to first customer — covering brand, product, marketing, and revenue milestones.",
                                visual: (
                                    <div className="h-32 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-between relative font-sans">
                                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 border-b border-gray-200/60 pb-2">
                                            <span>EXECUTION TRACKER</span>
                                            <span className="text-gray-500">WEEK 3 OF 8</span>
                                        </div>
                                        <div className="flex gap-2 py-1 overflow-x-hidden">
                                            {[
                                                { label: "W1: Brand Setup", done: true },
                                                { label: "W2: Landing Page", done: true },
                                                { label: "W3: Beta Signup", active: true },
                                                { label: "W4: GTM Kickoff", done: false }
                                            ].map((w, idx) => (
                                                <div key={idx} className={`flex-1 shrink-0 p-2 rounded-lg text-[9px] font-bold border text-center ${w.done ? 'bg-blue-50 border-blue-200 text-[var(--brand-accent)]' : w.active ? 'bg-blue-600 border-blue-700 text-white animate-pulse' : 'bg-white border-gray-200 text-gray-400'}`}>
                                                    {w.label}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full w-[65%]" />
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: <BarChart3 className="w-5 h-5" />,
                                title: "Financial Viability Models",
                                desc: "Auto-generated CAC, LTV, and break-even estimates so you can assess profitability before writing a single line of code.",
                                visual: (
                                    <div className="h-32 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-between font-mono text-[10px]">
                                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 text-gray-400">
                                            <span>VIABILITY SCORE</span>
                                            <span className="text-blue-600 font-bold">8.4 / 10</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 my-2 text-center">
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                                <p className="text-[8px] text-gray-400 leading-none mb-1">EST LTV</p>
                                                <p className="font-bold text-gray-800 text-[11px]">$480</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                                <p className="text-[8px] text-gray-400 leading-none mb-1">TARGET CAC</p>
                                                <p className="font-bold text-gray-800 text-[11px]">$95</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                                <p className="text-[8px] text-gray-400 leading-none mb-1">LTV:CAC</p>
                                                <p className="font-bold text-emerald-600 text-[11px]">5.1x</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: <Lock className="w-5 h-5" />,
                                title: "Private Venture Vaults",
                                desc: "Each project lives in its own encrypted scope. Your IP, strategy, and data never touch a shared infrastructure layer.",
                                visual: (
                                    <div className="h-32 bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[var(--brand-accent)] mb-2 shadow-sm">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest font-bold">Encrypted Scope Isolated</p>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: <Target className="w-5 h-5" />,
                                title: "Competitor Deconstruction",
                                desc: "Deep analysis of who's already in your space — their positioning, weaknesses, and the gaps you can own from day one.",
                                visual: (
                                    <div className="h-32 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-between font-mono text-[9px]">
                                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 text-gray-400">
                                            <span>COMPETITOR MAP</span>
                                            <span className="text-[var(--brand-accent)] font-bold">3 ANALYSIS METRICS</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5 my-1">
                                            <div className="flex justify-between items-center text-gray-600">
                                                <span>Price Gap</span>
                                                <span className="font-bold text-gray-800">45% Opportunity</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-1 rounded-full">
                                                <div className="bg-blue-500 h-full w-[45%]" />
                                            </div>
                                            <div className="flex justify-between items-center text-gray-600">
                                                <span>Feature Gap</span>
                                                <span className="font-bold text-gray-800">High Whitespace</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-1 rounded-full">
                                                <div className="bg-emerald-500 h-full w-[75%]" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                        ].map((f, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="rounded-2xl bg-white border border-gray-300 p-6 sm:p-8 flex flex-col group hover:border-[var(--brand-accent)]/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                            >
                                <div className="w-10 h-10 shrink-0 mb-6 rounded-xl bg-blue-50 border border-blue-100 text-[var(--brand-accent)] flex items-center justify-center group-hover:bg-[var(--brand-accent)] group-hover:text-white transition-all duration-300">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-display text-gray-900 mb-3 tracking-tight group-hover:text-[var(--brand-accent)] transition-colors">{f.title}</h3>
                                <p className="text-gray-500 text-[14px] leading-relaxed mb-6">{f.desc}</p>
                                <div className="mt-auto">
                                    {f.visual}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                HOW IT WORKS — BLUE (30%)
                Full-bleed dark blue section
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-gradient-to-br from-[#0057C2] via-[#0066CC] to-[#073B99] py-20 md:py-28 relative overflow-hidden">
                {/* Glow accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#0066CC]/30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#003d7a]/60 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6">

                    {/* Header */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 sm:mb-20 items-start border-b border-white/15 pb-12 sm:pb-16"
                    >
                        <motion.div variants={fadeUp}>
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 rounded-full px-4 py-1.5 mb-8">
                                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                                <span className="text-blue-100/90 text-[10px] font-bold uppercase tracking-[0.2em]">The Process</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-display font-normal text-white leading-[1.05] tracking-tightest">
                                From idea to roadmap{' '}
                                <span className="font-display italic text-blue-200">in four steps.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp} className="lg:pt-4">
                            <p className="text-blue-100/70 text-base sm:text-lg font-sans leading-relaxed border-l-2 border-white/20 pl-6 sm:pl-8">
                                Capable follows a linear four-phase sequence. Each phase builds on the last — moving your abstract concept through rigorous analysis and into a concrete, executable plan.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* 4 steps grid with custom mock UIs inside the cards */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                    >
                        {[
                            {
                                step: '01',
                                title: 'Idea Refinement',
                                desc: 'Describe your concept. Our Semantic Engine turns raw input into a high-conviction mission statement.',
                                detail: "10-second processing time",
                                ui: (
                                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-[9px] text-white/90 flex flex-col justify-between h-28">
                                        <div className="text-white/40">USER INPUT:</div>
                                        <div className="bg-white/5 border border-white/10 rounded p-1.5 italic text-white/80 line-clamp-2">
                                            "B2B product to track supply chain carbon credits..."
                                        </div>
                                        <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            REFINING CONCEPT STRUCTURE...
                                        </div>
                                    </div>
                                )
                            },
                            {
                                step: '02',
                                title: 'Strategic Audit',
                                desc: 'You answer a set of high-stakes founder questions designed to surface market friction and assumptions.',
                                detail: "Adaptive custom queries",
                                ui: (
                                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-[9px] text-white/90 flex flex-col justify-between h-28">
                                        <div className="font-mono text-white/40 uppercase">Venture Question:</div>
                                        <div className="font-sans font-bold leading-snug line-clamp-2">
                                            How will you acquire your first 10 corporate accounts?
                                        </div>
                                        <div className="flex gap-1.5">
                                            <span className="bg-blue-600/40 border border-blue-500/50 text-blue-200 px-2 py-0.5 rounded font-bold">Direct Sales</span>
                                            <span className="bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded">Cold Outreach</span>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                step: '03',
                                title: 'Synthesis Audit',
                                desc: 'A multi-lens analysis covering market size, competition, positioning, and execution risk.',
                                detail: "Over 1M data points evaluated",
                                ui: (
                                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-[9px] text-white/90 flex flex-col justify-between h-28">
                                        <div className="text-white/40 uppercase">RUNNING BENCHMARKS:</div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-emerald-400">
                                                <span>✓ Competitor mapping</span>
                                                <span>READY</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-400">
                                                <span>✓ Financial pricing scenarios</span>
                                                <span>READY</span>
                                            </div>
                                            <div className="flex justify-between text-blue-400">
                                                <span>⟳ CAC viability forecast</span>
                                                <span>RUNNING</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                step: '04',
                                title: 'Roadmap Delivery',
                                desc: 'A full Venture Report and surgical 60-day action plan delivered to your dashboard.',
                                detail: "Full Trello & Notion export",
                                ui: (
                                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-[9px] text-white/90 flex flex-col justify-between h-28">
                                        <div className="font-mono text-white/40 uppercase">DELIVERABLES:</div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="bg-white/10 border border-white/15 px-2 py-1 rounded flex items-center justify-between">
                                                <span className="font-bold">Venture_Report.pdf</span>
                                                <span className="text-blue-300 font-bold uppercase tracking-wider text-[8px]">Download</span>
                                            </div>
                                            <div className="bg-white/10 border border-white/15 px-2 py-1 rounded flex items-center justify-between">
                                                <span className="font-bold">60_Day_Board.csv</span>
                                                <span className="text-blue-300 font-bold uppercase tracking-wider text-[8px]">Export</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="rounded-2xl bg-white/5 border border-white/15 p-6 sm:p-8 flex flex-col hover:bg-white/10 hover:border-white/25 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 shrink-0 mb-6 rounded-xl bg-white text-[var(--brand-accent)] flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                                    {item.step}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-display text-white mb-3 tracking-tight group-hover:text-blue-200 transition-colors">{item.title}</h3>
                                <p className="text-blue-100/70 text-[14px] leading-relaxed mb-6">{item.desc}</p>
                                <div className="mb-6">
                                    {item.ui}
                                </div>
                                <p className="text-[12px] font-sans font-bold uppercase tracking-wider text-blue-300/80 mt-auto">{item.detail}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                WHY CAPABLE — WHITE (70%)
                Premium Comparison Table & Visual checklist
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="max-w-3xl mb-16 md:mb-20">
                        <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Why Capable</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                            The unfair advantage{' '}
                            <span className="font-display italic text-[var(--brand-accent)]">smart founders use.</span>
                        </h2>
                    </div>

                    {/* Comparison Board Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        {/* Table Block */}
                        <div className="lg:col-span-2 overflow-x-auto border border-gray-300 rounded-2xl bg-white">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/70">
                                        <th className="p-5 font-sans font-bold text-xs uppercase tracking-wider text-gray-400">Capability</th>
                                        <th className="p-5 font-sans font-bold text-xs uppercase tracking-wider text-[var(--brand-accent)]">Capable Platform</th>
                                        <th className="p-5 font-sans font-bold text-xs uppercase tracking-wider text-gray-400">Traditional Agency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {[
                                        { cap: "Delivery Speed", capVal: "15 Minutes", tradVal: "4 - 6 Weeks" },
                                        { cap: "Total Research Points", capVal: "1M+ Signals", tradVal: "Manual interviews only" },
                                        { cap: "Execution Strategy", capVal: "Actionable 60-Day Map", tradVal: "Static 80-Slide PDF Deck" },
                                        { cap: "Cost Scale", capVal: "Fraction of a desk cost", tradVal: "$15K - $50K Retainers" },
                                        { cap: "IP Protection", capVal: "Encrypted Isolated Vaults", tradVal: "No technical guardrails" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/55 transition-colors">
                                            <td className="p-5 font-bold text-gray-800">{row.cap}</td>
                                            <td className="p-5 text-[var(--brand-accent)] font-bold flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)]" /> {row.capVal}
                                            </td>
                                            <td className="p-5 text-gray-500 font-sans">{row.tradVal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Security Card / Checklist */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-gray-300 bg-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/5 blur-xl group-hover:scale-150 transition-all duration-700" />
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[var(--brand-accent)] flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-xl text-gray-900 mb-3 tracking-tight">Security & Privacy First</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    Your strategies, data and generated market roadmap belong to you. We insulate your data inside sandbox silos, never pooling it to train open LLM models.
                                </p>
                                <div className="border-t border-gray-100 pt-6">
                                    <p className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest mb-3">Enterprise Standards</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        ISO-27001 COMPLIANT ARCHITECTURE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                TESTIMONIAL — BLUE (30%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
                        className="rounded-3xl bg-gradient-to-br from-[#0057C2] via-[#0066CC] to-[#073B99] p-8 sm:p-14 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden"
                    >
                        {/* bg texture */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-[#073B99]/60 blur-3xl" />
                        </div>

                        {/* Quote Block */}
                        <div className="relative z-10 max-w-2xl text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                                <span className="text-blue-100/90 text-[10px] font-bold uppercase tracking-[0.2em]">Founder Case Study</span>
                            </div>
                            <blockquote className="font-display font-normal text-white leading-tight tracking-tightest mb-6 text-2xl sm:text-3xl lg:text-[38px]">
                                "Capable didn't just validate my idea — it showed me exactly where I was wrong, and gave me a smarter path forward."
                            </blockquote>
                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">P</div>
                                <div>
                                    <p className="text-white font-bold text-[14px]">Priya K.</p>
                                    <p className="text-blue-200/60 font-sans text-[11px] font-bold tracking-widest uppercase">Founder, Niche Commerce</p>
                                </div>
                            </div>
                        </div>

                        {/* Outcomes Cards */}
                        <div className="relative z-10 grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
                            {[
                                { num: "6 Weeks", label: "To Launch" },
                                { num: "3x", label: "Velocity" },
                                { num: "Zero", label: "Code Waste" },
                                { num: "100%", label: "Strategy Clarity" }
                            ].map((o, idx) => (
                                <div key={idx} className="bg-white/10 border border-white/15 rounded-2xl p-6 text-center backdrop-blur-md min-w-[120px] sm:min-w-[150px]">
                                    <p className="text-2xl sm:text-3xl font-display font-normal text-white leading-none mb-1">{o.num}</p>
                                    <p className="text-blue-200/50 text-[10px] uppercase font-bold tracking-widest">{o.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                ECOSYSTEM & WORKFLOW HUB — WHITE (70%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-[#FAFAFA] py-20 md:py-28 border-t border-b border-gray-200/80 relative overflow-hidden">
                {/* Background accents */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        
                        {/* Left Side: Info & Tabs */}
                        <div className="lg:col-span-5 flex flex-col justify-center">
                            <span className="text-[11px] font-sans font-bold text-[var(--brand-accent)] uppercase tracking-[0.2em] mb-4">
                                Deep Integrations
                            </span>
                            <h2 className="text-4xl md:text-5xl font-display font-normal text-gray-900 leading-[1.1] tracking-tightest mb-6">
                                Plugs into your workflow. <br />
                                <span className="font-display italic text-[var(--brand-accent)]">Automatically.</span>
                            </h2>
                            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8">
                                Connect Capable to your repositories, task boards, and communication channels. Streamline validation and keep your execution strategy perfectly updated.
                            </p>

                            {/* Dynamic Tabs */}
                            <div className="flex flex-col gap-3">
                                {[
                                    {
                                        id: 'developers',
                                        label: 'Developer Stack',
                                        desc: 'GitHub, Linear, Vercel, Slack'
                                    },
                                    {
                                        id: 'intelligence',
                                        label: 'Market & AI Engines',
                                        desc: 'Google Scraper, OpenAI, Perplexity'
                                    },
                                    {
                                        id: 'marketing',
                                        label: 'Growth & Analytics',
                                        desc: 'Stripe, HubSpot, Segment, GA4'
                                    },
                                    {
                                        id: 'operations',
                                        label: 'Productivity & Ops',
                                        desc: 'Notion, Discord, Figma, Linear'
                                    }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveEcosystemTab(tab.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                                            activeEcosystemTab === tab.id
                                                ? 'bg-white border-blue-500/40 shadow-lg shadow-blue-500/5 text-gray-900 translate-x-2'
                                                : 'bg-transparent border-transparent hover:border-gray-300 text-gray-400 hover:text-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[15px] font-bold transition-colors ${
                                                activeEcosystemTab === tab.id ? 'text-[var(--brand-accent)]' : 'text-gray-800'
                                            }`}>
                                                {tab.label}
                                            </span>
                                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                                                activeEcosystemTab === tab.id ? 'translate-x-1 text-[var(--brand-accent)]' : 'opacity-0'
                                            }`} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 font-sans font-medium">{tab.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Interactive Mock Pipeline Visual */}
                        <div className="lg:col-span-7">
                            <div className="bg-gray-900 rounded-3xl border border-gray-850 p-6 sm:p-8 font-mono text-xs text-gray-400 relative overflow-hidden shadow-2xl shadow-blue-900/10">
                                
                                {/* Mock UI Header */}
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                                        <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                                        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                    </div>
                                    <div className="px-3 py-1 rounded bg-gray-800 text-[10px] text-gray-500 border border-gray-850">
                                        api.capable.in/v1/workflows/sync
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        CONNECTED
                                    </div>
                                </div>

                                {/* Pipeline Graphic */}
                                <div className="grid grid-cols-3 gap-4 items-center justify-center py-6 mb-6 border-b border-gray-800/80 relative">
                                    
                                    {/* Animation Connection Lines */}
                                    <div className="absolute top-[48%] left-[25%] right-[25%] h-0.5 bg-gray-850 pointer-events-none">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse w-1/2" />
                                    </div>

                                    {/* Left Node: Input Source */}
                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105">
                                            {activeEcosystemTab === 'developers' && (
                                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                                                </svg>
                                            )}
                                            {activeEcosystemTab === 'intelligence' && (
                                                <Globe className="w-7 h-7 text-blue-400" />
                                            )}
                                            {activeEcosystemTab === 'marketing' && (
                                                <BarChart3 className="w-7 h-7 text-indigo-400" />
                                            )}
                                            {activeEcosystemTab === 'operations' && (
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12.23 14.5c.3 0 .5-.2.5-.5V8.5c0-.3-.2-.5-.5-.5H8.7c-.3 0-.5.2-.5.5v5.5c0 .3.2.5.5.5h3.53zM21.5 5.5v13c0 1.66-1.34 3-3 3h-13c-1.66 0-3-1.34-3-3v-13c0-1.66 1.34-3 3-3h13c1.66 0 3 1.34 3 3zm-2 0c0-.55-.45-1-1-1h-13c-.55 0-1 .45-1 1v13c0 .55.45 1 1 1h13c.55 0 1-.45 1-1v-13z"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 font-sans uppercase font-bold tracking-widest">Source Input</p>
                                            <p className="text-white text-xs font-bold mt-0.5">
                                                {activeEcosystemTab === 'developers' && 'GitHub Repo'}
                                                {activeEcosystemTab === 'intelligence' && 'Global Signals'}
                                                {activeEcosystemTab === 'marketing' && 'Stripe Dashboard'}
                                                {activeEcosystemTab === 'operations' && 'Notion Hub'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center Node: Capable Core */}
                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 relative">
                                            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping pointer-events-none" />
                                            <Cpu className="w-8 h-8 text-[var(--brand-accent)]" style={{ animation: 'spin 12s linear infinite' }} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 font-sans uppercase font-bold tracking-widest">Capable Agent</p>
                                            <p className="text-white text-xs font-bold mt-0.5">Intelligence Engine</p>
                                        </div>
                                    </div>

                                    {/* Right Node: Outputs */}
                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105">
                                            {activeEcosystemTab === 'developers' && (
                                                <Workflow className="w-7 h-7 text-emerald-400" />
                                            )}
                                            {activeEcosystemTab === 'intelligence' && (
                                                <BrainCircuit className="w-7 h-7 text-indigo-400" />
                                            )}
                                            {activeEcosystemTab === 'marketing' && (
                                                <TrendingUp className="w-7 h-7 text-blue-400" />
                                            )}
                                            {activeEcosystemTab === 'operations' && (
                                                <Layers className="w-7 h-7 text-purple-400" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 font-sans uppercase font-bold tracking-widest">Target Sync</p>
                                            <p className="text-white text-xs font-bold mt-0.5">
                                                {activeEcosystemTab === 'developers' && 'Linear Tasks'}
                                                {activeEcosystemTab === 'intelligence' && 'Strategy Report'}
                                                {activeEcosystemTab === 'marketing' && 'Growth Strategy'}
                                                {activeEcosystemTab === 'operations' && 'Team Alignment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Code Terminal Output block */}
                                <div className="bg-gray-950 rounded-xl p-4 border border-gray-850 font-mono text-[11px] text-gray-300">
                                    <p className="text-gray-500 mb-2">// Active Workflow Sync Logs</p>
                                    
                                    {activeEcosystemTab === 'developers' && (
                                        <div className="space-y-1">
                                            <p><span className="text-blue-400">info</span> Connecting to GitHub hook: <span className="text-emerald-400">repository/main/commits</span></p>
                                            <p><span className="text-blue-400">info</span> Mapping code changes against verified target specs</p>
                                            <p><span className="text-emerald-400">success</span> Sync complete: linear.app/capable-workspace</p>
                                            <p className="text-gray-400 mt-2 font-bold text-xs border-t border-gray-850 pt-2 text-white">
                                                ⚡ 1 Issue created in Linear, GitHub Branch sync active
                                            </p>
                                        </div>
                                    )}

                                    {activeEcosystemTab === 'intelligence' && (
                                        <div className="space-y-1">
                                            <p><span className="text-blue-400">info</span> Executing deep-query web scraper for pricing validation</p>
                                            <p><span className="text-blue-400">info</span> OpenAI Engine parsing 1,482 search signals</p>
                                            <p><span className="text-emerald-400">success</span> Strategic pivot matrix updated at 99.8% confidence</p>
                                            <p className="text-gray-400 mt-2 font-bold text-xs border-t border-gray-850 pt-2 text-white">
                                                ⚡ 4 Competitor pricing insights extracted, report compiled
                                            </p>
                                        </div>
                                    )}

                                    {activeEcosystemTab === 'marketing' && (
                                        <div className="space-y-1">
                                            <p><span className="text-blue-400">info</span> Polling Stripe metrics for real-time validation tracking</p>
                                            <p><span className="text-blue-400">info</span> Formulating Customer Acquisition Cost (CAC) model</p>
                                            <p><span className="text-emerald-400">success</span> Strategic spend recommendations calibrated with HubSpot CRM</p>
                                            <p className="text-gray-400 mt-2 font-bold text-xs border-t border-gray-850 pt-2 text-white">
                                                ⚡ Ad budget efficiency index calculated: +12.4% ROI optimization
                                            </p>
                                        </div>
                                    )}

                                    {activeEcosystemTab === 'operations' && (
                                        <div className="space-y-1">
                                            <p><span className="text-blue-400">info</span> Formatting Notion roadmap board updates for the team</p>
                                            <p><span className="text-blue-400">info</span> Preparing Slack payload for Slack App workspace delivery</p>
                                            <p><span className="text-emerald-400">success</span> Team ping sent: #strategy-alerts (8 watchers active)</p>
                                            <p className="text-gray-400 mt-2 font-bold text-xs border-t border-gray-850 pt-2 text-white">
                                                ⚡ Notion Master Board updated to version 2.4, Slack webhook active
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
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
