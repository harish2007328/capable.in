import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Sparkles, LineChart, Target, Route, Globe2, Zap, Crosshair } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProjectStorage } from '../services/projectStorage';
import { getUserLimits } from '../config/planConfig';
import PricingModal from '../components/PricingModal';
import Lottie from 'lottie-react';
import loaderAnimation from '../loader.json';

// Import Home Components
const ServicesSection = React.lazy(() => import('../components/home/ServicesSection'));
const AdjustableRulesSection = React.lazy(() => import('../components/home/AdjustableRulesSection'));
const MissionSection = React.lazy(() => import('../components/home/MissionSection'));
const TestimonialStepsSection = React.lazy(() => import('../components/home/TestimonialStepsSection'));
const FAQWithStatsSection = React.lazy(() => import('../components/home/FAQWithStatsSection'));
const BottomCTASection = React.lazy(() => import('../components/home/BottomCTASection'));

// --- Animation Variants for Scroll Effects ---
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const HomePage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Redirect logged-in users who already have an active project to their project page
    useEffect(() => {
        const checkExistingProject = async () => {
            if (!loading && user) {
                await ProjectStorage.init();
                const existingProjects = await ProjectStorage.getAll();
                if (existingProjects && existingProjects.length > 0) {
                    ProjectStorage.setActiveId(existingProjects[0].id);
                    navigate(`/project/${existingProjects[0].id}`, { replace: true });
                }
            }
        };
        checkExistingProject();
    }, [user, loading, navigate]);

    const lottieRef = useRef(null);

    // Increase loader animation speed
    useEffect(() => {
        const timer = setTimeout(() => {
            if (lottieRef.current) {
                lottieRef.current.setSpeed(1.8);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const limits = getUserLimits(user);

    const handleGetStarted = async () => {
        // Redirect to login if not authenticated
        if (!user) {
            navigate('/login', {
                state: {
                    from: { pathname: '/project' }
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

        navigate('/project');
    };

    return (
        <>
            <div className="relative w-full bg-transparent clip-path-bounds">
                {/* --- HERO SECTION --- */}
                <section className="relative w-full h-[100dvh] min-h-[600px] flex flex-col items-center overflow-hidden">

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="relative z-30 flex flex-col items-center justify-center px-4 max-w-7xl mx-auto w-full flex-1 pt-[90px] md:pt-[115px] pb-4 md:pb-8"
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
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
                                <button
                                    onClick={handleGetStarted}
                                    className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/35 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <span>Get Started</span>
                                    <Sparkles className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </motion.div>

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
                </section>



                {/* === BETTER UNDERWRITES / FEATURE SHOWCASE === */}
                <section className="w-full bg-white py-16 md:py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Header: Large Editorial Headline */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                            className="mb-8 md:mb-12 max-w-4xl"
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Smarter research, faster <span className="text-[var(--brand-accent)] font-display italic">launch</span>
                            </h2>
                        </motion.div>

                        {/* Content Grid: Unified Master Bento Box */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                            className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white border border-gray-300 rounded-2xl overflow-hidden"
                        >
                            {/* Left: Premium Image Container */}
                            <div className="lg:col-span-7 relative group flex border-b lg:border-b-0 lg:border-r border-gray-300 overflow-hidden">
                                <div className="w-full relative bg-gray-100 min-h-[300px] sm:min-h-[360px] md:min-h-0 aspect-auto md:aspect-[4/3] lg:aspect-auto lg:h-full">
                                    <img
                                        src="/mobile/hero-poster.webp"
                                        srcSet="/mobile/hero-poster.webp 640w, /mobile/hero-poster.webp 1200w"
                                        sizes="(max-width: 640px) 100vw, 800px"
                                        loading="lazy"
                                        alt="Market Analysis Workflow"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-blue-600/5"></div>

                                    {/* Embedded Core Capabilities Hub — desktop only */}
                                    <div className="absolute inset-x-0 top-0 bottom-[180px] sm:bottom-[200px] hidden md:flex items-center justify-center z-10 px-4 md:px-12 pointer-events-none">
                                        <div className="flex flex-col md:flex-row items-stretch justify-between w-full relative max-w-3xl mx-auto">

                                            {/* Mobile Vertical Line */}
                                            <div className="absolute left-1/2 top-[5%] bottom-[5%] w-[1px] border-l border-dashed border-white/40 -translate-x-1/2 z-0 md:hidden opacity-50"></div>

                                            {/* Left Tags */}
                                            <div className="flex flex-col justify-between gap-6 sm:gap-10 w-full md:w-[28%] shrink-0 z-10 py-2">
                                                <motion.div variants={fadeUp} className="relative py-2.5 px-4 sm:px-5 rounded-full bg-white/15 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-2.5 w-fit mx-auto md:ml-auto md:mr-0 border border-white/30 z-10 pointer-events-auto hover:bg-white/25 transition-colors">
                                                    <Lightbulb className="w-4 h-4 text-white drop-shadow-md" strokeWidth={2.5} />
                                                    <span className="text-[11px] sm:text-[12px] font-bold text-white tracking-wide pr-1 drop-shadow-md whitespace-nowrap">Idea Validation</span>
                                                </motion.div>
                                                <motion.div variants={fadeUp} className="relative py-2.5 px-4 sm:px-5 rounded-full bg-white/15 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-2.5 w-fit mx-auto md:ml-auto md:mr-0 border border-white/30 z-10 pointer-events-auto hover:bg-white/25 transition-colors">
                                                    <LineChart className="w-4 h-4 text-white drop-shadow-md" strokeWidth={2.5} />
                                                    <span className="text-[11px] sm:text-[12px] font-bold text-white tracking-wide pr-1 drop-shadow-md whitespace-nowrap">Market Analysis</span>
                                                </motion.div>
                                            </div>

                                            {/* Left Connectors */}
                                            <div className="hidden md:block flex-1 relative z-0 -mx-1">
                                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                                                    <path d="M 100 50 C 40 50 60 20 0 20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                                                    <path d="M 100 50 C 40 50 60 80 0 80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                                                </svg>
                                            </div>

                                            {/* Center Loader */}
                                            <motion.div variants={fadeUp} className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 z-20 mx-auto self-center pointer-events-auto">
                                                <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-full w-full h-full p-3 flex items-center justify-center relative shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                                                    <Lottie lottieRef={lottieRef} animationData={loaderAnimation} loop={true} className="w-full h-full invert brightness-200 scale-125 drop-shadow-xl" />
                                                </div>
                                            </motion.div>

                                            {/* Right Connectors */}
                                            <div className="hidden md:block flex-1 relative z-0 -mx-1">
                                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                                                    <path d="M 0 50 C 60 50 40 20 100 20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                                                    <path d="M 0 50 C 60 50 40 80 100 80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                                                </svg>
                                            </div>

                                            {/* Right Tags */}
                                            <div className="flex flex-col justify-between gap-6 sm:gap-10 w-full md:w-[28%] shrink-0 z-10 py-2">
                                                <motion.div variants={fadeUp} className="relative py-2.5 px-4 sm:px-5 rounded-full bg-white/15 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-2.5 w-fit mx-auto md:mr-auto md:ml-0 border border-white/30 z-10 pointer-events-auto hover:bg-white/25 transition-colors">
                                                    <Target className="w-4 h-4 text-white drop-shadow-md" strokeWidth={2.5} />
                                                    <span className="text-[11px] sm:text-[12px] font-bold text-white tracking-wide pr-1 drop-shadow-md whitespace-nowrap">Competitor Intel</span>
                                                </motion.div>
                                                <motion.div variants={fadeUp} className="relative py-2.5 px-4 sm:px-5 rounded-full bg-white/15 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-2.5 w-fit mx-auto md:mr-auto md:ml-0 border border-white/30 z-10 pointer-events-auto hover:bg-white/25 transition-colors">
                                                    <Route className="w-4 h-4 text-white drop-shadow-md" strokeWidth={2.5} />
                                                    <span className="text-[11px] sm:text-[12px] font-bold text-white tracking-wide pr-1 drop-shadow-md whitespace-nowrap">Custom Roadmaps</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                    <div className="absolute bottom-6 sm:bottom-8 left-6 right-6 lg:left-10 lg:right-10 bg-white/40 p-1.5 rounded-2xl border border-white/50 backdrop-blur-md z-10">
                                        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-5 sm:p-6 border border-gray-300/50">
                                            <div className="text-gray-600 text-[13px] sm:text-[14px] leading-relaxed">
                                                <h4 className="font-instrument-serif text-xl sm:text-2xl font-normal text-gray-900 leading-tight tracking-tightest flex items-center gap-3 mb-3">
                                                    <span className="font-instrument-serif">Execution is nothing without <span className="font-instrument-serif text-[var(--brand-accent)] italic pr-1">validation.</span></span>
                                                </h4>
                                                Launching is traditionally complex and resource-intensive. We've seamlessly merged smart technology with market expertise to optimize the entire process from the ground up, enabling founders to make faster decisions.
                                            </div>
                                        </div>
                                    </div>
                            </div>

                            {/* Right: 2x2 Unified Grid for Stats & CTA */}
                            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 bg-white h-full">

                                {/* Stat 1: Global Founders */}
                                <div className="p-8 sm:p-10 flex flex-col justify-between group hover:bg-gray-50/50 transition-colors border-b sm:border-r border-gray-300">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-3xl lg:text-4xl font-display font-normal text-gray-900 leading-none tracking-tightest">150+</p>
                                            <Globe2 className="w-6 h-6 text-gray-300 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-1.5">Global Founders</p>
                                            <p className="text-[12px] text-gray-500 font-sans leading-relaxed">Trusted by entrepreneurs worldwide.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stat 2: Launch Readiness */}
                                <div className="p-8 sm:p-10 flex flex-col justify-between group hover:bg-gray-50/50 transition-colors border-b border-gray-300">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-3xl lg:text-4xl font-display font-normal text-gray-900 leading-none tracking-tightest">40%</p>
                                            <Zap className="w-6 h-6 text-gray-300 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-1.5">Launch Readiness</p>
                                            <p className="text-[12px] text-gray-500 font-sans leading-relaxed">Increase in speed to market implementation.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stat 3: Market Accuracy */}
                                <div className="p-8 sm:p-10 flex flex-col justify-between group hover:bg-gray-50/50 transition-colors border-b sm:border-b-0 sm:border-r border-gray-300">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-3xl lg:text-4xl font-display font-normal text-gray-900 leading-none tracking-tightest">95%</p>
                                            <Crosshair className="w-6 h-6 text-gray-300 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-1.5">Market Accuracy</p>
                                            <p className="text-[12px] text-gray-500 font-sans leading-relaxed">Highest precision rate in trend analysis.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Unit embedded in the grid */}
                                <div className="p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-[var(--brand-accent)] to-[#096aca] group">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-display font-normal text-white leading-none tracking-tightest">Ready to validate?</h3>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-blue-100/90 font-sans leading-relaxed">Start turning ideas into actionable roadmaps.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Link to="/pricing" className="w-full py-3.5 bg-white hover:bg-gray-50 text-[var(--brand-accent)] rounded-xl font-bold text-[13px] tracking-tight transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
                                            Explore pricing
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
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
                    <MissionSection />

                    {/* === TESTIMONIAL + 3 STEPS === */}
                    <TestimonialStepsSection />

                    {/* === FAQ WITH STATS === */}
                    <FAQWithStatsSection />

                    {/* === BOTTOM CTA BANNER === */}
                    <BottomCTASection />
                </React.Suspense>

                {/* === FOOTER === */}
                <footer className="w-full bg-white py-12 border-t border-gray-300">
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