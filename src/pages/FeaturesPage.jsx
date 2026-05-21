import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, BarChart3, Route as RouteIcon, ShieldCheck,
    Globe, ArrowRight, Target, Layers, Search, Eye, Workflow, Cpu, CheckCircle2, Sparkles
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
    React.useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="relative w-full bg-white">

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="w-full bg-white pt-28 pb-0 md:pt-36">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>

                        {/* Overline pill — same style as homepage badge */}
                        <motion.div variants={fadeUp} className="mb-8">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
                                Platform Capabilities
                            </span>
                        </motion.div>

                        {/* Two-col editorial split — matches ServicesSection header */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-end pb-12 border-b border-gray-300/50">
                            <motion.div variants={fadeUp}>
                                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[80px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                    Everything to{' '}
                                    <span className="font-display italic text-[var(--brand-accent)]">build with confidence.</span>
                                </h1>
                            </motion.div>
                            <motion.div variants={fadeUp} className="flex flex-col gap-8 lg:pb-2">
                                <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                                    We've combined deep market research, strategic planning, and AI guidance into a single cohesive workflow — so founders can move fast without guessing.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link to="/login" state={{ mode: 'signup' }} className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-7 py-3 rounded-md font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                                        Get Started Free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link to="/pricing" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-7 py-3 rounded-md font-bold text-sm tracking-wide hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                                        View Pricing
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Stat strip — sits flush above feature grid, same divider style */}
                        <motion.div variants={stagger} className="grid grid-cols-3 divide-x divide-gray-200 py-10">
                            {[
                                { n: "75%", l: "Faster time-to-launch" },
                                { n: "1M+", l: "Market signals per analysis" },
                                { n: "150+", l: "Countries supported" },
                            ].map((s, i) => (
                                <motion.div key={i} variants={fadeUp} className="px-8 first:pl-0 last:pr-0">
                                    <p className="text-3xl sm:text-4xl font-display font-normal text-gray-900 leading-none tracking-tightest mb-1">{s.n}</p>
                                    <p className="text-gray-400 text-[12px] font-sans">{s.l}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURE GRID ─────────────────────────────────── */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section header — same 2-col pattern as all homepage sections */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Six capabilities, <span className="font-display italic text-[var(--brand-accent)]">one platform.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-xl pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                                Each feature is purpose-built around a founder's core needs — from initial market scan to week-by-week execution planning.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* 3-col card grid — same card style as TestimonialStepsSection */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {[
                            { icon: <Search className="w-5 h-5" />, title: "Market Signal Mapping", desc: "Scans current market structures to identify unmet search intent and competitive clusters in real time." },
                            { icon: <ShieldCheck className="w-5 h-5" />, title: "Isolated Project Scopes", desc: "Each venture lives in its own encrypted scope — your IP never touches a shared database." },
                            { icon: <Cpu className="w-5 h-5" />, title: "Synthetic Reasoning", desc: "Generates structural logic rather than generic templates, using first-principles AI to stress-test your model." },
                            { icon: <Workflow className="w-5 h-5" />, title: "60-Day Action Map", desc: "A surgical week-by-week execution plan from brand foundation to first customer acquisition." },
                            { icon: <BarChart3 className="w-5 h-5" />, title: "Economic Projections", desc: "Calculates initial CAC and LTV heuristic models so you can validate profitability before you build." },
                            { icon: <Eye className="w-5 h-5" />, title: "Radical Clarity", desc: "Strips feature-bloat to focus entirely on the core atomic problem your business must solve." },
                        ].map((f, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col group hover:border-[var(--brand-accent)]/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 text-[var(--brand-accent)] group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-display font-normal text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── THE SYNTHESIS PROTOCOL (4 steps) ─────────────── */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                The Synthesis <span className="font-display italic text-[var(--brand-accent)]">Protocol.</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-xl pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                                Capable follows a linear 4-phase sequence to move your abstract concept from zero to an execution-ready roadmap.
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {[
                            { step: '01', title: 'Idea Enhancement', desc: 'Our Semantic Engine refines raw input into a high-conviction mission statement.', icon: <Zap className="w-4 h-4" /> },
                            { step: '02', title: 'Deep Discovery', desc: 'High-stakes strategic questions probe for structural market friction and opportunity.', icon: <Search className="w-4 h-4" /> },
                            { step: '03', title: 'Synthetic Audit', desc: 'Multi-lens audit covering positioning, revenue feasibility, and technical constraints.', icon: <ShieldCheck className="w-4 h-4" /> },
                            { step: '04', title: 'Roadmap Generation', desc: 'A surgical 60-day action plan guiding you from foundation to first user acquisition.', icon: <RouteIcon className="w-4 h-4" /> },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col hover:border-[var(--brand-accent)]/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group"
                            >
                                <div className="w-9 h-9 shrink-0 mb-6 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center font-bold text-[13px]">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-display font-normal text-gray-900 mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── WHY CAPABLE (advantages + image) ─────────────── */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start pt-12 border-t border-gray-300/50"
                    >
                        {/* Left */}
                        <motion.div variants={fadeUp}>
                            <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Why Capable</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-8">
                                Built for the <span className="font-display italic text-[var(--brand-accent)]">modern founder.</span>
                            </h2>
                            <div className="flex flex-col gap-4 mt-6">
                                {[
                                    { title: "No Backend Hassle", desc: "Your sensitive business logic never touches a central database. Project data lives with you.", icon: <Layers className="w-5 h-5" /> },
                                    { title: "Global Reach", desc: "Our engine understands markets across 150+ countries, adapting to local nuances automatically.", icon: <Globe className="w-5 h-5" /> },
                                    { title: "Highest Precision", desc: "Advanced NLP and market scrapers deliver accuracy that basic chatbots simply can't reach.", icon: <Target className="w-5 h-5" /> },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 group p-5 rounded-2xl border border-gray-200 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[var(--brand-accent)] group-hover:bg-[var(--brand-accent)] group-hover:text-white group-hover:border-[var(--brand-accent)] transition-all duration-300">
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

                        {/* Right — image card matching homepage bento style */}
                        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-gray-300 relative group h-[340px] sm:h-[420px] md:h-[520px]">
                            <img src="/market_analysis_vector.webp" alt="Market analysis" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#003d7a]/80 via-[#0052a3]/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl">
                                <div className="flex items-center gap-3 text-white">
                                    <ShieldCheck className="w-6 h-6 text-blue-200 shrink-0" />
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

            {/* ── DELIVERABLES + TECH STACK ─────────────────────── */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start pt-12 border-t border-gray-300/50"
                    >
                        {/* Left */}
                        <motion.div variants={fadeUp} className="w-full lg:w-1/2">
                            <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Tactical Deliverables</p>
                            <h2 className="text-3xl sm:text-4xl lg:text-[54px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-6">
                                Everything you need to <span className="font-display italic text-[var(--brand-accent)]">execute.</span>
                            </h2>
                            <p className="text-gray-500 font-sans leading-relaxed text-base mb-10">
                                Every completed discovery session produces high-value assets — giving you immediate tactical clarity to start building.
                            </p>
                            <div className="flex flex-col gap-4">
                                {[
                                    { title: "The Venture Report", desc: "Comprehensive analysis covering summary, validation, risks, and competitors.", tag: "Digital Dashboard" },
                                    { title: "60-Day Action Map", desc: "Week-by-week execution steps from brand foundation to customer acquisition.", tag: "Interactive Board" },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 border border-gray-300 bg-white p-6 sm:p-8 rounded-2xl hover:border-[var(--brand-accent)]/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[var(--brand-accent)] group-hover:bg-[var(--brand-accent)] group-hover:text-white transition-all duration-300">
                                                <CheckCircle2 className="w-4 h-4" />
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

                        {/* Right — System architecture card */}
                        <motion.div variants={fadeUp} className="w-full lg:w-1/2">
                            <div className="rounded-2xl border border-gray-300 bg-white p-8 sm:p-10">
                                <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
                                    <h3 className="font-display font-normal text-2xl text-gray-900 tracking-tight">System Architecture</h3>
                                    <div className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { lbl: "FE", title: "Frontend Client", desc: "React 18 + Vite for zero-lag interactions.", col: "bg-blue-50 text-blue-600 border-blue-200" },
                                        { lbl: "BE", title: "Node Orchestrator", desc: "High-speed backend JSON streaming & logic routing.", col: "bg-purple-50 text-purple-600 border-purple-200" },
                                        { lbl: "DB", title: "Venture Instances", desc: "Isolated PostgreSQL structures per project for security.", col: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                                        { lbl: "AI", title: "Inference Engine", desc: "Multi-layered agents utilizing specialized reasoning.", col: "bg-orange-50 text-orange-600 border-orange-200" },
                                    ].map((tech, i) => (
                                        <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${tech.col}`}>{tech.lbl}</div>
                                            <div>
                                                <p className="font-bold text-[14px] text-gray-900">{tech.title}</p>
                                                <p className="text-[13px] text-gray-500 mt-0.5">{tech.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Testimonial pull-quote — same style as TestimonialStepsSection */}
                            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#073B99] p-8 flex flex-col gap-6">
                                <p className="text-lg sm:text-xl font-display text-white leading-[1.5] tracking-tight">
                                    "Capable captured the nuance of my vision and translated it into a tactical roadmap we're executing on today."
                                </p>
                                <div className="border-t border-white/20 pt-5">
                                    <span className="text-white font-bold text-[15px]">ALEX M.</span>
                                    <p className="text-white/60 font-sans text-[12px] font-bold tracking-widest uppercase mt-0.5">Founder, TechCorp</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── BOTTOM CTA ───────────────────────────────────── */}
            <BottomCTASection />

            {/* ── FOOTER ───────────────────────────────────────── */}
            <footer className="w-full bg-white py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[12px] text-gray-400 font-sans tracking-tight">© 2025 Capable Labs. All rights reserved.</p>
                        <div className="flex items-center gap-8">
                            {[
                                { icon: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z' },
                                { icon: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                                { icon: 'GitHub', path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
                            ].map((item, i) => (
                                <a key={i} href="#" aria-label={`Follow us on ${item.icon}`} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
                                </a>
                            ))}
                        </div>
                        <p className="text-[12px] text-gray-400 font-sans tracking-tight">Built by <span className="font-bold text-gray-900">Harish 💙</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
