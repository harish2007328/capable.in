import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Maximize2, X, Sparkles, Rocket, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { ProjectStorage } from '../services/projectStorage';
import heroVideo from '../assets/hero-bg2-compressed.mp4';
import heroPoster from '../assets/hero-poster.png';

// Import Home Components
import ServicesSection from '../components/home/ServicesSection';
import AdjustableRulesSection from '../components/home/AdjustableRulesSection';
import MissionSection from '../components/home/MissionSection';
import TestimonialStepsSection from '../components/home/TestimonialStepsSection';
import FAQWithStatsSection from '../components/home/FAQWithStatsSection';
import BottomCTASection from '../components/home/BottomCTASection';

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
                    <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto text-center font-sans font-medium leading-relaxed mb-10 px-6">
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
                                    <div className="absolute inset-0 bg-[url('/1.png')] bg-cover bg-center"></div>
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

            {/* === ADJUSTABLE RULES SECTION === */}
            <AdjustableRulesSection />

            {/* === MISSION / ABOUT EDITORIAL BLOCK === */}
            <MissionSection />

            {/* === TESTIMONIAL + 3 STEPS === */}
            <TestimonialStepsSection />

            {/* === FAQ WITH STATS === */}
            <FAQWithStatsSection />

            {/* === BOTTOM CTA BANNER === */}
            <BottomCTASection />

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
                                <a key={i} href="#" className="text-gray-400 hover:text-gray-900 transition-all duration-300">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
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

