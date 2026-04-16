import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Maximize2, X, Sparkles, Rocket, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { ProjectStorage } from '../services/projectStorage';
import { getUserLimits } from '../config/planConfig';
import PricingModal from '../components/PricingModal';
// Hero Assets (Moved to public/ for preloading)
const heroVideo = "/hero-bg2-compressed.mp4";
const heroPoster = window.innerWidth < 768 ? "/mobile/hero-poster.webp" : "/hero-poster.webp";

// Import Home Components
const ServicesSection = React.lazy(() => import('../components/home/ServicesSection'));
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
];

// --- Animation Variants for Scroll Effects ---
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const scaleUp = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(8px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
};

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();
    const [idea, setIdea] = useState(() => {
        return location.state?.idea || sessionStorage.getItem('capable_draft_idea') || '';
    });
    const [isEnhancing, setIsEnhancing] = useState(false);
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

    // Save idea to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('capable_draft_idea', idea);
    }, [idea]);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const limits = getUserLimits(user);

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

        // Check project limit
        await ProjectStorage.init();
        const existingProjects = await ProjectStorage.getAll();
        if (existingProjects.length >= limits.maxProjects) {
            setShowUpgradeModal(true);
            return;
        }

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
            const enhanced = data.enhanced_idea || data.enhancedIdea;
            if (enhanced) {
                setIdea(enhanced);
            }
        } catch (error) {
            console.error("Enhancement failed:", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <>
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
                                preload="none"
                                poster={heroPoster}
                                fetchPriority="high"
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
                            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }}></div>
                        </div>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="relative z-30 flex flex-col items-center justify-center px-4 max-w-7xl mx-auto w-full flex-1 pt-[119px] md:pt-[135px] pb-6 md:pb-12"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 shadow-sm cursor-default">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wide">Intelligent Idea Architect</span>
                        </motion.div>

                        {/* Hero Headings */}
                        <motion.div variants={fadeUp} className="max-w-5xl text-center space-y-4 mb-6">
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-normal text-white leading-[1.1] tracking-[-0.06em]" style={{ textShadow: '0 2px 12px rgba(76, 69, 69, 0.3)' }}>
                                Be <span className="font-display italic">Capable</span> of Building Businesses
                            </h1>
                        </motion.div>

                        {/* Subtitle */}
                        <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto text-center font-sans font-medium leading-relaxed mb-10 px-6">
                            Validate your market and get a personalized 60-day roadmap to turn your vision into a real business.
                        </motion.p>

                        <motion.div variants={fadeUp} className="relative w-full max-w-6xl mx-auto mb-8 flex flex-col items-center z-40">
                            <div className="relative w-full max-w-2xl group mb-0 z-10">
                                <motion.div
                                    layoutId="input-container"
                                    className="relative bg-white/20 backdrop-blur-xl rounded-[32px] p-[10px] flex flex-col h-full border border-white/30 shadow-2xl shadow-black/40"
                                >
                                    <div className="relative bg-white/80 backdrop-blur-3xl rounded-[24px] flex flex-col shadow-inner overflow-hidden border border-white/40">
                                        <div className="relative w-full p-4 pb-2">
                                            <textarea
                                                className={`w-full h-24 sm:h-28 p-4 text-lg sm:text-xl text-gray-900 placeholder:text-gray-400 bg-transparent border-none outline-none resize-none font-sans font-medium leading-relaxed rounded-md transition-all duration-300 custom-scrollbar-hero ${isEnhancing ? 'opacity-0' : 'opacity-100'}`}
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
                                            {isEnhancing && (
                                                <div className="absolute inset-0 p-8 flex flex-col gap-2 z-10 bg-white/60 backdrop-blur-sm rounded-2xl">
                                                    <div className="h-4 bg-gray-200/50 rounded w-3/4 animate-pulse"></div>
                                                    <div className="h-4 bg-gray-100/50 rounded w-1/2 animate-pulse delay-75"></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center px-6 py-4 border-t border-black/5">
                                            <div className="flex items-center gap-3">
                                                {/* Enhance/AI Button */}
                                                <button
                                                    className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isEnhancing
                                                        ? 'bg-blue-50 border-blue-100 text-blue-500 shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md'
                                                        }`}
                                                    onClick={handleEnhance}
                                                    disabled={isEnhancing}
                                                >
                                                    <Wand2 size={16} className={`${isEnhancing ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`} />
                                                    <span className="text-[13px] font-bold uppercase tracking-widest hidden sm:inline-block">Enhance</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Generate Button */}
                                                <button
                                                    onClick={handleGenerate}
                                                    className="relative group overflow-hidden bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-8 py-3 rounded-xl font-bold text-[15px] leading-none transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-95 flex items-center gap-2.5"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="relative z-10 tracking-tight">Generate</span>
                                                    <Sparkles className="relative z-10 w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {contentWarning && ReactDOM.createPortal(
                                        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-md px-4" onClick={() => { setContentWarning(''); setIdea(''); }}>
                                            <div className="bg-gradient-to-b from-red-500 to-red-600 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                                                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-5">
                                                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">We Can't Process This</h3>
                                                <p className="text-red-100 text-sm mb-6">{contentWarning}</p>
                                                <button onClick={() => { setContentWarning(''); setIdea(''); }} className="w-full px-5 py-3 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all active:scale-95 shadow-lg">Try a Different Idea</button>
                                            </div>
                                        </div>,
                                        document.body
                                    )}

                                </motion.div>
                            </div>

                            {/* SOCIAL PROOF SECTION */}
                            <motion.div
                                variants={fadeUp}
                                className="mt-6 flex items-center justify-center gap-4"
                            >
                                <div className="flex -space-x-2 overflow-hidden">
                                    {[
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
                                    ].map((url, i) => (
                                        <img
                                            key={i}
                                            src={url}
                                            className="inline-block h-6 w-6 rounded-full border-2 border-white object-cover shadow-sm"
                                            alt={`User ${i + 1}`}
                                        />
                                    ))}
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 border-2 border-white text-white text-[7px] font-black z-10 shadow-sm">
                                        +1K
                                    </div>
                                </div>
                                <div className="h-4 w-[1px] bg-white/20"></div>
                                <p className="text-white/80 text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                                    Trusted by <span className="text-white">1000+ Entrepreneurs</span>
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* === CORE CAPABILITIES / TAGS === */}
                <section className="w-full bg-white py-10 md:py-14 border-b border-gray-50 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    <div className="max-w-[1400px] mx-auto px-4">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={staggerContainer} className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-3 sm:gap-4 xl:gap-0">
                            {['Idea Validation', 'Market Analysis', 'Competitor Intelligence', 'Custom Roadmaps', 'Go-To-Market Strategy'].map((item, idx, arr) => (
                                <React.Fragment key={idx}>
                                    <motion.div variants={fadeUp} className="relative p-1 rounded-[22px] bg-white/20 backdrop-blur-md border border-white/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default group z-10">
                                        <div className="bg-white rounded-[18px] py-3 px-6 flex items-center justify-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform"><Sparkles className="w-3.5 h-3.5 text-blue-600" /></div>
                                            <span className="text-[12px] font-bold text-gray-900 tracking-tight uppercase tracking-widest text-center whitespace-nowrap">{item}</span>
                                        </div>
                                    </motion.div>
                                    {idx < arr.length - 1 && (
                                        <motion.div variants={fadeUp} className="hidden xl:flex items-center w-10 -mx-1 z-0 relative">
                                            <motion.div variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.4, delay: 1.6 + (idx * 0.2), ease: "easeOut" } } }} className="w-full h-[3px] bg-gradient-to-r from-blue-200 to-blue-400 rounded-full origin-left"></motion.div>
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* === BETTER UNDERWRITES / FEATURE SHOWCASE === */}
                <section className="w-full bg-[#f9f9f9] py-20 md:py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Header: Large Editorial Headline */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                            className="mb-8 md:mb-12 max-w-4xl"
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-7xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Smarter research,<br />faster
                                <span className="text-[var(--brand-accent)] font-display italic"> launch</span>
                            </h2>
                        </motion.div>

                        {/* Content Grid: Staggered Image & Text */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-24 mb-20 items-start">
                            {/* Left: Premium Image Container */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={scaleUp}
                                className="lg:col-span-7"
                            >
                                <div className="relative group">
                                    <div className="rounded-[14px] overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-gray-100 relative shadow-2xl">
                                        <img
                                            src="/mobile/hero-poster.webp"
                                            srcSet="/mobile/hero-poster.webp 640w, /mobile/hero-poster.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 800px"
                                            loading="lazy"
                                            alt="Market Analysis Workflow"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5"></div>

                                        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] bg-white/25 p-1 sm:p-1.5 rounded-[14px] shadow-2xl border border-white/30">
                                            <div className="bg-white rounded-[12px] py-2.5 sm:py-4 flex items-center justify-center">
                                                <span className="text-[10px] sm:text-[13px] font-bold text-gray-900 tracking-tight uppercase tracking-widest text-center px-2">Intelligent Market Analysis Workflow</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right: Editorial Narrative */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={staggerContainer}
                                className="lg:col-span-5 pt-8"
                            >
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <motion.p variants={fadeUp} className="text-gray-900 font-sans text-lg sm:text-xl leading-relaxed font-normal">
                                            Launching is traditionally <span className="italic font-display">complex and resource-intensive</span>. We've optimized the process from the ground up.
                                        </motion.p>
                                        <motion.p variants={fadeUp} className="text-gray-700 font-sans text-base sm:text-lg leading-relaxed">
                                            By seamlessly merging smart technology with market expertise, we enable founders to make faster, more confident decisions without sacrificing clarity or conviction.
                                        </motion.p>
                                    </div>
                                    <motion.div variants={fadeUp} className="pt-8 border-t border-gray-100 w-fit">
                                        <p className="text-gray-900 font-bold text-[11px] tracking-widest mb-2">OUR PHILOSOPHY</p>
                                        <p className="text-gray-900 font-sans text-base italic">"Execution is nothing without validation."</p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Section: CTA & Stats */}
                        <div className="flex flex-col lg:flex-row items-end justify-between gap-20">
                            {/* Stats Cluster */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={staggerContainer}
                                className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20"
                            >
                                {[
                                    { number: '150+', label: 'Global Founders', desc: 'Trusted by entrepreneurs around the world.' },
                                    { number: '40%', label: 'Launch Readiness', desc: 'Increase in speed to market implementation.' },
                                    { number: '95%', label: 'Market Accuracy', desc: 'Highest precision rate in trend analysis.' }
                                ].map((stat, idx) => (
                                    <motion.div variants={fadeUp} key={idx} className="flex flex-col group py-1 md:py-0">
                                        <div className="relative p-1 rounded-[24px] bg-white/20 backdrop-blur-md border border-white/30 shadow-lg mb-6 max-w-xs transition-all duration-300 group-hover:shadow-2xl">
                                            <div className="bg-white rounded-[20px] p-8 flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-4xl md:text-5xl font-display font-normal text-gray-900 leading-none tracking-tightest">{stat.number}</p>
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-sky-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-bold text-[11px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                                    <p className="text-[13px] text-gray-500 font-sans leading-relaxed">{stat.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* CTA Unit */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={fadeUp}
                                className="flex flex-col items-center lg:items-end gap-6"
                            >
                                <button className="relative group overflow-hidden bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-8 py-4 rounded-xl font-bold text-[14px] tracking-tight hover:shadow-2xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 flex items-center gap-3">
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <Sparkles className="w-4 h-4" />
                                    <span className="relative z-10">Request a demo</span>
                                </button>
                                <Link to="/plans" className="group flex items-center gap-2 text-gray-700 hover:text-[var(--brand-accent)] font-bold text-[14px] tracking-tight transition-all pb-0.5 uppercase">
                                    <span>Explore pricing</span>
                                    <div className="w-6 h-[1px] bg-gray-300 group-hover:bg-[var(--brand-accent)] group-hover:w-8 transition-all"></div>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* === SERVICES / TABBED SECTION === */}
                <React.Suspense fallback={<div className="h-96 w-full bg-white animate-pulse" />}>
                    <ServicesSection />
                </React.Suspense>

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

                            {/* Made with Tagline */}
                            <motion.div variants={fadeUp} className="flex items-center gap-2 order-2 md:order-3">
                                <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                    Build by <span className="font-bold text-gray-900 tracking-tight">Harish 💙</span>
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </footer>
            </div>
            <PricingModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </>
    );
};

export default HomePage;