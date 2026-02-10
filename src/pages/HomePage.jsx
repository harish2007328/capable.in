import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProjectStorage } from '../services/projectStorage';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    const navigate = useNavigate();
    const [idea, setIdea] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleGenerate = async () => {
        if (!idea.trim() || isEnhancing) return;

        await ProjectStorage.init();
        const newId = await ProjectStorage.create(idea);
        navigate(`/project/${newId}`);
    };

    const handleEnhance = async () => {
        if (!idea.trim() || isEnhancing) return;
        setIsEnhancing(true);
        try {
            const res = await fetch('/api/enhance-idea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea })
            });
            const data = await res.json();
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
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Background Gradient Base */}


            {/* Corner Blurred Shapes */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#073B99]/100 rounded-full blur-[220px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/100 rounded-full blur-[220px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            {/* Floating Decoration Cards (Desktop Only) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden max-w-[1600px] mx-auto z-20">

                {/* LEFT SIDE CARDS */}
                {/* Card 1: Top Left */}
                <div className="absolute top-32 left-8 w-fit transform -rotate-6 transition-all duration-1000 hover:rotate-0 hover:scale-105 pointer-events-auto">
                    <GlassCard
                        quote="Now or never."
                        sub="Execution is everything."
                        gradient="from-[#0066CC]/90 to-[#0BAAFF]/90"
                        textColor="text-white"
                    />
                </div>

                {/* Card 2: Middle Left */}
                <div className="absolute top-96 -left-4 w-fit transform rotate-6 transition-all duration-1000 hover:rotate-0 hover:scale-105 pointer-events-auto">
                    <GlassCard
                        quote="Capable."
                        sub="Built for speed."
                        gradient="from-white/80 to-blue-50/80"
                        textColor="text-[#073B99]"
                        light={true}
                    />
                </div>

                {/* Card 3: Bottom Left */}
                <div className="absolute top-[600px] left-12 w-fit transform -rotate-3 transition-all duration-1000 hover:rotate-0 hover:scale-105 pointer-events-auto">
                    <GlassCard
                        quote="No limits."
                        sub="Scale infinitely."
                        gradient="from-[#073B99]/90 to-[#0066CC]/90"
                        textColor="text-white"
                    />
                </div>


                {/* RIGHT SIDE CARDS */}
                {/* Card 4: Top Right */}
                <div className="absolute top-40 right-12 w-fit transform rotate-6 transition-all duration-1000 hover:rotate-0 hover:scale-105 pointer-events-auto">
                    <GlassCard
                        quote="Dream Big."
                        sub="We handle the rest."
                        gradient="from-white/80 to-indigo-50/80"
                        textColor="text-[#073B99]"
                        light={true}
                    />
                </div>

                {/* Card 5: Middle Right */}
                <div className="absolute top-96 -right-4 w-fit transform -rotate-6 transition-all duration-1000 hover:rotate-0 hover:scale-105 pointer-events-auto">
                    <GlassCard
                        quote="Launch Fast."
                        sub="Weeks to seconds."
                        gradient="from-[#0BAAFF]/90 to-[#0066CC]/90"
                        textColor="text-white"
                    />
                </div>

                {/* Card 6: Bottom Right */}
                <div className="absolute top-[550px] right-24 w-fit transform rotate-3 transition-all duration-1000 hover:rotate-0 hover:scale-105 pointer-events-auto">
                    <GlassCard
                        quote="Efficiency."
                        sub="The new standard."
                        gradient="from-blue-50/90 to-white/90"
                        textColor="text-[#073B99]"
                        light={true}
                        border="border-[#0066CC]/20"
                    />
                </div>
            </div>

            <div className="relative z-30 flex flex-col items-center px-4 max-w-7xl mx-auto w-full pt-32 md:pt-30">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">Intelligent Idea Architect</span>
                </div>

                {/* Hero Headings */}
                <div className="max-w-5xl text-center space-y-2 mb-5">
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-[#000000] tracking-tight leading-tight">
                        Transform Your Idea
                    </h1>
                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight">
                        to a <span className="text-[#0066CC]">Business</span>
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="text-base md:text-lg text-[#333333] max-w-2xl mx-auto text-center font-sans font-medium leading-relaxed mb-14 px-6">
                    Real-time market signals from web search + social platforms. Strategic analysis with demand scoring. A complete 60-day execution plan in under a minute.
                </p>

                {/* Levitating Glow Input Area & Process Flow */}
                <div className="relative w-full max-w-6xl mx-auto mb-24 flex flex-col items-center z-40">

                    {/* 1. INPUT BOX WRAPPER */}
                    <div className="relative w-full max-w-2xl group mb-0 z-10">
                        {/* Gradient Border */}
                        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#0066CC] via-[#0BAAFF] to-[#0066CC] pointer-events-none"></div>

                        {/* Glow Effect */}
                        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#0BAAFF] opacity-20 blur-lg transition-opacity duration-500 group-hover:opacity-40"></div>

                        {/* Input Content */}
                        <div className="relative bg-white rounded-[14px] flex flex-col p-2 h-full m-[2px]">

                            <div className="relative w-full">
                                <textarea
                                    className={`w-full h-28 p-6 text-xl text-[#111111] placeholder:text-gray-400 bg-transparent border-none outline-none resize-none font-sans font-medium leading-relaxed tracking-tight rounded-md transition-opacity duration-300 ${isEnhancing ? 'opacity-0' : 'opacity-100'}`}
                                    placeholder="Describe your business idea in a sentence..."
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
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
                                    <div className="absolute inset-0 p-6 flex flex-col gap-3 z-10">
                                        <div className="h-4 bg-gray-200/80 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200/60 rounded w-1/2 animate-pulse delay-75"></div>
                                        <div className="h-4 bg-gray-200/40 rounded w-2/3 animate-pulse delay-150"></div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center px-4 pb-3 mt-4">
                                <div className="relative group/enhance">
                                    <button
                                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${isEnhancing ? 'text-[#0066CC] bg-blue-50 cursor-not-allowed' : 'text-gray-400 hover:text-[#0066CC] hover:bg-blue-50'}`}
                                        onClick={handleEnhance}
                                        disabled={isEnhancing}
                                    >
                                        <Wand2 size={20} className={isEnhancing ? "animate-spin" : ""} />
                                    </button>
                                    {/* Custom Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover/enhance:opacity-100 transform translate-y-2 group-hover/enhance:translate-y-0 transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none">
                                        Enhance Idea
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    className="bg-gradient-to-r from-[#0066CC] to-[#0052a3] text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#0066CC]/25 hover:shadow-[#0066CC]/40"
                                >
                                    <span>Generate</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. FLOW LINES & BOXES */}
                    <div className="relative w-full max-w-[95%] md:max-w-6xl mt-36">
                        {/* SVG Flow Lines with Comet Particle Animation */}
                        <svg className="absolute -top-32 left-0 w-full h-30 z-0 pointer-events-none -translate-y-4" viewBox="0 0 800 160" preserveAspectRatio="none">
                            <style>
                                {`
                                    @keyframes particleFlow {
                                        0% { stroke-dashoffset: 600; }
                                        100% { stroke-dashoffset: 0; }
                                    }
                                    .particle-core {
                                        stroke-dasharray: 20 580;
                                        animation: particleFlow 3s ease-in-out infinite;
                                    }
                                    .particle-glow1 {
                                        stroke-dasharray: 30 570;
                                        animation: particleFlow 3s ease-in-out infinite;
                                        animation-delay: -0.05s;
                                    }
                                    .particle-glow2 {
                                        stroke-dasharray: 45 555;
                                        animation: particleFlow 3s ease-in-out infinite;
                                        animation-delay: -0.1s;
                                    }
                                    @keyframes spin-slow {
                                        from { transform: rotate(0deg); }
                                        to { transform: rotate(360deg); }
                                    }
                                    .animate-spin-slow {
                                        animation: spin-slow 8s linear infinite;
                                    }
                                    @keyframes shimmer {
                                        0% { background-position: -200% 0; }
                                        100% { background-position: 200% 0; }
                                    }
                                    .shimmer {
                                        background: linear-gradient(90deg, #f0f4f8 25%, #f9fafb 50%, #f0f4f8 75%);
                                        background-size: 200% 100%;
                                        animation: shimmer 2s infinite linear;
                                    }
                                `}
                            </style>

                            {/* Left Branch - Base */}
                            <path d="M 400 0 L 400 50 Q 400 70 380 70 L 133 70 Q 113 70 113 90 L 113 160"
                                fill="none" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
                            {/* Left Branch - Particle Trail */}
                            <path d="M 400 0 L 400 50 Q 400 70 380 70 L 133 70 Q 113 70 113 90 L 113 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="0.15" className="particle-glow2" />
                            <path d="M 400 0 L 400 50 Q 400 70 380 70 L 133 70 Q 113 70 113 90 L 113 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="0.4" className="particle-glow1" />
                            <path d="M 400 0 L 400 50 Q 400 70 380 70 L 133 70 Q 113 70 113 90 L 113 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="1" className="particle-core" />

                            {/* Center Branch - Base */}
                            <path d="M 400 0 L 400 160"
                                fill="none" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
                            {/* Center Branch - Particle Trail */}
                            <path d="M 400 0 L 400 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="0.15" className="particle-glow2" />
                            <path d="M 400 0 L 400 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="0.4" className="particle-glow1" />
                            <path d="M 400 0 L 400 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="1" className="particle-core" />

                            {/* Right Branch - Base */}
                            <path d="M 400 0 L 400 50 Q 400 70 420 70 L 667 70 Q 687 70 687 90 L 687 160"
                                fill="none" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
                            {/* Right Branch - Particle Trail */}
                            <path d="M 400 0 L 400 50 Q 400 70 420 70 L 667 70 Q 687 70 687 90 L 687 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="0.15" className="particle-glow2" />
                            <path d="M 400 0 L 400 50 Q 400 70 420 70 L 667 70 Q 687 70 687 90 L 687 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="0.4" className="particle-glow1" />
                            <path d="M 400 0 L 400 50 Q 400 70 420 70 L 667 70 Q 687 70 687 90 L 687 160"
                                fill="none" stroke="#0066CC" strokeWidth="3" strokeLinecap="round" opacity="1" className="particle-core" />
                        </svg>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                            <StepBox
                                label="Context"
                                title="Smart Interview"
                                description="Dynamic question wizard that adapts to your idea—no generic templates. Location-aware for hyperlocal businesses."
                                delay="0"
                                image="/market_analysis_vector.png"
                            />
                            <StepBox
                                label="Strategy"
                                title="Market-Backed Report"
                                description="1-10 demand score, feasibility breakdown, differentiation tactics, and risk analysis powered by live web data."
                                delay="100"
                                image="/business_model_vector.png"
                            />
                            <StepBox
                                label="Plan"
                                title="60-Day Roadmap"
                                description="Daily task calendar with no repeated activities. Every day is distinct, phased by objective, with measurable deliverables."
                                delay="200"
                                image="/action_roadmap_vector.png"
                            />
                        </div>
                    </div>
                </div>

                <DeepDiveSection />
                <WhyCapableSection />
                <CTASection />
                <FAQSection />
            </div>

            {/* Premium Footer Section */}
            <footer className="w-full bg-white border-t border-gray-100 pt-24 pb-12 relative overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {/* Company Info */}
                        <div className="space-y-6">
                            <Logo color="dark" className="h-8 w-auto scale-90 origin-left" />
                            <p className="text-gray-500 font-sans text-base leading-relaxed max-w-xs">
                                Empowering the next generation of entrepreneurs with AI-driven business intelligence and strategy.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0066CC] hover:bg-blue-50 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0066CC] hover:bg-blue-50 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0066CC] hover:bg-blue-50 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-gray-900 font-bold mb-6 font-display uppercase tracking-wider text-xs">Product</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Features</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Case Studies</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Pricing</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Updates</a></li>
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 className="text-gray-900 font-bold mb-6 font-display uppercase tracking-wider text-xs">Company</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">About Us</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Careers</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-[#0066CC] transition-colors font-sans font-medium text-sm">Terms of Service</a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-gray-900 font-bold mb-6 font-display uppercase tracking-wider text-xs">Stay in the loop</h4>
                            <p className="text-gray-500 font-sans text-sm mb-6 leading-relaxed">
                                Join our newsletter for the latest insights in AI and entrepreneurship.
                            </p>
                            <div className="relative group/input">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#0066CC]/10 focus:border-[#0066CC]/30 transition-all placeholder:text-gray-400 group-hover/input:border-gray-200"
                                />
                                <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-900 text-white px-4 rounded-md text-xs font-bold hover:bg-[#0066CC] transition-all">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </footer>

            {/* Massive Brand Mark Image */}
            <div className="w-full bg-white flex justify-center overflow-hidden pointer-events-none select-none">
                <img
                    src="/footer_brand.png"
                    alt="Brand Mark"
                    className="w-full md:w-[100%] h-auto opacity-100 object-cover"
                />
            </div>
        </div>
    );
};

const DeepDiveSection = () => {
    const steps = [
        {
            phase: "01",
            title: "Live Market Scraping",
            subtitle: "Phase: Research",
            description: "Search results and community discussions scraped in real-time. We analyze social signals and competitive landscapes before you answer a single question.",
            icon: <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>,
            span: "lg:col-span-2"
        },
        {
            phase: "02",
            title: "Context-Aware Questions",
            subtitle: "Phase: Refinement",
            description: "AI-powered wizard generates questions dynamically based on your idea—global or local, B2B or B2C. No duplicate questions, ever.",
            icon: <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>,
            span: "lg:col-span-1"
        },
        {
            phase: "03",
            title: "Strategic Assessment",
            subtitle: "Phase: Analysis",
            description: "Advanced AI combines your answers with scraped data to score market demand (1-10), assess feasibility, identify differentiation, and flag risks.",
            icon: <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>,
            span: "lg:col-span-1"
        },
        {
            phase: "04",
            title: "Execution Calendar",
            subtitle: "Phase: Action",
            description: "60 unique daily tasks grouped into strategic phases. Location-specific recommendations included. Mentor chat provides execution support in context.",
            icon: <div className="w-1.5 h-1.5 rounded-full bg-[#0066CC]"></div>,
            span: "lg:col-span-2"
        }
    ];

    return (
        <section className="w-full bg-white py-0 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="deep-dive-header text-center max-w-4xl mx-auto mb-20">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                        </span>
                        <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">The Process</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-5 text-center">
                        How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]">Works</span>
                    </h1>
                    <p className="mt-8 text-xl md:text-2xl text-gray-500 font-sans font-medium leading-relaxed max-w-2xl mx-auto text-center">
                        From initial idea to actionable roadmap—four strategic phases powered by real-time data and AI analysis.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 auto-rows-fr">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className={`bento-card ${step.span} bg-gradient-to-br from-[#073B99] via-[#0066CC] to-[#0BAAFF] rounded-2xl p-6 md:p-8 border border-white/10 transition-all duration-500 group relative overflow-hidden flex flex-col min-h-[280px]`}
                        >
                            <div className="relative z-10 h-full flex flex-col pointer-events-none">
                                <div className="flex justify-between items-start mb-12">
                                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                        {step.icon}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">{step.subtitle}</span>
                                    </div>
                                    <span className="text-5xl md:text-6xl font-display font-black text-white/5 transition-opacity duration-500 group-hover:opacity-10">
                                        {step.phase}
                                    </span>
                                </div>

                                <div className="mt-auto">
                                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-4 tracking-tight leading-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-blue-50/80 font-sans font-medium leading-relaxed text-base md:text-lg">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500"
                                style={{ backgroundImage: `radial-gradient(white 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }}>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Helper Components for the Mockup UI
const SitemapNode = ({ label, sub, active = true }) => (
    <div className={`w-40 bg-white border-2 ${active ? 'border-blue-500 shadow-md ring-4 ring-blue-500/5' : 'border-slate-100 opacity-40'} rounded-xl p-4 transition-all duration-500`}>
        <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{label}</span>
        </div>
        <div className="space-y-1.5">
            <div className="h-1 bg-slate-50 w-full rounded-full"></div>
            <div className="h-1 bg-slate-50 w-3/4 rounded-full"></div>
            {sub && <div className="mt-2 text-[8px] font-bold text-blue-400">{sub} Phase</div>}
        </div>
    </div>
);

const CollaboratorCursor = ({ name, color, hex, top, left, delay }) => (
    <div
        className="absolute z-20 transition-all duration-[3000ms] animate-pulse"
        style={{ top, left, animationDelay: delay }}
    >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="drop-shadow-sm">
            <path d="M5.5 3.5L15.5 13.5H9.5L5.5 17.5V3.5Z" fill={hex} />
        </svg>
        <div className={`${color} text-white px-2 py-0.5 rounded-md text-[10px] font-bold ml-4 -mt-2 whitespace-nowrap shadow-sm`}>
            {name}
        </div>
    </div>
);

const GlassCard = ({ quote, sub, gradient, textColor, light = false, border }) => (
    <div className={`relative group w-auto h-auto min-w-[220px] rounded-lg overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:scale-105 shadow-xl`}>
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} ${light ? 'backdrop-blur-xl' : ''}`}></div>

        {/* Glass Overlay/Border */}
        <div className={`absolute inset-0 border ${border || 'border-white/20'} rounded-lg z-10`}></div>

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center items-center py-8 px-10 text-center">
            <h3 className={`text-2xl md:text-3xl font-display font-bold mb-2 leading-tight whitespace-nowrap ${textColor}`}>
                {quote}
            </h3>
            <p className={`text-xs md:text-sm font-medium opacity-90 whitespace-nowrap ${textColor}`}>
                {sub}
            </p>
        </div>

        {/* Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"></div>
    </div>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="group space-y-6 p-8 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2">
        <div className="w-16 h-16 bg-slate-50 rounded-md flex items-center justify-center transition-colors group-hover:bg-blue-50">
            {icon}
        </div>
        <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-sans text-lg">
                {description}
            </p>
        </div>
    </div>
);

const StepBox = ({ label, title, description, delay, image }) => (
    <div className="relative w-full" style={{ animationDelay: `${delay}ms` }}>
        {/* Gradient Border */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#0066CC] via-[#0BAAFF] to-[#0066CC] pointer-events-none"></div>

        {/* Glow Effect */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#0BAAFF] opacity-20 blur-lg pointer-events-none"></div>

        {/* Card Content */}
        <div className="relative bg-white rounded-[14px] flex flex-col transition-all duration-300 cursor-default z-10 overflow-hidden m-[2px]">
            {/* Content Container */}
            <div className="p-8 pb-0 flex flex-col items-center text-center flex-grow">
                {/* Label Badge */}
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0BAAFF]/10 to-[#0066CC]/10 border border-[#0BAAFF]/20 text-xs font-bold uppercase tracking-wider mb-4 text-[#0066CC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] mr-2 animate-pulse"></span>
                    {label}
                </span>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
            </div>

            {/* Image Display Area - Fills Bottom */}
            <div className="relative w-full h-auto mt-5">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover scale-105" />
                ) : (
                    <div className="w-full h-full shimmer flex items-center justify-center bg-slate-50">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-200 animate-spin-slow opacity-20"></div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const WhyCapableSection = () => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [visibleCards, setVisibleCards] = useState(4);

    // Handle responsive visible cards
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVisibleCards(1);
            } else if (window.innerWidth < 1024) {
                setVisibleCards(2);
            } else {
                setVisibleCards(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset slide index when visible cards change
    useEffect(() => {
        setSlideIndex(0);
    }, [visibleCards]);

    const features = [
        {
            title: "Lightning-Fast AI",
            description: "Advanced language model optimized for speed, with built-in retry logic for reliable performance.",
            image: "/feature_lightning.png"
        },
        {
            title: "Privacy First",
            description: "Your data is secured with enterprise-grade encryption. No external servers—your ideas stay completely private.",
            image: "/feature_validation.png"
        },
        {
            title: "No Repeated Tasks",
            description: "Every day in your 60-day plan has unique, specific activities—not generic advice.",
            image: "/feature_roadmaps.png"
        },
        {
            title: "Drill-Down Questions",
            description: "Detects location-specific ideas and avoids asking redundant questions like budget twice.",
            image: "/feature_ai.png"
        },
        {
            title: "Contextual Mentor Chat",
            description: "AI mentor understands your current task, completed progress, and full action plan.",
            image: "/feature_market.png"
        },
        {
            title: "Transparent Pricing",
            description: "Clear, upfront pricing with no hidden fees. Pay only for what you use, with flexible plans for every stage.",
            image: "/feature_investor.png"
        }
    ];

    const maxSlide = Math.max(0, features.length - visibleCards);

    const nextSlide = () => {
        setSlideIndex(prev => Math.min(prev + 1, maxSlide));
    };

    const prevSlide = () => {
        setSlideIndex(prev => Math.max(prev - 1, 0));
    };

    // Calculate card width and gap based on visible cards
    const getCardWidth = () => {
        if (visibleCards === 1) return 'w-full';
        if (visibleCards === 2) return 'w-[calc(50%-10px)]';
        return 'w-[calc(25%-15px)]';
    };

    const getSlideOffset = () => {
        // On mobile, each card is 100% width, so slide by 100% per card
        if (visibleCards === 1) return slideIndex * 100;
        if (visibleCards === 2) return slideIndex * 51.5;
        return slideIndex * 26.25;
    };

    return (
        <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
                    <div className="mb-6 md:mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                        </span>
                        <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">Why Capable</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-gray-900 leading-[0.9] tracking-tighter mb-4 md:mb-6">
                        Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]">Founders</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 font-sans font-medium leading-relaxed max-w-2xl mx-auto px-4">
                        Everything you need to validate, plan, and launch your business idea with confidence.
                    </p>
                </div>

                {/* Slider Container */}
                <div className="relative overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{
                            transform: `translateX(-${getSlideOffset()}%)`,
                            gap: visibleCards === 1 ? '0' : '20px'
                        }}
                    >
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className={`flex-shrink-0 ${getCardWidth()}`}
                                style={{ padding: visibleCards === 1 ? '0 4px' : '0' }}
                            >
                                {/* Feature Visual */}
                                {feature.image ? (
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full aspect-square rounded-2xl mb-4 object-cover"
                                    />
                                ) : (
                                    <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 flex items-center justify-center overflow-hidden relative`}>
                                        {/* Mesh-style decorative orbs */}
                                        <div className="absolute inset-0">
                                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#073B99]/30 rounded-full blur-3xl"></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#0BAAFF]/20 rounded-full blur-2xl"></div>
                                        </div>
                                        {/* Filled Icon - no background */}
                                        {feature.icon}
                                    </div>
                                )}

                                {/* Content */}
                                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight px-1">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 font-sans leading-relaxed text-sm px-1">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-8 md:mt-10">
                    {/* Arrow Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={prevSlide}
                            disabled={slideIndex === 0}
                            className={`w-11 h-11 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${slideIndex === 0
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'border-gray-300 text-gray-600 hover:border-[#0066CC] hover:text-[#0066CC] hover:bg-blue-50 active:scale-95'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={slideIndex >= maxSlide}
                            className={`w-11 h-11 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${slideIndex >= maxSlide
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'border-gray-300 text-gray-600 hover:border-[#0066CC] hover:text-[#0066CC] hover:bg-blue-50 active:scale-95'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Slide indicators */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                        {Array.from({ length: maxSlide + 1 }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSlideIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${slideIndex === idx
                                    ? 'bg-[#0066CC] w-6'
                                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// CTA Section
const CTASection = () => {
    return (
        <section className="w-full relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                {/* Main CTA Card */}
                <div className="relative bg-gradient-to-br from-[#073B99] via-[#0066CC] to-[#0BAAFF] rounded-2xl p-10 md:p-16 overflow-hidden">
                    {/* Decorative orbs inside card */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0BAAFF]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Get Started Free</span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight tracking-tight mb-6">
                            From Idea to Execution
                            <br />
                            in 60 Seconds
                        </h2>

                        {/* Subtitle */}
                        <p className="text-base md:text-lg text-white/80 font-sans font-medium leading-relaxed max-w-xl mx-auto mb-10">
                            Type your idea. Get market research, strategic analysis, and a 60-day action plan—all powered by AI and real-time data.
                        </p>

                        {/* CTA Buttons - matching hero button style */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/dashboard" className="bg-white text-[#0066CC] px-8 py-3 rounded-md font-bold text-sm tracking-wide transition-all duration-300 hover:bg-white/80 active:scale-95 shadow-lg shadow-black/20 border border-white/20">
                                Start Building — It's Free
                            </Link>
                            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide border border-white/20 transition-all duration-300 hover:bg-white/20 active:scale-95">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// FAQ Section
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What data sources does Capable actually use?",
            answer: "We scrape search engine results for market validation and pull community discussions for social signals. Then our AI model analyzes everything to generate your strategic report and 60-day plan."
        },
        {
            question: "Where is my data stored?",
            answer: "Your data is secured with enterprise-grade encryption. There's no backend database or external servers. Your project data, reports, and action plans are kept completely private and secure."
        },
        {
            question: "How does the adaptive question wizard work?",
            answer: "After scraping web signals, our AI generates 5-7 contextual questions tailored to your specific idea. It detects if you're building something local or global, avoids asking duplicate questions, and adapts based on your business model."
        },
        {
            question: "What makes the 60-day plan different from templates?",
            answer: "Every single day has unique, non-repetitive tasks designed specifically for your idea. The plan is organized into strategic phases with measurable deliverables, and includes location-aware recommendations if applicable."
        },
        {
            question: "Can the AI mentor help during execution?",
            answer: "Yes. The mentor chat knows your original idea, your full action plan, which tasks you've completed, and what you're currently working on. It provides context-aware guidance, not generic advice."
        }
    ];

    return (
        <section className="w-full py-20 md:py-28 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Left Column - Header */}
                    <div className="lg:sticky lg:top-8 lg:self-start">
                        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                            </span>
                            <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">FAQ</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]">
                            Got
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]">Questions?</span>
                        </h2>

                        <p className="text-gray-500 font-sans text-base md:text-lg max-w-md font-medium mb-8 leading-relaxed">
                            Everything you need to know about Capable. Can't find what you're looking for? Reach out to our team.
                        </p>

                        <button className="bg-gradient-to-r from-[#0066CC] to-[#0052a3] text-white px-6 py-3 rounded-md font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#0066CC]/25">
                            Contact Support
                        </button>
                    </div>

                    {/* Right Column - FAQ Items */}
                    <div className="divide-y divide-gray-100">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="group"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className={`w-full py-6 flex items-center gap-5 text-left transition-all duration-300 ${openIndex === idx ? 'pb-4' : ''
                                        }`}
                                >
                                    {/* Question Text */}
                                    <div className="flex-1 min-w-0">
                                        <span className={`font-semibold text-lg md:text-xl block transition-colors duration-300 ${openIndex === idx ? 'text-[#0066CC]' : 'text-gray-900 group-hover:text-gray-700'
                                            }`}>
                                            {faq.question}
                                        </span>
                                    </div>

                                    {/* Toggle Button */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === idx
                                        ? 'bg-[#0066CC] rotate-180'
                                        : 'bg-gray-100 group-hover:bg-blue-50'
                                        }`}>
                                        <svg
                                            className={`w-5 h-5 transition-colors duration-300 ${openIndex === idx ? 'text-white' : 'text-gray-500 group-hover:text-[#0066CC]'
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Answer Panel */}
                                <div className={`overflow-hidden transition-all duration-300 ease-out ${openIndex === idx ? 'max-h-64 opacity-100 pb-6' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="pl-0 pr-14">
                                        <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-5 border-l-4 border-[#0066CC]">
                                            <p className="text-gray-600 leading-relaxed font-sans">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
