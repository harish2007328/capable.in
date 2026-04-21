import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Database, Cpu, Sparkles, Wand2, ShieldCheck, Zap } from 'lucide-react';

const ANALYSIS_STEPS = [
    { text: "Initializing market intelligence engine...", icon: <Zap size={16} /> },
    { text: "Scanning Google Search for latest trends...", icon: <Globe size={16} /> },
    { text: "Extracting insights from Perplexity AI reports...", icon: <Search size={16} /> },
    { text: "Analyzing consumer behavior with OpenAI...", icon: <Cpu size={16} /> },
    { text: "Synthesizing strategic questions with Anthropic Claude...", icon: <Sparkles size={16} /> },
    { text: "Finalizing Capable market validation framework...", icon: <ShieldCheck size={16} /> }
];

const AI_SOURCES = [
    { name: "Google Search", color: "text-blue-500" },
    { name: "Perplexity AI", color: "text-teal-500" },
    { name: "OpenAI GPT-4", color: "text-emerald-600" },
    { name: "Claude 3.5", color: "text-orange-500" },
    { name: "Gemini Pro", color: "text-indigo-500" }
];

const SkeletonWizard = () => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex overflow-hidden bg-white">
            {/* Left Panel - Skeleton Questions */}
            <div className="w-full md:w-[60%] h-full flex flex-col relative border-r border-slate-100">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                            Analyzing Market Potential...
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden px-8 md:px-16 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                        <div className="w-full h-[1px] bg-blue-600 animate-[scan_3s_linear_infinite]"></div>
                    </div>

                    <div className="max-w-xl mx-auto w-full space-y-10">
                        {/* Question Skeleton */}
                        <div className="space-y-4">
                            <div className="h-10 w-full bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-2xl animate-pulse" />
                            <div className="h-10 w-2/3 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-2xl animate-pulse" />
                        </div>

                        {/* Options Skeleton Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex items-center gap-4 relative overflow-hidden">
                                    <div className="w-5 h-5 rounded-full bg-white border border-slate-200" />
                                    <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                </div>
                            ))}
                        </div>

                        {/* AI Analysis Status Box */}
                        <div className="mt-8 p-6 rounded-[24px] bg-blue-50/30 border border-blue-100/50 backdrop-blur-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                                    <Wand2 size={20} className="animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">AI Context Research</h4>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={stepIndex}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="flex items-center gap-2 text-slate-600"
                                        >
                                            {ANALYSIS_STEPS[stepIndex].icon}
                                            <span className="text-sm font-semibold">{ANALYSIS_STEPS[stepIndex].text}</span>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Source Tags */}
                            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-blue-100/30 mt-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest w-full mb-1">Referencing Sources:</span>
                                {AI_SOURCES.map((source, i) => (
                                    <div key={i} className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className={`w-1 h-1 rounded-full ${source.color.replace('text', 'bg')}`} />
                                        <span className={`text-[12px] font-bold tracking-tight ${source.color}`}>{source.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-4 w-20 bg-slate-100 rounded-full" />
                    <div className="h-12 w-40 bg-slate-100 rounded-xl" />
                </div>
            </div>

            {/* Right Panel - Illustration (Persistent Image as requested) */}
            <div className="hidden md:flex md:w-[40%] h-full bg-[#FAFBFF] items-center justify-center p-0 overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(var(--brand-accent)_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                <div className="relative z-10 w-full h-full opacity-60">
                    <img
                        src="/bauhaus_last_gen.webp"
                        alt="Strategic Bauhaus Geometry"
                        className="w-full h-full object-cover grayscale-[0.2]"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=2070&auto=format&fit=crop';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"></div>
                </div>

                {/* Glass loading indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[80%] z-20">
                    <div className="p-1 px-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center gap-3">
                         <div className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Deep-Scanning Vision Domain</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
};

export default SkeletonWizard;
