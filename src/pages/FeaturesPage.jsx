import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const heroVideo = '/hero-bg2-compressed.mp4';
const heroPoster = typeof window !== 'undefined' && window.innerWidth < 768 ? '/mobile/hero-poster.webp' : '/hero-poster.webp';
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


/* ─── Premium Canvas-based 3D Globe Component (Zero Network Dependencies) ─── */
const GlobeViz = () => {
    const canvasRef = useRef(null);
    const rotationRef = useRef(0);
    const pointsRef = useRef([]);

    // Generate coordinates for continents roughly mapped onto a sphere
    if (pointsRef.current.length === 0) {
        const radius = 90;
        // Standard latitude/longitude grids to approximate landmasses
        for (let lat = -60; lat <= 60; lat += 12) {
            const radLat = (lat * Math.PI) / 180;
            const cosLat = Math.cos(radLat);
            const sinLat = Math.sin(radLat);
            
            // Add points on different longitudes, denser around center
            for (let lng = -180; lng < 180; lng += 18) {
                // Simple procedural land mask (approximate continents)
                const noise = Math.sin(lng * 0.05) * Math.cos(lat * 0.05) + Math.sin(lng * 0.02);
                if (noise > -0.25) {
                    const radLng = (lng * Math.PI) / 180;
                    pointsRef.current.push({
                        x: radius * cosLat * Math.sin(radLng),
                        y: radius * sinLat,
                        z: radius * cosLat * Math.cos(radLng),
                        isNode: Math.random() > 0.94 // occasional prominent node
                    });
                }
            }
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        const radius = 90;
        const width = 280;
        const height = 260;
        const points = pointsRef.current;

        // Arcs connecting prominent nodes
        const activeConnections = [
            { from: 12, to: 55, progress: 0, speed: 0.008 },
            { from: 35, to: 88, progress: 0.3, speed: 0.006 },
            { from: 60, to: 120, progress: 0.6, speed: 0.007 },
            { from: 90, to: 145, progress: 0.1, speed: 0.009 },
        ];

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            const cx = width / 2;
            const cy = height / 2;

            // Increment rotation angle
            rotationRef.current += 0.006;
            const cosRot = Math.cos(rotationRef.current);
            const sinRot = Math.sin(rotationRef.current);

            // Rotate and project points
            const projected = points.map((p, idx) => {
                // Rotate around Y-axis
                const rx = p.x * cosRot - p.z * sinRot;
                const ry = p.y;
                const rz = p.x * sinRot + p.z * cosRot;

                // Simple 3D projection scale factor
                const scale = (rz + radius * 2) / (radius * 3);
                
                return {
                    x: cx + rx,
                    y: cy + ry,
                    z: rz,
                    scale,
                    isNode: p.isNode,
                    originalIndex: idx
                };
            });

            // Draw atmosphere glow
            const glowGrad = ctx.createRadialGradient(cx, cy, radius - 20, cx, cy, radius + 25);
            glowGrad.addColorStop(0, 'rgba(0, 102, 204, 0)');
            glowGrad.addColorStop(0.7, 'rgba(0, 102, 204, 0.18)');
            glowGrad.addColorStop(1, 'rgba(0, 102, 204, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius + 25, 0, Math.PI * 2);
            ctx.fill();

            // Draw globe sphere outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw projected points
            projected.forEach(p => {
                // Only render front-facing side of sphere (positive Z)
                if (p.z < -10) return;

                const size = p.isNode ? 3.5 * p.scale : 1.5 * p.scale;
                const alpha = Math.min(1, Math.max(0.1, (p.z + radius) / (radius * 2)));

                ctx.fillStyle = p.isNode 
                    ? `rgba(255, 255, 255, ${alpha * 0.95})` 
                    : `rgba(255, 255, 255, ${alpha * 0.35})`;

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();

                if (p.isNode) {
                    // Pulsing node ring
                    ctx.strokeStyle = `rgba(147, 197, 253, ${alpha * 0.6 * (1 - (Date.now() % 1500) / 1500)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size + 6 * ((Date.now() % 1500) / 1500), 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            // Draw connection arcs
            activeConnections.forEach(conn => {
                const p1 = projected[conn.from % projected.length];
                const p2 = projected[conn.to % projected.length];

                // Render only if both points are in front
                if (p1.z < 0 || p2.z < 0) return;

                // Bezier arc helper
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);

                // Control point pulled outwards from sphere center
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                const dist = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
                
                // Pull control point outwards
                const dx = midX - cx;
                const dy = midY - cy;
                const length = Math.sqrt(dx * dx + dy * dy) || 1;
                const cpx = midX + (dx / length) * (dist * 0.25);
                const cpy = midY + (dy / length) * (dist * 0.25);

                ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
                ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Animate signal dot along the path
                conn.progress += conn.speed;
                if (conn.progress > 1) conn.progress = 0;

                const t = conn.progress;
                // Quadratic bezier formula
                const dotX = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cpx + t * t * p2.x;
                const dotY = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cpy + t * t * p2.y;

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 260 }}>
            <canvas ref={canvasRef} width="280" height="260" className="block" />
        </div>
    );
};

const FeaturesPage = () => {

    useEffect(() => { window.scrollTo(0, 0); }, []);
    const videoRef = useRef(null);
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
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Section header — exact ServicesSection pattern */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-300/50"
                    >
                        <motion.div variants={fadeUp}>
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
                                className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col group hover:border-[var(--brand-accent)]/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="w-[32px] h-[32px] shrink-0 mb-6 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center">
                                    {f.icon}
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-display text-gray-900 mb-4 tracking-tight">{f.title}</h3>
                                <p className="text-gray-500 text-[15px] sm:text-[16px] leading-relaxed mt-auto">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                HOW IT WORKS — BLUE (30%)
                Full-bleed dark blue section
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-gradient-to-br from-[#0057C2] via-[#0066CC] to-[#073B99] py-16 md:py-20 relative overflow-hidden">
                {/* Glow accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#0066CC]/30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#003d7a]/60 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6">

                    {/* Header */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start border-b border-white/15 pb-10 sm:pb-16"
                    >
                        <motion.div variants={fadeUp}>
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                                <span className="text-blue-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">The Process</span>
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
                                className="rounded-2xl bg-white/10 border border-white/20 p-8 sm:p-10 flex flex-col hover:bg-white/15 transition-all duration-300"
                            >
                                <div className="w-[32px] h-[32px] shrink-0 mb-6 rounded-full bg-white text-[var(--brand-accent)] flex items-center justify-center font-bold text-[14px]">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-display text-white mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-blue-100/70 text-[15px] sm:text-[16px] leading-relaxed mt-auto">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                WHY CAPABLE — WHITE (70%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-16 md:py-20">
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
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
                        className="rounded-2xl bg-gradient-to-br from-[#0057C2] via-[#0066CC] to-[#073B99] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 relative overflow-hidden"
                    >
                        {/* bg texture — exact BottomCTASection pattern */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-[#073B99]/60 blur-3xl" />
                        </div>
                        {/* Left: quote */}
                        <div className="relative z-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                                <span className="text-blue-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">Founder Story</span>
                            </div>
                            <h2 className="font-display font-normal text-white leading-[1.05] tracking-tightest mb-5 text-2xl sm:text-3xl lg:text-[40px]">
                                "Capable didn't just validate my idea — it showed me exactly where I was wrong, and gave me a smarter path forward."
                            </h2>
                            <p className="text-blue-100/60 font-sans leading-relaxed text-base max-w-lg mb-6">
                                We went from zero to launch in 6 weeks — 3× faster than any previous attempt.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">P</div>
                                <div>
                                    <p className="text-white font-bold text-[14px]">Priya K.</p>
                                    <p className="text-white/50 font-sans text-[11px] font-bold tracking-widest uppercase">Founder, Niche Commerce</p>
                                </div>
                            </div>
                        </div>
                        {/* Right: CTA */}
                        <div className="relative z-10 flex flex-col gap-3 shrink-0 w-full lg:w-auto">
                            <Link
                                to="/login"
                                state={{ mode: 'signup' }}
                                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--brand-accent)] px-8 py-4 rounded-xl font-bold text-[14px] tracking-tight hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 whitespace-nowrap shadow-lg shadow-black/10"
                            >
                                Start Building — It's Free <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                            </Link>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-[14px] tracking-tight hover:bg-white/20 active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
                            >
                                View Plans
                            </Link>
                            <p className="text-blue-200/40 text-[11px] font-sans text-center mt-1">No credit card required</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                DELIVERABLES — WHITE (70%)
            ════════════════════════════════════════════════ */}
            <section className="w-full bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start pt-12 border-t border-gray-300/50"
                    >
                        {/* Left */}
                        <motion.div variants={fadeUp}>
                            <p className="text-[var(--brand-accent)] font-sans text-[11px] font-bold uppercase tracking-[0.2em] mb-6">What You Receive</p>
                            <h2 className="text-3xl sm:text-4xl lg:text-[54px] font-display font-normal text-gray-900 leading-none tracking-tightest mb-6">
                                Two high-value assets,
                                <br />
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

                        {/* Right — animated globe */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-4">

                            {/* Globe card */}
                            <div className="rounded-2xl border border-gray-300 bg-gradient-to-br from-[#0057C2] via-[#0066CC] to-[#073B99] overflow-hidden relative" style={{ minHeight: 340 }}>
                                {/* Glow */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
                                </div>
                                <div className="relative flex flex-col items-center justify-center p-6">
                                    <GlobeViz />
                                    <div className="mt-4 grid grid-cols-3 gap-3 w-full">
                                        {[
                                            { n: '150+', l: 'Markets' },
                                            { n: '1M+', l: 'Signals/run' },
                                            { n: '95%', l: 'Accuracy' },
                                        ].map((s, i) => (
                                            <div key={i} className="text-center bg-white/10 border border-white/15 rounded-xl py-3 px-2">
                                                <p className="text-xl font-display text-white leading-none mb-0.5">{s.n}</p>
                                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{s.l}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-6 pb-6">
                                    <p className="text-white font-display text-lg tracking-tight mb-1">Global Intelligence Network</p>
                                    <p className="text-blue-100/60 text-[13px] font-sans leading-relaxed">Real-time market signals processed across 150+ countries — every time you run an analysis.</p>
                                </div>
                            </div>

                            {/* CTA nudge */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-7 flex flex-col gap-4">
                                <div>
                                    <p className="text-gray-900 font-bold text-base mb-1">Ready to see it in action?</p>
                                    <p className="text-gray-500 text-[14px] leading-relaxed">Start free — no credit card required. Your first analysis is on us.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Link to="/login" state={{ mode: 'signup' }} className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                                        Get Started Free
                                    </Link>
                                    <Link to="/pricing" className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all duration-300">
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