// ========== SERVICES SECTION (Sticky Scroll Redesign) ==========
const ServicesSection = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['Validated', 'Analysis', 'Roadmaps', 'Chat'];

    // Update active tab on scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-index');
                    if (id !== null) setActiveTab(parseInt(id));
                }
            });
        }, { threshold: 0.1, rootMargin: "-30% 0px -50% 0px" });

        const elements = document.querySelectorAll('.service-step-container');
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const scrollToStep = (idx) => {
        const el = document.getElementById(`service-step-${idx}`);
        if (el) {
            const offset = 180; // Accounts for sticky header/tabs + breathing room
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="w-full bg-white pt-24 pb-48 md:pt-32 md:pb-64 border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-6">

                {/* 1. SECTION HEADER (Editorial Typography) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 sm:mb-24 items-start pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                            Design a startup journey <span className="font-display italic text-[var(--brand-accent)]">that actually works.</span>
                        </h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <p className="text-gray-500 text-base sm:text-lg md:text-xl font-sans leading-relaxed max-w-xl mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                            Capable isn't just a research tool; it makes your venture journey way better. Use out-of-the-box logic for all business types and industries—or create, update and manage custom growth requirements with ease.
                        </p>
                    </motion.div>
                </div>

                {/* 2. STICKY INTERACTIVE AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* LEFT Side: Sticky SideNav + Stats (Desktop) */}
                    <div className="hidden lg:block lg:col-span-4 relative">
                        <div className="sticky top-40 h-fit space-y-16">
                            {/* Tab List with Progress Indicator */}
                            <nav className="flex flex-col gap-6">
                                {tabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToStep(idx)}
                                        className="text-left group flex items-center gap-6"
                                    >
                                        <div className={`h-[2px] transition-all duration-700 ease-out ${activeTab === idx ? 'bg-[var(--brand-accent)] w-16' : 'bg-gray-100 group-hover:bg-gray-200 w-8'}`}></div>
                                        <span className={`text-2xl font-display transition-all duration-500 ${activeTab === idx ? 'text-gray-900 translate-x-2' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                            {tab}
                                        </span>
                                    </button>
                                ))}
                            </nav>

                            {/* Triple Stats Unit - Derived from the workflow/signals handle content */}
                            <div className="pt-16 border-t border-gray-100 space-y-12">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Global Impact</p>
                                    <p className="text-gray-900 font-sans text-sm italic pr-12 leading-relaxed">"120+ Ideas Analyzed through custom frameworks and standard business models."</p>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {[
                                        { number: '98+', label: 'STRATEGIES BUILT', desc: 'Custom growth paths' },
                                        { number: '2M+', label: 'SIGNALS HANDLED', desc: 'Real-time market data' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-end justify-between group cursor-default">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1 uppercase">{stat.label}</p>
                                                <p className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors uppercase tracking-widest">{stat.desc}</p>
                                            </div>
                                            <p className="text-4xl md:text-5xl font-display text-gray-900 group-hover:text-[var(--brand-accent)] transition-all duration-500">{stat.number}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT Side: Scrolling Content Blocks */}
                    <div className="lg:col-span-8 relative">

                        {/* Mobile Tabs Nav (Sticky at top of viewport) */}
                        <div className="lg:hidden sticky top-[84px] z-30 bg-white/90 backdrop-blur-xl py-4 -mx-6 px-6 border-b border-gray-100 mb-12 shadow-sm">
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-hide border border-gray-100/50">
                                {tabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToStep(idx)}
                                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${activeTab === idx ? 'bg-white text-gray-900 shadow-md scale-[1.02]' : 'text-gray-400'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-32 md:space-y-48">
                            {/* STEP 1: VALIDATED */}
                            <div id="service-step-0" data-index="0" className="service-step-container space-y-8">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img src="/feature_lightning.png" className="w-full h-full object-cover scale-110 translate-y-[2%] transition-transform duration-1000 group-hover:scale-[1.15]" alt="Validated" />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Validate ideas with <span className="font-display italic">real signals</span>
                                    </h3>
                                    <div className="space-y-6">
                                        <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                                            Skip the guesswork. Capable helps you rapidly test assumptions and validate your core venture hypotheses using concrete market data before you build.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: ANALYSIS */}
                            <div id="service-step-1" data-index="1" className="service-step-container space-y-10">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img src="/feature_market.png" className="w-full h-full object-cover scale-110 translate-y-[5%] transition-transform duration-1000 group-hover:scale-[1.15]" alt="Analysis" />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Deep analysis for <span className="font-display italic">any sector</span>
                                    </h3>
                                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                                        Get comprehensive breakdowns of your competitive landscape, target audience, and market viability, powered by vast reserves of industry intelligence.
                                    </p>
                                </div>
                            </div>

                            {/* STEP 3: ROADMAPS */}
                            <div id="service-step-2" data-index="2" className="service-step-container space-y-10">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img src="/feature_roadmaps.png" className="w-full h-full object-cover scale-110 translate-y-[3%] transition-transform duration-1000 group-hover:scale-[1.15]" alt="Roadmaps" />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Manage custom growth requirements
                                    </h3>
                                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                                        Easily create, update, and manage your own custom strategy requirements with ease. Our roadmaps adapt as your market signals evolve.
                                    </p>
                                </div>
                            </div>

                            {/* STEP 4: CHAT */}
                            <div id="service-step-3" data-index="3" className="service-step-container space-y-10">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img src="/feature_ai.png" className="w-full h-full object-cover scale-110 translate-y-[3%] transition-transform duration-1000 group-hover:scale-[1.15]" alt="Chat" />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Interactive support, <span className="font-display italic">every step</span>
                                    </h3>
                                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                                        Capable isn't just a research tool; it makes your venture journey way better with real-time feedback and intelligent chat guidance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


// ========== ADJUSTABLE RULES SECTION ==========
const AdjustableRulesSection = () => (
    <section className="w-full bg-[#FAFBFF] py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-100/50">
                <div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                        Adjustable steps to fit <span className="font-display italic text-[var(--brand-accent)]">your goal</span>
                    </h2>
                </div>
                <div className="flex flex-col">
                    <p className="text-gray-400 text-base sm:text-lg font-sans leading-relaxed max-w-lg mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                        Customize precisely how your venture evolves. Set milestones, tasks, and objectives that match your specific industry standards.
                    </p>
                </div>
            </div>

            {/* Two Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card 1: Customisable */}
                <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-700 group flex flex-col">
                    <div className="px-8 sm:px-10 pt-10 pb-8">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-[14px] bg-[var(--brand-accent)]/5 border border-[var(--brand-accent)]/10 text-[11px] font-bold text-[var(--brand-accent)] uppercase tracking-widest mb-6">
                            Customisable
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display text-gray-900 mb-4 tracking-tight">Precise Logic</h3>
                        <p className="text-gray-500 text-[16px] leading-relaxed max-w-sm mb-4">
                            Design paths that work for you, not the other way around.
                        </p>
                    </div>
                    {/* Image Container */}
                    <div className="w-full aspect-[16/10] pl-10 pt-10 pr-0 pb-0 mt-auto">
                        <div className="w-full h-full rounded-tl-[24px] overflow-hidden border-t border-l border-gray-100 relative group-hover:border-blue-500/20 transition-colors duration-700">
                            <img src="/market_analysis_vector.png" alt="Market Analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-blue-500/5 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105 pointer-events-none"></div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Workflows */}
                <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-700 group flex flex-col">
                    <div className="px-8 sm:px-10 pt-10 pb-8">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-[14px] bg-[var(--brand-accent)]/5 border border-[var(--brand-accent)]/10 text-[11px] font-bold text-[var(--brand-accent)] uppercase tracking-widest mb-6">
                            Workflows
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display text-gray-900 mb-4 tracking-tight">Insightful Coaching</h3>
                        <p className="text-gray-400 text-[16px] leading-relaxed max-w-sm mb-4">
                            Simplify the complex work and focus on the results.
                        </p>
                    </div>
                    {/* Image Container */}
                    <div className="w-full aspect-[16/10] pl-10 pt-10 pr-0 pb-0 mt-auto">
                        <div className="w-full h-full rounded-tl-[24px] overflow-hidden border-t border-l border-gray-100 relative group-hover:border-blue-500/20 transition-colors duration-700">
                            <img src="/action_roadmap_vector.png" alt="Market Analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-blue-500/5 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// ========== MISSION / QUOTE SECTION ==========
const MissionSection = () => (
    <section className="w-full bg-[#f9f9f9] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[24px] overflow-hidden relative group border border-gray-100 shadow-soft min-h-[500px] md:min-h-[700px] flex items-center justify-center py-16 px-4 md:py-24 md:px-12">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                    style={{
                        backfaceVisibility: 'hidden',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backgroundColor: '#0c1428',
                        filter: 'brightness(0.9)'
                    }}
                    src={heroVideo}
                />

                {/* Cinematic Dark Overlay */}
                <div className="absolute inset-0 transition-all duration-1000 opacity-100 group-hover:opacity-90 group-hover:scale-105 pointer-events-none" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }}></div>

                <div className="relative z-10 flex items-center justify-center w-full max-w-5xl">
                    <div className="bg-white/30 backdrop-blur-2xl rounded-[28px] p-2 md:p-3 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/40 w-full">
                        <div className="bg-white/80 backdrop-blur-3xl rounded-[20px] p-8 sm:p-10 md:p-16 lg:p-20 shadow-inner">
                            <p className="text-2xl sm:text-3xl lg:text-[42px] font-display font-normal text-gray-900 leading-[1.5] lg:leading-[1.6] tracking-tightest text-center mx-auto max-w-4xl">
                                What began as a <span className="font-display italic text-[var(--brand-accent)]">simple</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform rotate-3 transition-transform hover:scale-110">
                                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />
                                </span>
                                question—<span className="font-display italic">why is starting up so hard?</span>—has evolved into a mission to modernize
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform -rotate-6 transition-transform hover:scale-110">
                                    <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />
                                </span>
                                venture building. By merging technical skills with <span className="font-display italic">industry</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform rotate-6 transition-transform hover:scale-110">
                                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />
                                </span>
                                insights, we're creating technology that <span className="font-display italic text-gray-500">enhances speed, clarity, and confidence</span> in founder decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// ========== TESTIMONIAL + 3 STEPS SECTION ==========
const TestimonialStepsSection = () => (
    <section className="w-full bg-[#f9f9f9] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-start pt-16 border-t border-gray-100/50">

                {/* Left Column: Testimonial & Small Card */}
                <div>
                    {/* Stars */}
                    <div className="flex gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="text-2xl md:text-3xl font-display text-gray-900 leading-[1.3] mb-12 max-w-lg">
                        "The platform's deep research and actionable steps are incredible. It aligns perfectly with our specific startup goals."
                    </p>

                    {/* Author */}
                    <div className="mb-16 pl-6 border-l-2 border-blue-500">
                        <p className="font-bold text-gray-900 text-[16px] mb-1">Samantha Rivers</p>
                        <p className="text-[12px] font-sans text-gray-400 font-bold uppercase tracking-widest">Co-founder, InnovateX</p>
                    </div>

                    {/* Small nature card with glass label */}
                    <div className="w-full max-w-md aspect-[16/9] rounded-[14px] overflow-hidden bg-gray-100 relative shadow-soft">
                        <div className="absolute inset-0 bg-[url('/bauhaus_last_gen.png')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 bg-blue-500/10"></div>
                        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] bg-white/25 backdrop-blur-md p-0.5 sm:p-1 rounded-[14px] shadow-xl border border-white/30">
                            <div className="bg-white rounded-[10px] p-4 sm:p-6">
                                <p className="text-[11px] sm:text-[13px] font-bold text-gray-900 mb-1 leading-tight">Thorough market signal analysis</p>
                                <p className="text-[10px] sm:text-[11px] text-gray-400 font-sans leading-relaxed">Goes beyond surface keywords to analyze every aspect of the market landscape.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Steps */}
                <div>
                    <h3 className="text-3xl md:text-5xl lg:text-7xl font-display font-normal text-gray-900 leading-tight mb-16 tracking-tightest">
                        Launch your venture in just three easy steps!
                    </h3>

                    <div className="space-y-12">
                        {[
                            { title: 'Enter Your Idea', desc: 'Describe exactly what you envision, and our engine will begin the analysis process immediately.' },
                            { title: 'Analyze the Market', desc: 'Tell us precisely what you need, and our system will generate the data right away.' },
                            { title: 'Get Your Roadmap', desc: 'Give us your specific inputs, and our platform will start crafting it right away.' }
                        ].map((step, idx) => (
                            <div key={idx} className="space-y-2 md:space-y-3">
                                <h4 className="text-xl md:text-2xl font-bold text-gray-900">{step.title}</h4>
                                <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg font-sans">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// ========== FAQ WITH STATS SECTION ==========
const FAQWithStatsSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "What data sources does Capable actually use?",
            answer: "We scrape search engine results for market validation and pull community discussions for social signals. Then our AI model analyzes everything to generate your strategic report and 60-day plan."
        },
        {
            question: "Where is my data stored?",
            answer: "Your data is secured with enterprise-grade encryption. There's no backend database or external servers. Your project data, reports, and action plans are kept private."
        },
        {
            question: "How does the adaptive question wizard work?",
            answer: "After scraping signals, our AI generates 5-7 questions tailored to your specific idea. It detects if you're local or global, and adapts based on your business model."
        },
        {
            question: "Can the AI mentor help during execution?",
            answer: "Yes. The mentor chat knows your original idea, your full action plan, and your progress. It provides context-aware guidance, not generic advice."
        }
    ];

    return (
        <section className="w-full py-20 bg-[#FAFBFF]">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12 md:mb-20 pt-16 border-t border-gray-100/50">
                    <h2 className="text-4xl md:text-[84px] font-display font-normal text-gray-900 leading-[1] tracking-tightest">
                        Got questions? <br className="md:hidden" /> We've got <span className="font-display italic text-[var(--brand-accent)]">clarity</span>
                    </h2>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left: FAQ Accordion */}
                    <div className="divide-y divide-gray-100">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="group overflow-hidden">
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className={`w-full py-8 flex items-center gap-6 text-left transition-all duration-500 ${openIndex === idx ? 'pb-4' : ''}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <span className={`font-display text-lg md:text-2xl transition-colors duration-500 leading-none ${openIndex === idx ? 'text-[var(--brand-accent)]' : 'text-gray-900 group-hover:text-gray-600'}`}>
                                            {faq.question}
                                        </span>
                                    </div>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border ${openIndex === idx
                                        ? 'bg-[var(--brand-accent)] border-transparent rotate-180 shadow-soft'
                                        : 'bg-white border-gray-100 group-hover:border-gray-200 group-hover:scale-110'
                                        }`}>
                                        <svg
                                            className={`w-4 h-4 transition-colors duration-500 ${openIndex === idx ? 'text-white' : 'text-gray-400'}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-64 opacity-100 pb-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                    <p className="text-gray-400 leading-relaxed font-sans text-lg pr-16">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Stats Cards + Image Placeholders */}
                    <div className="space-y-8">
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-[14px] bg-[var(--brand-accent)] p-8 text-center shadow-soft hover:shadow-card transition-all duration-500 cursor-default group">
                                <p className="text-5xl md:text-6xl font-display font-normal text-white mb-3 leading-none group-hover:rotate-3 transition-transform duration-500">75%</p>
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">Faster Decisions</p>
                            </div>
                            <div className="rounded-[14px] bg-gray-900 p-8 text-center shadow-soft hover:shadow-card transition-all duration-500 cursor-default group">
                                <p className="text-5xl md:text-6xl font-display font-normal text-white mb-3 leading-none group-hover:-rotate-3 transition-transform duration-500">50%</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Cost Reduction</p>
                            </div>
                        </div>

                        {/* Image Placeholder */}
                        <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-soft group hover:shadow-card transition-all duration-700">
                            <div className="w-full aspect-[16/10] bg-gray-50 relative">
                                <img src="/feature_ai.png" alt="AI Analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-105 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ========== BOTTOM CTA SECTION ==========
const BottomCTASection = () => (
    <section className="w-full bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[24px] bg-[#FAFBFF] border border-gray-100 p-8 md:p-16 lg:p-24 relative overflow-hidden group shadow-soft">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--brand-accent)]/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-[var(--brand-accent)]/10"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px] -ml-40 -mb-40"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    {/* Left: CTA Content */}
                    <div>
                        <h2 className="text-3xl md:text-6xl lg:text-7xl font-display font-normal text-gray-900 leading-tight mb-8 tracking-tightest">
                            Ready to accelerate <br className="hidden md:block" /> your <span className="font-display italic text-[var(--brand-accent)]">business success?</span>
                        </h2>
                        <p className="text-gray-400 font-sans leading-relaxed text-lg max-w-lg mb-12">
                            Join thousands of entrepreneurs who've transformed their ideas into actionable plans with Capable.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/dashboard" className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-8 py-4 rounded-md font-bold text-[15px] tracking-tight hover:shadow-float active:scale-[0.98] transition-all duration-300 text-center">
                                Start Building — It's Free
                            </Link>
                            <button className="bg-white text-gray-900 px-8 py-4 rounded-md font-bold text-[15px] tracking-tight border border-gray-200 hover:bg-gray-50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 text-center">
                                Learn more →
                            </button>
                        </div>
                    </div>

                    {/* Right: Image Placeholder Card */}
                    <div className="rounded-[24px] border border-gray-100 bg-white shadow-soft overflow-hidden group-hover:shadow-card transition-all duration-700">
                        <div className="w-full aspect-[4/3] relative">
                            <img src="/bauhaus_last_gen.png" alt="Strategy Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/25 backdrop-blur-md p-1 rounded-[14px] shadow-xl border border-white/30">
                                    <div className="bg-white rounded-[10px] py-3 px-6 text-center">
                                        <span className="text-[11px] font-bold text-gray-900 tracking-widest uppercase">Premium Strategy Preview</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 sm:p-8 bg-gray-900 text-white flex items-center justify-between group-hover:bg-black transition-colors duration-700">
                            <div>
                                <p className="text-xs sm:text-sm font-bold mb-1 tracking-tight">Access Premium Packages</p>
                                <p className="text-[9px] sm:text-[11px] text-white/40 uppercase tracking-widest font-bold">Scaling made simple</p>
                            </div>
                            <button className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] text-[10px] sm:text-xs font-bold hover:shadow-soft transition-all active:scale-95">
                                View Plans
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default HomePage;
