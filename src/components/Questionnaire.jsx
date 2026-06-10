import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Wand2, PenTool, Lock, Search, Globe, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ANALYSIS_STEPS = [
    { text: "Agent searching the internet...", icon: <Globe size={18} /> },
    { text: "Analyzing market signals...", icon: <Search size={18} /> },
    { text: "Synthesizing project context...", icon: <Cpu size={18} /> },
];

const SOURCE_DOTS = [
    { name: "Google", bg: "bg-blue-500" },
    { name: "OpenAI", bg: "bg-emerald-500" },
    { name: "Perplexity", bg: "bg-teal-500" },
    { name: "Claude", bg: "bg-orange-400" },
    { name: "Gemini", bg: "bg-indigo-500" },
];

const ROLES = [
  { id: 'founder', label: 'Founder / Entrepreneur' },
  { id: 'engineering', label: 'Software Engineer' },
  { id: 'product', label: 'Product Manager' },
  { id: 'designer', label: 'Designer / Creative' },
  { id: 'sales', label: 'Sales representative' },
  { id: 'marketing', label: 'Marketing specialist' },
  { id: 'operations', label: 'Operations lead' },
  { id: 'finance', label: 'Finance / Investor' },
  { id: 'consultant', label: 'Business Consultant' },
  { id: 'other', label: 'Other' }
];

