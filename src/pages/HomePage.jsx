import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Maximize2, X, Sparkles, Rocket, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { ProjectStorage } from '../services/projectStorage';
import heroVideo from '../assets/hero-bg2-compressed.mp4';
import heroPoster from '../assets/hero-poster.webp';

// Import Home Components
import ServicesSection from '../components/home/ServicesSection';
const AdjustableRulesSection = React.lazy(() => import('../components/home/AdjustableRulesSection'));
const MissionSection = React.lazy(() => import('../components/home/MissionSection'));
const TestimonialStepsSection = React.lazy(() => import('../components/home/TestimonialStepsSection'));
const FAQWithStatsSection = React.lazy(() => import('../components/home/FAQWithStatsSection'));
const BottomCTASection = React.lazy(() => import('../components/home/BottomCTASection'));

// Client-side blocked terms (quick pre-check before hitting the server)
const CLIENT_BLOCKED_TERMS = [
    'drug dealing', 'drug trafficking', 'sell drugs', 'meth lab', 'cocaine', 'heroin',
    'illegal weapons', 'gun trafficking', 'bomb making', 'human trafficking',
    'money laundering', 'ponzi scheme', 'pyramid scheme', 'counterfeit',
    'identity theft', 'credit card fraud', 'hacking service', 'ransomware',
    'dark web', 'child exploitation', 'terrorism', 'hitman', 'contract killing',
    'sex trafficking', 'slave labor', 'child labor', 'phishing'
];

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();
    const [idea, setIdea] = useState(location.state?.idea || '');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentWarning, setContentWarning] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const videoRef = useRef(null);

    // Optimize video performance and slow down playback
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
            // Immediate hardware acceleration hint
            videoRef.current.style.transform = 'translateZ(0)';
        }
    }, []);

    // Animated Placeholder Logic
    useEffect(() => {
        const examples = [
            "AI tutor for engineering students...",
            "Local bakery subscription service...",
            "Build an AI tool for farmers...",
            "Start a niche coffee brand...",
            "Marketplace for freelance designers..."
        ];
        let i = 0;
        let j = 0;
        let currentText = '';
        let isDeleting = false;
        let timeout;

        const type = () => {
            const currentExample = examples[i];

            if (isDeleting) {
                currentText = currentExample.substring(0, j - 1);
                j--;
            } else {
                currentText = currentExample.substring(0, j + 1);
                j++;
            }

            setPlaceholder(currentText);

            let speed = isDeleting ? 40 : 80;

            if (!isDeleting && j === currentExample.length) {
                speed = 2000; // Pause at the end
                isDeleting = true;
            } else if (isDeleting && j === 0) {
                isDeleting = false;
                i = (i + 1) % examples.length;
                speed = 500;
            }

            timeout = setTimeout(type, speed);
        };

        type();
        return () => clearTimeout(timeout);
    }, []);

    // Quick client-side check (server has the full check)
    const checkContent = (text) => {
        const normalized = text.toLowerCase().trim();
        for (const term of CLIENT_BLOCKED_TERMS) {
            if (normalized.includes(term)) {
                setContentWarning("This idea involves activities that may be illegal or harmful. We can't assist with this.");
                return false;
            }
        }
        setContentWarning('');
        return true;
    };

    // Sync idea from location state if it changes
    useEffect(() => {
        if (location.state?.idea) {
            setIdea(location.state.idea);
        }
    }, [location.state?.idea]);

    const handleGenerate = async () => {
        if (!idea.trim() || isEnhancing) return;

        // Content moderation check (client-side quick check)
        if (!checkContent(idea)) return;

        // Redirect to login if not authenticated
        if (!user) {
            navigate('/login', {
                state: {
                    from: { pathname: '/' },
                    idea: idea // Pass the idea so we can potentially restore it
                }
            });
            return;
        }

        await ProjectStorage.init();
        const newId = await ProjectStorage.create(idea);
        navigate(`/project/${newId}`);
    };

    const handleEnhance = async () => {
        if (!idea.trim() || isEnhancing) return;

        // Content moderation check (client-side quick check)
        if (!checkContent(idea)) return;

        setIsEnhancing(true);
        try {
            const res = await fetch('/api/enhance-idea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea })
            });
            const data = await res.json();
            // Handle server-side blocked response
            if (res.status === 403 && data.blocked) {
                setContentWarning(data.error);
                return;
            }
            if (data.enhancedIdea) {
                setIdea(data.enhancedIdea);
            }
        } catch (error) {
            console.error("Enhancement failed:", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="relative w-full bg-white clip-path-bounds">
            {/* --- HERO SECTION --- */}
            <section className="relative w-full min-h-[95vh] md:min-h-screen flex flex-col items-center overflow-hidden">
                {/* 1. Contained Video Background */}
                <div className="absolute inset-0 z-0 pt-[84px] px-2 md:px-3 pb-2 md:pb-3 pointer-events-none">
                    <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            poster={heroPoster}
                            fetchPriority="high"
                            className="h-full w-full object-cover"
                            style={{
                                backfaceVisibility: 'hidden',
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                                backgroundColor: '#0c1428', // Fallback color for instant appearance
                                filter: 'brightness(0.9)' // Subtle darkening for better contrast
                            }}
                        >
                            <source src={heroVideo} type="video/mp4" />
                            <track kind="captions" />
                        </video>
                        {/* Cinematic Dark Overlay */}
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }}></div>
                    </div>
                </div>

                <div className="relative z-30 flex flex-col items-center justify-center px-4 max-w-7xl mx-auto w-full flex-1 pt-[84px]">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wide">Intelligent Idea Architect</span>
                    </div>

                    {/* Hero Headings */}
                    <div className="max-w-5xl text-center space-y-4 mb-6">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-normal text-white leading-tight" style={{ textShadow: '0 2px-12px rgba(0,0,0,0.3)' }}>
                            Be <span className=" font-display italic">Capable</span> of Building Businesses
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto text-center font-sans font-medium leading-relaxed mb-10 px-6">
                        Validate your market and get a personalized 60-day roadmap to turn your vision into a real business.
                    </p>

                    {/* Levitating Glow Input Area & Process Flow */}
                    <div className="relative w-full max-w-6xl mx-auto mb-24 flex flex-col items-center z-40">

                        {/* 1. INPUT BOX WRAPPER */}

                        <div className="relative w-full max-w-2xl group mb-0 z-10">
                            {/* MAIN OUTER CONTAINER (Refined Glass) */}
                            <motion.div
                                layoutId="input-container"
                                className="relative bg-white/20 backdrop-blur-xl rounded-[14px] p-2 flex flex-col h-full border border-white/20 shadow-2xl shadow-black/30"
                            >

                                {/* FRONT CONTAINER (Inner glass box for Text Input) */}
                                <div className="relative bg-white/1 backdrop-blur-lg rounded-[10px] p-1 mb-2 border border-white/20 shadow-2xl shadow-black/30">
                                    <div className="relative w-full">
                                        <textarea
                                            className={`w-full h-24 sm:h-28 p-4 text-lg sm:text-xl text-white placeholder:text-white/40 bg-transparent border-none outline-none resize-none font-sans font-medium leading-relaxed rounded-md transition-opacity duration-300 custom-scrollbar-hero ${isEnhancing ? 'opacity-0' : 'opacity-100'}`}
                                            placeholder={idea ? "" : placeholder}
                                            value={idea}
                                            onChange={(e) => { setIdea(e.target.value); if (contentWarning) setContentWarning(''); }}
                                            disabled={isEnhancing}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleGenerate();
                                                }
                                            }}
                                        ></textarea>



                                        {/* Skeleton Loading Overlay */}
                                        {isEnhancing && (
                                            <div className="absolute inset-0 p-4 flex flex-col gap-2 z-10">
                                                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                                                <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse delay-75"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BUTTONS (Reduced padding/spacing) */}
                                <div className="flex justify-between items-center px-1">
                                    {/* Resize button (left side) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(true);
                                        }}
                                        aria-label="Expand input field"
                                        className="flex items-center justify-center w-8 h-8 rounded-full text-white/100 hover:text-white hover:bg-white/20 transition-all active:scale-90"
                                        title="Expand input"
                                    >
                                        <Maximize2 size={18} />
                                    </button>

                                    {/* Enhance + Generate buttons (right side) */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isEnhancing ? 'text-sky-400 bg-white/100 cursor-not-allowed' : 'text-white/100 hover:text-white hover:bg-white/20'}`}
                                            onClick={handleEnhance}
                                            aria-label="Enhance idea using AI"
                                            disabled={isEnhancing}
                                            title="Enhance idea with AI"
                                        >
                                            <Wand2 size={18} className={isEnhancing ? "animate-spin" : ""} />
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            className="bg-white text-black px-5 py-2 rounded-[10px] font-medium text-sm transition-all duration-300 hover:bg-[var(--brand-accent)] hover:text-white active:scale-95 shadow-xl shadow-white/5 z-10"
                                        >
                                            <span>Generate</span>
                                        </button>
                                    </div>
                                </div>

                                {contentWarning && ReactDOM.createPortal(
                                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-md px-4"
                                        onClick={() => { setContentWarning(''); setIdea(''); }}
                                    >
                                        <div
                                            className="bg-gradient-to-b from-red-500 to-red-600 rounded-2xl shadow-2xl shadow-red-500/30 w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Icon */}
                                            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-5">
                                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                    <line x1="9" y1="9" x2="15" y2="15" />
                                                    <line x1="15" y1="9" x2="9" y2="15" />
                                                </svg>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                We Can't Process This
                                            </h3>

                                            {/* Message */}
                                            <p className="text-red-100 text-sm leading-relaxed max-w-xs mb-6">
                                                {contentWarning}
                                            </p>

                                            {/* Single Action */}
                                            <button
                                                onClick={() => { setContentWarning(''); setIdea(''); }}
                                                className="w-full px-5 py-3 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all active:scale-95 shadow-lg"
                                            >
                                                Try a Different Idea
                                            </button>
                                        </div>
                                    </div>,
                                    document.body
                                )}

                                {/* EXPANDED MODAL OVERLAY - Portal wraps AnimatePresence so exit animations work */}
                                {ReactDOM.createPortal(
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                key="expand-modal"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#073B99]/40 backdrop-blur-md px-4 py-8"
                                                onClick={() => setIsExpanded(false)}
                                                onKeyDown={(e) => { if (e.key === 'Escape') setIsExpanded(false); }}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                    className="relative w-full max-w-4xl bg-white/20 backdrop-blur-2xl rounded-[14px] p-2 flex flex-col border border-white/30 shadow-[0_32px_120px_rgba(0,0,0,0.5)]"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Close button (top-right) */}
                                                    <div className="flex justify-end px-2 pt-1 pb-0">
                                                        <button
                                                            onClick={() => setIsExpanded(false)}
                                                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Textarea (matches normal input style) */}
                                                    <div className="relative bg-white/1 backdrop-blur-lg rounded-[10px] p-1 mb-2 border border-white/20 shadow-2xl shadow-black/30">
                                                        <textarea
                                                            className="w-full h-[50vh] p-4 text-xl text-white placeholder:text-white/40 bg-transparent border-none outline-none resize-none font-sans font-medium leading-relaxed custom-scrollbar-hero"
                                                            placeholder="Describe your business idea in detail..."
                                                            autoFocus
                                                            value={idea}
                                                            onChange={(e) => { setIdea(e.target.value); if (contentWarning) setContentWarning(''); }}
                                                        ></textarea>
                                                    </div>

                                                    {/* Actions Footer (matches normal input buttons) */}
                                                    <div className="flex justify-between items-center px-1">
                                                        <div></div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isEnhancing ? 'text-sky-400 bg-white/100 cursor-not-allowed' : 'text-white/100 hover:text-white hover:bg-white/20'}`}
                                                                onClick={handleEnhance}
                                                                disabled={isEnhancing}
                                                                title="Enhance idea with AI"
                                                            >
                                                                <Wand2 size={18} className={isEnhancing ? "animate-spin" : ""} />
                                                            </button>
                                                            <button
                                                                onClick={handleGenerate}
                                                                className="bg-white text-black px-5 py-2 rounded-[10px] font-medium text-sm transition-all duration-300 hover:bg-[var(--brand-accent)] hover:text-white active:scale-95 shadow-xl shadow-white/5"
                                                            >
                                                                <span>Generate</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>,
                                    document.body
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === LOGO BAR === */}
            <section className="w-full bg-white py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-20">
                        {[
                            { name: 'Scratch', color: 'bg-blue-600' },
                            { name: 'Segment', color: 'bg-emerald-600' },
                            { name: 'FrontApp', color: 'bg-fuchsia-600' },
                            { name: 'QuickBooks', color: 'bg-teal-500' },
                            { name: 'Mailchimp', color: 'bg-black' }
                        ].map((brand, idx) => (
                            <div key={idx} className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-all duration-500 cursor-default group">
                                <div className={`w-6 h-6 rounded-md ${brand.color} flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                                </div>
                                <span className="text-[16px] font-bold text-gray-900 tracking-tightest">{brand.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === BETTER UNDERWRITES / FEATURE SHOWCASE === */}
            <section className="w-full bg-[#f9f9f9] py-20 md:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header: Large Editorial Headline */}
                    <div className="mb-8 md:mb-12 max-w-4xl">
                        <h2 className="text-3xl sm:text-4xl md:text-7xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                            Smarter research,<br />faster
                            <span className="text-[var(--brand-accent)] font-display italic"> launch</span>
                        </h2>
                    </div>

                    {/* Content Grid: Staggered Image & Text */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-24 mb-20 items-start">
                        {/* Left: Premium Image Container */}
                        <div className="lg:col-span-7">
                            <div className="relative group">
                                <div className="rounded-[14px] overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-gray-100 relative shadow-2xl">
                                    <img src="/1.webp" loading="lazy" alt="Market Analysis Workflow" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-blue-600/5"></div>

                                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] bg-white/25 p-1 sm:p-1.5 rounded-[14px] shadow-2xl border border-white/30">
                                        <div className="bg-white rounded-[12px] py-2.5 sm:py-4 flex items-center justify-center">
                                            <span className="text-[10px] sm:text-[13px] font-bold text-gray-900 tracking-tight uppercase tracking-widest text-center px-2">Intelligent Market Analysis Workflow</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Editorial Narrative */}
                        <div className="lg:col-span-5 pt-8">
                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <p className="text-gray-900 font-sans text-lg sm:text-xl leading-relaxed font-normal">
                                        Launching is traditionally <span className="italic font-display">complex and resource-intensive</span>. We've optimized the process from the ground up.
                                    </p>
                                    <p className="text-gray-500 font-sans text-base sm:text-lg leading-relaxed">
                                        By seamlessly merging smart technology with market expertise, we enable founders to make faster, more confident decisions without sacrificing clarity or conviction.
                                    </p>
                                </div>
                                <div className="pt-8 border-t border-gray-100 w-fit">
                                    <p className="text-gray-400 font-bold text-[11px] tracking-widest mb-2">OUR PHILOSOPHY</p>
                                    <p className="text-gray-900 font-sans text-base italic">"Execution is nothing without validation."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: CTA & Stats */}
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-20">
                        {/* Stats Cluster */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
                            {[
                                { number: '150+', label: 'Global Founders', desc: 'Trusted by entrepreneurs around the world.' },
                                { number: '40%', label: 'Launch Readiness', desc: 'Increase in speed to market implementation.' },
                                { number: '95%', label: 'Market Accuracy', desc: 'Highest precision rate in trend analysis.' }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex flex-col group py-4 md:py-0">
                                    <div className="mb-2 md:mb-4 overflow-hidden">
                                        <p className="text-5xl md:text-7xl font-display font-normal text-gray-900 leading-none tracking-tightest group-hover:translate-y-[-5px] transition-transform duration-500">{stat.number}</p>
                                    </div>
                                    <p className="text-gray-900 font-bold text-[11px] md:text-[13px] mb-2 md:mb-3 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-[13px] md:text-[14px] text-gray-400 font-sans leading-relaxed max-w-[180px]">{stat.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA Unit */}
                        <div className="flex flex-col items-center lg:items-end gap-6">
                            <button className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-8 py-3 rounded-md font-bold text-[14px] tracking-tight hover:shadow-card active:scale-[0.98] transition-all duration-300 shadow-md flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]"></span>
                                Request a demo
                            </button>
                            <Link to="/plans" className="text-gray-500 hover:text-[var(--brand-accent)] font-bold text-[14px] tracking-tight transition-all border-b border-transparent hover:border-[var(--brand-accent)] pb-0.5 uppercase">
                                Explore pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* === SERVICES / TABBED SECTION === */}
            <ServicesSection />

            <React.Suspense fallback={<div className="h-96 w-full bg-white animate-pulse" />}>
                {/* === ADJUSTABLE RULES SECTION === */}
                <AdjustableRulesSection />

                {/* === MISSION / ABOUT EDITORIAL BLOCK === */}
                <MissionSection heroVideo={heroVideo} />

                {/* === TESTIMONIAL + 3 STEPS === */}
                <TestimonialStepsSection />

                {/* === FAQ WITH STATS === */}
                <FAQWithStatsSection />

                {/* === BOTTOM CTA BANNER === */}
                <BottomCTASection />
            </React.Suspense>

            {/* === FOOTER === */}
            <footer className="w-full bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                        {/* Copyright */}
                        <div className="order-3 md:order-1">
                            <p className="text-[12px] text-gray-400 font-sans tracking-tight">
                                © 2025 Capable Labs. All rights reserved.
                            </p>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-8 order-1 md:order-2">
                            {[
                                { icon: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z' },
                                { icon: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                                { icon: 'GitHub', path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' }
                            ].map((item, i) => (
                                <a key={i} href="#" aria-label={`Follow us on ${item.icon}`} className="text-gray-400 hover:text-gray-900 transition-all duration-300">
                                    <svg className="w-4 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
                                </a>
                            ))}
                        </div>

                        {/* Made with Tagline */}
                        <div className="flex items-center gap-2 order-2 md:order-3">
                            <p className="text-[12px] text-gray-400 font-sans tracking-tight">
                                Build by <span className="font-bold text-gray-900 tracking-tight">Harish 💙</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default HomePage;
