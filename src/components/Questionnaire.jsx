import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Wand2, PenTool, Lock, Search, Globe, Cpu, Plus, Send, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import heroPoster from '../assets/hero-poster.png';

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

const getBadgeLabel = (q) => {
    if (!q) return 'Your Answer';
    if (q.id === 'name') return 'Your Name';
    if (q.id === 'companyName') return 'Company Name';
    if (q.id === 'idea') return 'Describe your idea';
    return q.placeholder || 'Your Answer';
};

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

const Questionnaire = ({ questions = [], onComplete, onOnboardingSubmit, onStageSubmit, isReadonly = false, onBack, isLoading = false, isStageSubmitting = false, isGeneratedPhase = false, originalIdea = '' }) => {
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

    const userNameInput = answers[0] !== undefined ? answers[0] : authName;
    const questionText = currentQuestion
        ? (typeof currentQuestion === 'string'
            ? currentQuestion
            : (typeof currentQuestion.text === 'function'
                ? currentQuestion.text(userNameInput)
                : currentQuestion.text))
        : '';
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
        if (currentQuestion && currentQuestion.id === 'stage' && onStageSubmit) {
            const onboardingData = {};
            questions.forEach((q, idx) => {
                if (q && q.id) {
                    onboardingData[q.id] = answers[idx];
                }
            });
            if (onboardingData.name === undefined || onboardingData.name === '') {
                onboardingData.name = authName;
            }
            onStageSubmit(onboardingData, () => {
                setCurrentIndex(prev => prev + 1);
            });
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
        if (currentQuestion && currentQuestion.type === 'stage-slider') return true;

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

    useEffect(() => {
        if (currentQuestion && currentQuestion.type === 'stage-slider' && answers[currentIndex] === undefined) {
            handleManualSubmit('MVP');
        }
    }, [currentIndex, currentQuestion]);

    if (!isLoading && (!questions || questions.length === 0)) return null;

    const options = (currentQuestion && currentQuestion.options) ? currentQuestion.options : [];
    const hasValidAnswer = isValidAnswer(currentAnswer);

    return (
        <div className={`w-full h-full flex overflow-hidden ${isGeneratedPhase ? 'bg-[#F5F5F5]' : 'bg-white'}`}>
            {/* Left Panel - Questions */}
            <div className={`w-full ${isGeneratedPhase ? 'md:flex-1 bg-transparent' : 'md:w-[50%] bg-white'} h-full flex flex-col relative z-10`}>
                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex items-center shrink-0 gap-3">
                    <button
                        onClick={onBack || (() => window.location.href = '/')}
                        className="onboarding-back-btn flex items-center gap-2"
                    >
                        <ChevronLeft size={14} />
                        Back to Home
                    </button>
                </div>

                {/* Content - Vertically Centered */}
                <div className="flex-1 overflow-y-auto px-8 md:px-16 pb-12 flex flex-col items-center justify-center custom-scrollbar relative">
                    {/* Subtle Background Glow & Scan line effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

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
                                className={currentQuestion.type === 'chat-idea' ? 'w-full max-w-[420px] h-full flex flex-col' : isGeneratedPhase ? 'max-w-2xl mx-auto w-full' : 'max-w-md mx-auto w-full'}
                            >
                                {currentQuestion.type !== 'chat-idea' && (
                                    <h1 className={isGeneratedPhase
                                        ? "text-base font-normal text-slate-700 leading-relaxed mb-6 text-left"
                                        : "text-4xl font-medium text-slate-900 leading-tight tracking-tight mb-10 text-center whitespace-nowrap"
                                    }>
                                        {isGeneratedPhase && <span className="text-slate-400 text-sm mr-2">{currentIndex + 1}.</span>}
                                        {typeof currentQuestion === 'string'
                                            ? currentQuestion
                                            : (typeof currentQuestion.text === 'function'
                                                ? currentQuestion.text(answers[0])
                                                : currentQuestion.text)}
                                    </h1>
                                )}

                                <div className={currentQuestion.type === 'chat-idea' ? "w-full h-full flex flex-col animate-in fade-in duration-300" : currentQuestion.type === 'greeting' || currentQuestion.type === 'textarea' || currentQuestion.type === 'text' || currentQuestion.type === 'stage-slider' ? "w-full animate-in fade-in duration-300" : "grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-300"}>
                                    {currentQuestion.type === 'text' ? (
                                        <div className="relative mt-0 w-full">
                                            <div className="onboarding-badge">
                                                {getBadgeLabel(currentQuestion)}
                                            </div>
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
                                                className="onboarding-input"
                                                autoFocus
                                            />
                                            {currentQuestion.description && (
                                                <p className="mt-2 text-[11px] text-slate-400 font-normal text-center">
                                                    {currentQuestion.description}
                                                </p>
                                            )}
                                        </div>
                                    ) : currentQuestion.type === 'textarea' ? (
                                        <div className="relative mt-0 w-full">
                                            <div className="onboarding-badge">
                                                {getBadgeLabel(currentQuestion)}
                                            </div>
                                            <textarea
                                                value={currentAnswer || ''}
                                                onChange={(e) => handleManualSubmit(e.target.value)}
                                                placeholder={currentQuestion.placeholder || 'Enter your answer...'}
                                                className="onboarding-textarea"
                                                autoFocus
                                            />
                                            {currentQuestion.description && (
                                                <p className="mt-2 text-[11px] text-slate-400 font-normal text-center">
                                                    {currentQuestion.description}
                                                </p>
                                            )}
                                        </div>
                                    ) : currentQuestion.type === 'stage-slider' ? (
                                        <div className="relative mt-0 w-full flex flex-col items-center">
                                            {/* Labels row */}
                                            <div className="w-full flex justify-between select-none">
                                                {options.map((opt) => {
                                                    const isSelected = (currentAnswer || 'MVP') === opt;
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => handleManualSubmit(opt)}
                                                            className={`px-3 py-1.5 text-[12px] md:text-[13px] whitespace-nowrap rounded-lg transition-all duration-300 text-center ${isSelected
                                                                ? 'bg-[#006EDB]/10 text-[#006EDB] font-medium'
                                                                : 'text-slate-400 hover:text-slate-600 font-normal'
                                                                }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Ruler/Ticks visualization */}
                                            <div className="relative w-full pt-3 pb-6 flex flex-col items-center">
                                                {/* Ticks container - same justify-between as labels, no extra padding */}
                                                <div className="w-full flex items-end justify-between h-10 relative select-none">
                                                    {Array.from({ length: 55 }).map((_, i) => {
                                                        const selectedOptIdx = options.indexOf(currentAnswer || 'MVP');
                                                        const targetTickIdx = selectedOptIdx * 9;
                                                        const dist = Math.abs(i - targetTickIdx);

                                                        const maxDist = 9;
                                                        const factor = Math.max(0, 1 - dist / maxDist);

                                                        const height = 12 + factor * 20;

                                                        let style = { height: `${height}px`, transition: 'all 300ms ease' };

                                                        if (factor > 0) {
                                                            style.backgroundColor = '#006EDB';
                                                            style.opacity = 0.3 + factor * 0.7;
                                                        } else {
                                                            style.backgroundColor = '#94A3B8';
                                                            style.opacity = 0.4;
                                                        }

                                                        return (
                                                            <div
                                                                key={i}
                                                                className="w-[2px] rounded-full"
                                                                style={style}
                                                            />
                                                        );
                                                    })}
                                                </div>

                                                {/* Blue dot indicator */}
                                                <div className="relative w-full h-4 mt-3">
                                                    <div
                                                        className="absolute w-2.5 h-2.5 bg-[#006EDB] rounded-full -translate-x-1/2 transition-all duration-300 ease-out"
                                                        style={{
                                                            left: `${(options.indexOf(currentAnswer || 'MVP') / (options.length - 1)) * 100}%`
                                                        }}
                                                    />
                                                </div>

                                                {/* Invisible range input for drag */}
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={options.length - 1}
                                                    value={options.indexOf(currentAnswer || 'MVP')}
                                                    onChange={(e) => handleManualSubmit(options[parseInt(e.target.value)])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                            </div>
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
                                                        className={`onboarding-option-btn ${isSelected ? 'selected' : ''}`}
                                                    >
                                                        <div className="onboarding-option-circle">
                                                            <div className="onboarding-option-dot" />
                                                        </div>
                                                        <span>{role.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </>
                                    ) : currentQuestion.type === 'greeting' ? (
                                        <div className="flex flex-col items-center text-center space-y-6 w-full py-4 animate-in fade-in duration-500">
                                            <div className="w-16 h-16 rounded-full bg-[#303030] flex items-center justify-center text-white shadow-lg shadow-black/10 animate-[bounce_2s_infinite]">
                                                <Sparkles size={28} />
                                            </div>
                                            <button
                                                onClick={handleNext}
                                                className="px-8 py-3.5 btn-primary text-sm font-medium normal-case flex items-center gap-2"
                                            >
                                                <span>Turn your idea into business</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    ) : isLocationQuestion ? (
                                        <>
                                            <div className="bg-white border-2 border-slate-100 rounded-[10px] p-4 flex flex-col gap-1 focus-within:border-slate-400 transition-colors">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Country</span>
                                                <input
                                                    type="text"
                                                    value={country}
                                                    onChange={(e) => handleLocationChange(e.target.value, state, district)}
                                                    placeholder="e.g. USA"
                                                    className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                                />
                                            </div>
                                            <div className="bg-white border-2 border-slate-100 rounded-[10px] p-4 flex flex-col gap-1 focus-within:border-slate-400 transition-colors">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">State / Region</span>
                                                <input
                                                    type="text"
                                                    value={state}
                                                    onChange={(e) => handleLocationChange(country, e.target.value, district)}
                                                    placeholder="e.g. California"
                                                    className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                                />
                                            </div>
                                            <div className="bg-white border-2 border-slate-100 rounded-[10px] p-4 flex flex-col gap-1 focus-within:border-slate-400 transition-colors">
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
                                                    group relative p-4 rounded-[10px] text-left transition-all duration-200 border-2 w-full flex items-center gap-3
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
                                    ) : isGeneratedPhase ? (
                                        /* Raw unstyled text options for generated phase */
                                        <>
                                            <div className="space-y-2">
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
                                                            className={`w-full text-left px-3 py-2 text-sm transition-colors rounded ${
                                                                isSelected && !isManual
                                                                    ? 'text-slate-900 bg-slate-100'
                                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Inline Manual Input */}
                                            <div className="mt-2">
                                                {isManual ? (
                                                    <textarea
                                                        value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                                                        onChange={(e) => handleManualSubmit(e.target.value)}
                                                        placeholder="Type your own answer..."
                                                        className="w-full min-h-[48px] px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded bg-white focus:outline-none focus:border-slate-400 resize-none placeholder:text-slate-400"
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
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-50"
                                                    >
                                                        Other / Custom
                                                    </button>
                                                )}
                                            </div>
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
                                                        className={`onboarding-option-btn ${isSelected && !isManual ? 'selected' : ''}`}
                                                    >
                                                        <div className="onboarding-option-circle">
                                                            <div className="onboarding-option-dot" />
                                                        </div>
                                                        <span>{option}</span>
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
                                                        className="w-full h-full min-h-[58px] p-4 rounded-[10px] bg-white border-2 border-[var(--brand-accent)] text-xs font-bold uppercase tracking-wider text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
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
                                                        className="w-full h-full p-4 rounded-[10px] border-2 border-dashed border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center gap-3 group"
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

                                {currentQuestion.type !== 'greeting' && currentQuestion.type !== 'chat-idea' && (
                                    <div className={`flex ${isGeneratedPhase ? 'justify-start' : 'justify-center'} items-center gap-3 mt-10 w-full`}>
                                        {currentIndex > 0 && (
                                            <button
                                                onClick={handlePrev}
                                                className="text-sm font-normal text-slate-500 hover:text-slate-950 underline transition-colors mr-2 cursor-pointer"
                                            >
                                                Back
                                            </button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            disabled={!hasValidAnswer || isReadonly || (currentQuestion.type === 'stage-slider' && isStageSubmitting)}
                                            className="btn-primary onboarding-btn normal-case disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {currentQuestion.type === 'stage-slider' && isStageSubmitting ? (
                                                <>
                                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                isLastStep ? (onOnboardingSubmit ? 'Launch Setup' : 'Finalize') : 'Continue'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            {isGeneratedPhase ? (
                <div className="hidden md:flex md:w-[400px] shrink-0 h-full bg-transparent">
                    <MentorChat
                        initialMessage="Tell me about your idea"
                        initialUserMessage={originalIdea}
                    />
                </div>
            ) : (
                <div className="hidden md:flex md:w-[50%] h-full relative overflow-hidden bg-slate-50">
                    <img src={heroPoster} alt="Onboarding illustration" className="w-full h-full object-cover" />
                </div>
            )}

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
                                    className="flex-1 py-3 btn-secondary text-[10px] uppercase tracking-widest"
                                >
                                    Review
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    className="flex-[2] py-3 btn-primary text-[10px] uppercase tracking-widest"
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