const Questionnaire = ({ questions = [], onComplete, onOnboardingSubmit, isReadonly = false, onBack, isLoading = false }) => {
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showFinalCta, setShowFinalCta] = useState(false);
    const [isManual, setIsManual] = useState(false);

    const currentQuestion = questions[currentIndex];
    const isLastStep = currentIndex === questions.length - 1;

    // Dynamically fetch and prefill name if questions change
    const authName = user?.profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const currentAnswer = answers[currentIndex];

    const questionText = currentQuestion ? (typeof currentQuestion === 'string' ? currentQuestion : currentQuestion.text) : '';
    const isLocationQuestion = questionText ? ((questionText.toLowerCase().includes('focusing') ||
        questionText.toLowerCase().includes('location') ||
        questionText.toLowerCase().includes('situated') ||
        questionText.toLowerCase().includes('country') ||
        questionText.toLowerCase().includes('city')) &&
        !questionText.toLowerCase().includes('money')) : false;

    // Derive location parts statelessly
    const parts = (typeof currentAnswer === 'string' && currentAnswer !== 'Globally') 
        ? currentAnswer.split(',').map(p => p.trim()) 
        : [];
    const country = parts[0] || '';
    const state = parts[1] || '';
    const district = parts[2] || '';

    const handleLocationChange = (countryVal, stateVal, districtVal) => {
        const combined = `${countryVal}, ${stateVal}, ${districtVal}`;
        const isEmpty = !/[a-zA-Z0-9]/.test(combined);
        handleManualSubmit(isEmpty ? '' : combined);
    };

    const handleOptionSelect = (option) => {
        if (isReadonly) return;
        setIsManual(false);
        setAnswers(prev => {
            const next = [...prev];
            while (next.length <= currentIndex) {
                next.push([]);
            }
            const currentSelected = Array.isArray(next[currentIndex]) ? next[currentIndex] : [];
            if (currentSelected.includes(option)) {
                next[currentIndex] = currentSelected.filter(item => item !== option);
            } else {
                next[currentIndex] = [...currentSelected, option];
            }
            return next;
        });
    };

    const handleManualSubmit = (text) => {
        setIsManual(true);
        setAnswers(prev => {
            const next = [...prev];
            while (next.length <= currentIndex) {
                next.push([]);
            }
            next[currentIndex] = text;
            return next;
        });
    };

    const handleNext = () => {
        setIsManual(false);
        if (currentQuestion && currentQuestion.id === 'idea' && onOnboardingSubmit) {
            const onboardingData = {
                name: answers[0] !== undefined ? answers[0] : authName,
                role: answers[1],
                companyName: answers[3],
                idea: answers[4]
            };
            onOnboardingSubmit(onboardingData);
        } else if (isLastStep) {
            if (isValidAnswer(answers[currentIndex])) setShowFinalCta(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setIsManual(false);
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const isValidAnswer = (answer) => {
        if (currentQuestion && currentQuestion.type === 'greeting') return true;
        if (currentQuestion && currentQuestion.id === 'name' && authName) return true;
        
        // Use default fallback if answer is undefined
        const actualAnswer = answer !== undefined ? answer : '';
        if (Array.isArray(actualAnswer)) return actualAnswer.length > 0;
        return typeof actualAnswer === 'string' && actualAnswer.trim().length > 0;
    };

    const handleFinalSubmit = () => {
        const formattedAnswers = questions.map((q, idx) => ({
            question: typeof q === 'string' ? q : q.text,
            answer: Array.isArray(answers[idx]) ? answers[idx].join(', ') : answers[idx]
        }));
        onComplete(formattedAnswers);
    };

    // Loading step animation
    const [loadingStep, setLoadingStep] = useState(0);
    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % ANALYSIS_STEPS.length);
        }, 2400);
        return () => clearInterval(interval);
    }, [isLoading]);

    if (!isLoading && (!questions || questions.length === 0)) return null;

    const options = (currentQuestion && currentQuestion.options) ? currentQuestion.options : [];
    const hasValidAnswer = isValidAnswer(currentAnswer);

    return (
        <div className="w-full h-full flex overflow-hidden bg-white">
            {/* Left Panel - Questions (3/5 = 60%) */}
            <div className="w-full md:w-[60%] h-full flex flex-col relative border-r border-slate-100">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                        {isLoading ? (
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                                INITIALIZING PROJECT CORE
                            </span>
                        ) : (
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                                Discovery Phase {currentIndex + 1} / {questions.length}
                            </span>
                        )}
                    </div>
                    <div className="bg-blue-50/50 rounded-lg px-3 py-1 border border-blue-100/50 flex items-center gap-2">
                        <Lock size={10} className="text-[var(--brand-accent)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-accent)]">Ideas are encrypted & safe</span>
                    </div>
                </div>

                {/* Content - Vertically Centered */}
                <div className="flex-1 overflow-y-auto px-8 md:px-16 pb-32 custom-scrollbar flex flex-col items-center justify-center relative">
                    {/* Subtle Background Glow & Scan line effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                        <div className="w-full h-[1px] bg-[var(--brand-accent)] animate-[scan_4s_linear_infinite]"></div>
                    </div>


                    {isLoading ? (
                        /* === MINIMALIST PREMIUM LOADING UI === */
                        <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-700">
                            <div className="relative z-10 flex flex-col items-center gap-12 w-full">
                                {/* Centered Status Group */}
                                <div className="flex flex-col items-center text-center gap-6">
                                    {/* Glass Tag */}
                                    <div className="px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-slate-200/60 rounded-full shadow-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                                            Generating Your Path
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={loadingStep}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                                className="flex items-center gap-4 text-slate-900"
                                            >
                                                <div className="text-[var(--brand-accent)] opacity-80">
                                                    {ANALYSIS_STEPS[loadingStep].icon}
                                                </div>
                                                <h2 className="text-[32px] font-normal leading-tight tracking-tight">
                                                    {ANALYSIS_STEPS[loadingStep].text}
                                                </h2>
                                            </motion.div>
                                        </AnimatePresence>
                                        
                                        <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed opacity-60">
                                            Curating 10 tailored questions for your discovery path
                                        </p>
                                    </div>
                                </div>

                                {/* More visible Skeleton below */}
                                <div className="w-full space-y-12 opacity-[0.25] pointer-events-none">
                                    <div className="space-y-6">
                                        <div className="h-10 w-full bg-slate-200 rounded-2xl animate-pulse" />
                                        <div className="h-10 w-3/4 bg-slate-200 rounded-2xl animate-pulse" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-20 rounded-2xl border border-slate-200 bg-slate-100 flex items-center p-6 gap-4">
                                                <div className="w-5 h-5 rounded-full bg-white border border-slate-200" />
                                                <div className="h-3 w-24 bg-white/60 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* === REAL QUESTIONS === */
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-xl mx-auto w-full"
                            >
                                <h1 className="text-3xl font-medium text-slate-900 leading-tight tracking-tight mb-2">
                                    {typeof currentQuestion === 'string' 
                                        ? currentQuestion 
                                        : (typeof currentQuestion.text === 'function' 
                                            ? currentQuestion.text(answers[0]) 
                                            : currentQuestion.text)}
                                </h1>

                                {currentQuestion.description && (
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        {currentQuestion.description}
                                    </p>
                                )}

                                <div className={currentQuestion.type === 'greeting' || currentQuestion.type === 'textarea' || currentQuestion.type === 'text' ? "w-full animate-in fade-in duration-300" : "grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-300"}>
                                    {currentQuestion.type === 'text' ? (
                                        <div className="w-full">
                                            <input
                                                type="text"
                                                value={currentAnswer !== undefined ? currentAnswer : (currentQuestion.id === 'name' ? authName : '')}
                                                onChange={(e) => handleManualSubmit(e.target.value)}
                                                placeholder={currentQuestion.placeholder || 'Enter your answer...'}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && hasValidAnswer && !isReadonly) {
                                                        handleNext();
                                                    }
                                                }}
                                                className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-lg outline-none transition-all focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] text-slate-800 placeholder:text-slate-300"
                                                autoFocus
                                            />
                                        </div>
                                    ) : currentQuestion.type === 'textarea' ? (
                                        <div className="w-full">
                                            <textarea
                                                value={currentAnswer || ''}
                                                onChange={(e) => handleManualSubmit(e.target.value)}
                                                placeholder={currentQuestion.placeholder || 'Enter your answer...'}
                                                className="w-full h-32 px-5 py-4 border border-slate-200 rounded-2xl text-base outline-none resize-none transition-all focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] custom-scrollbar text-slate-800 placeholder:text-slate-300"
                                                autoFocus
                                            />
                                        </div>
                                    ) : currentQuestion.type === 'role' ? (
                                        <>
                                            {ROLES.map((role) => {
                                                const isSelected = currentAnswer === role.label;
                                                return (
                                                    <button
                                                        key={role.id}
                                                        onClick={() => {
                                                            handleManualSubmit(role.label);
                                                        }}
                                                        className={`
                                                            group relative p-4 rounded-xl text-left transition-all duration-200 border-2 w-full flex items-center gap-3
                                                            ${isSelected
                                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors
                                                            ${isSelected ? 'border-white/30 bg-white/10 text-white' : 'border-slate-200 bg-slate-50'}
                                                        `}>
                                                            {isSelected && <CheckCircle2 size={10} />}
                                                        </div>
                                                        <span className="text-sm font-semibold uppercase tracking-wider">
                                                            {role.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </>
                                    ) : currentQuestion.type === 'greeting' ? (
                                        <div className="flex flex-col items-center text-center space-y-6 w-full py-4 animate-in fade-in duration-500">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] flex items-center justify-center text-white shadow-lg shadow-blue-100 animate-[bounce_2s_infinite]">
                                                <Sparkles size={28} />
                                            </div>
                                            <button
                                                onClick={handleNext}
                                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 mx-auto uppercase tracking-wider hover:shadow-xl hover:shadow-blue-200"
                                            >
                                                <span>Turn your idea into business</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    ) : isLocationQuestion ? (
                                        <>
                                            <div className="bg-white border-2 border-slate-100 rounded-xl p-4 flex flex-col gap-1 focus-within:border-[var(--brand-accent)] transition-colors">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Country</span>
                                                <input
                                                    type="text"
                                                    value={country}
                                                    onChange={(e) => handleLocationChange(e.target.value, state, district)}
                                                    placeholder="e.g. USA"
                                                    className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                                />
                                            </div>
                                            <div className="bg-white border-2 border-slate-100 rounded-xl p-4 flex flex-col gap-1 focus-within:border-[var(--brand-accent)] transition-colors">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">State / Region</span>
                                                <input
                                                    type="text"
                                                    value={state}
                                                    onChange={(e) => handleLocationChange(country, e.target.value, district)}
                                                    placeholder="e.g. California"
                                                    className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                                />
                                            </div>
                                            <div className="bg-white border-2 border-slate-100 rounded-xl p-4 flex flex-col gap-1 focus-within:border-[var(--brand-accent)] transition-colors">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">District / City</span>
                                                <input
                                                    type="text"
                                                    value={district}
                                                    onChange={(e) => handleLocationChange(country, state, e.target.value)}
                                                    placeholder="e.g. San Francisco"
                                                    className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    handleManualSubmit("Globally");
                                                }}
                                                className={`
                                                    group relative p-4 rounded-xl text-left transition-all duration-200 border-2 w-full flex items-center gap-3
                                                    ${currentAnswer === "Globally"
                                                        ? 'bg-slate-900 border-slate-900 text-white'
                                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors
                                                    ${currentAnswer === "Globally" ? 'border-white/30 bg-white/10 text-white' : 'border-slate-200 bg-slate-50'}
                                                `}>
                                                    {currentAnswer === "Globally" && <CheckCircle2 size={10} />}
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                    Globally
                                                </span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {options.map((option, idx) => {
                                                const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                                                return (
                                                    <button
                                                        key={`opt-${currentIndex}-${idx}`}
                                                        onClick={() => {
                                                            setIsManual(false);
                                                            handleOptionSelect(option);
                                                        }}
                                                        disabled={isReadonly}
                                                        className={`
                                                            group relative p-4 rounded-xl text-left transition-all duration-200 border-2 w-full flex items-center gap-3
                                                            ${isSelected && !isManual
                                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors
                                                            ${isSelected && !isManual ? 'border-white/30 bg-white/10 text-white' : 'border-slate-200 bg-slate-50'}
                                                        `}>
                                                            {isSelected && !isManual && <CheckCircle2 size={10} />}
                                                        </div>
                                                         <span className="text-sm font-semibold uppercase tracking-wider">
                                                             {option}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {/* Inline Manual Input */}
                                            <div className="h-full">
                                                {isManual ? (
                                                    <textarea
                                                        value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                                                        onChange={(e) => handleManualSubmit(e.target.value)}
                                                        placeholder="Specify your own answer..."
                                                        className="w-full h-full min-h-[58px] p-4 rounded-xl bg-white border-2 border-[var(--brand-accent)] text-xs font-bold uppercase tracking-wider text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setIsManual(true);
                                                            setAnswers(prev => {
                                                                const next = [...prev];
                                                                next[currentIndex] = '';
                                                                return next;
                                                            });
                                                        }}
                                                        className="w-full h-full p-4 rounded-xl border-2 border-dashed border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center gap-3 group"
                                                    >
                                                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-slate-200 bg-slate-50 group-hover:border-slate-300 transition-colors">
                                                            <PenTool size={10} className="group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Other / Custom</span>
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="absolute bottom-0 left-0 w-full px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                    {isLoading ? (
                        <>
                            <button className="group flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-300 bg-transparent rounded-xl uppercase tracking-widest cursor-not-allowed">
                                <ChevronLeft size={16} />
                                Exit
                            </button>
                            <button className="group flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-slate-100 text-slate-300 cursor-not-allowed shadow-none">
                                Continue
                                <ChevronRight size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={currentIndex === 0 ? onBack : handlePrev}
                                className="group flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-400 hover:text-slate-900 bg-transparent hover:bg-slate-50 rounded-xl uppercase tracking-widest transition-all"
                            >
                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                {currentIndex === 0 ? 'Exit' : 'Previous'}
                            </button>

                            {currentQuestion && (
                                <button
                                    onClick={handleNext}
                                    disabled={!hasValidAnswer || isReadonly}
                                    className={`
                                        group flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest shadow-lg
                                        ${hasValidAnswer && !isReadonly
                                            ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-blue-500/20 active:scale-95'
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                        }
                                    `}
                                >
                                    {isLastStep ? (onOnboardingSubmit ? 'Launch Setup' : 'Finalize') : 'Continue'}
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel - Illustration (2/5 = 40%) */}
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

                {/* Refined Glass + White Box Design (Matches Reference Image) */}
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

            {/* Final CTA Overlay */}
            <AnimatePresence>
                {showFinalCta && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 5 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 5 }}
                            className="w-full max-w-sm bg-white/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-2xl shadow-blue-500/10 text-center relative overflow-hidden"
                            style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Analysis Ready</h3>
                            <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                                Discovery complete. Generating your tactical execution protocol.
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowFinalCta(false)}
                                    className="flex-1 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-[10px] uppercase tracking-widest border border-slate-100 rounded-xl hover:bg-slate-50"
                                >
                                    Review
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    className="flex-[2] py-3 bg-[var(--brand-accent)] text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:bg-[var(--brand-accent-hover)] transition-all text-[10px] uppercase tracking-widest active:scale-95"
                                >
                                    Generate Report
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Questionnaire;
