import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Search, Globe, Cpu, Sparkles, Wand2 } from 'lucide-react';

const ANALYSIS_STEPS = [
    { text: "Searching Google for market signals...", icon: <Globe size={14} /> },
    { text: "Reading industry articles & reports...", icon: <Search size={14} /> },
    { text: "Analyzing trends with OpenAI...", icon: <Cpu size={14} /> },
    { text: "Building strategic questions...", icon: <Sparkles size={14} /> },
    { text: "Cross-referencing with Perplexity AI...", icon: <Search size={14} /> },
    { text: "Finalizing discovery framework...", icon: <Wand2 size={14} /> },
];

const SOURCE_DOTS = [
    { name: "Google", bg: "bg-blue-500" },
    { name: "OpenAI", bg: "bg-emerald-500" },
    { name: "Perplexity", bg: "bg-teal-500" },
    { name: "Claude", bg: "bg-orange-400" },
    { name: "Gemini", bg: "bg-indigo-500" },
];

const SkeletonWizard = () => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
        }, 2400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex overflow-hidden bg-white">
            {/* Left Panel — exact mirror of Questionnaire */}
            <div className="w-full md:w-[60%] h-full flex flex-col relative border-r border-slate-100">
                {/* Header — real component, not skeleton */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                            Preparing Discovery...
                        </span>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg px-3 py-1 border border-blue-100/50 flex items-center gap-2">
                        <Lock size={10} className="text-[var(--brand-accent)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-accent)]">Ideas are encrypted & safe</span>
                    </div>
                </div>

                {/* Content — AI searching status replacing question text */}
                <div className="flex-1 overflow-y-auto px-8 md:px-16 pb-32 custom-scrollbar flex flex-col items-center justify-center relative">
                    {/* Background Glow — same as Questionnaire */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

                    <div className="max-w-xl mx-auto w-full flex flex-col items-center">
                        {/* Searching Animation Block */}
                        <div className="w-full flex flex-col items-center gap-6">
                            {/* Pulsing Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/60 flex items-center justify-center">
                                <Wand2 size={20} className="text-[var(--brand-accent)] animate-pulse" />
                            </div>

                            {/* Rotating Status Text */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stepIndex}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex items-center gap-2.5 text-slate-600"
                                >
                                    <span className="text-slate-400">{ANALYSIS_STEPS[stepIndex].icon}</span>
                                    <span className="text-[15px] font-semibold tracking-tight">{ANALYSIS_STEPS[stepIndex].text}</span>
                                </motion.div>
                            </AnimatePresence>

                            {/* Source Attribution */}
                            <div className="flex items-center gap-3 mt-1">
                                {SOURCE_DOTS.map((src, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${src.bg} opacity-40`} />
                                        <span className="text-[11px] font-bold text-slate-300 tracking-tight">{src.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Minimal progress bar */}
                            <div className="w-48 h-[3px] bg-slate-100 rounded-full overflow-hidden mt-2">
                                <motion.div
                                    className="h-full bg-[var(--brand-accent)] rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation — real component, disabled look */}
                <div className="absolute bottom-0 left-0 w-full px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                    <button className="group flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-300 bg-transparent rounded-xl uppercase tracking-widest cursor-not-allowed">
                        <ChevronLeft size={16} />
                        Exit
                    </button>
                    <button className="group flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-slate-100 text-slate-300 cursor-not-allowed shadow-none">
                        Continue
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Right Panel — real image, not skeleton */}
            <div className="hidden md:flex md:w-[40%] h-full bg-[#FAFBFF] items-center justify-center p-0 overflow-hidden relative border-none">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(var(--brand-accent)_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative z-10 w-full h-full">
                    <img
                        src="/bauhaus_last_gen.webp"
                        alt="Strategic Bauhaus Geometry"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=2070&auto=format&fit=crop';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                </div>

                {/* Glass Box — same as Questionnaire */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        className="p-2 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                    >
                        <div className="bg-white rounded-[24px] p-6 md:p-8 flex flex-col items-center text-center">
                            <h3 className="text-slate-900 text-[11px] font-black tracking-[0.2em] uppercase mb-4 opacity-80">
                                Creating Your Plan
                            </h3>
                            <p className="text-slate-600 text-xs font-semibold leading-relaxed max-w-[280px]">
                                We're turning your vision into a clear, step-by-step roadmap. Every answer you provide helps us refine your path to success.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonWizard;
