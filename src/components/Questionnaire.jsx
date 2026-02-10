import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Wand2, PenTool, Lock } from 'lucide-react';

const Questionnaire = ({ questions = [], onComplete, isReadonly = false, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(new Array(questions.length).fill([]));
    const [showFinalCta, setShowFinalCta] = useState(false);
    const [isManual, setIsManual] = useState(false);

    useEffect(() => {
        setIsManual(false);
    }, [currentIndex]);

    const currentQuestion = questions[currentIndex];
    const isLastStep = currentIndex === questions.length - 1;

    const handleOptionSelect = (option) => {
        if (isReadonly) return;
        const newAnswers = [...answers];
        const currentSelected = Array.isArray(newAnswers[currentIndex]) ? newAnswers[currentIndex] : [];

        if (currentSelected.includes(option)) {
            newAnswers[currentIndex] = currentSelected.filter(item => item !== option);
        } else {
            newAnswers[currentIndex] = [...currentSelected, option];
        }
        setAnswers(newAnswers);
    };

    const handleManualSubmit = (text) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex] = text;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (isLastStep) {
            if (isValidAnswer(answers[currentIndex])) setShowFinalCta(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const isValidAnswer = (answer) => {
        if (Array.isArray(answer)) return answer.length > 0;
        return typeof answer === 'string' && answer.trim().length > 0;
    };

    const handleFinalSubmit = () => {
        const formattedAnswers = questions.map((q, idx) => ({
            question: typeof q === 'string' ? q : q.text,
            answer: Array.isArray(answers[idx]) ? answers[idx].join(', ') : answers[idx]
        }));
        onComplete(formattedAnswers);
    };

    if (!questions || questions.length === 0) return null;

    const questionText = typeof currentQuestion === 'string' ? currentQuestion : currentQuestion.text;
    const isLocationQuestion = (questionText.toLowerCase().includes('focusing') ||
        questionText.toLowerCase().includes('location') ||
        questionText.toLowerCase().includes('situated') ||
        questionText.toLowerCase().includes('country') ||
        questionText.toLowerCase().includes('city')) &&
        !questionText.toLowerCase().includes('money');

    const options = currentQuestion.options || ["Option 1", "Option 2", "Option 3"];
    const currentAnswer = answers[currentIndex];
    const hasValidAnswer = isValidAnswer(currentAnswer);

    const [locationData, setLocationData] = useState({ country: '', state: '', district: '' });

    useEffect(() => {
        if (isLocationQuestion && typeof currentAnswer === 'string' && currentAnswer.includes(',')) {
            const parts = currentAnswer.split(',').map(p => p.trim());
            setLocationData({
                country: parts[0] || '',
                state: parts[1] || '',
                district: parts[2] || ''
            });
        }
    }, [currentIndex, isLocationQuestion]);

    const handleLocationChange = (field, value) => {
        const newData = { ...locationData, [field]: value };
        setLocationData(newData);
        const combined = `${newData.country}, ${newData.state}, ${newData.district}`.replace(/^[ ,]+|[ ,]+$/g, '');
        handleManualSubmit(combined);
    };

    return (
        <div className="w-full h-full flex overflow-hidden bg-white">
            {/* Left Panel - Questions (3/5 = 60%) */}
            <div className="w-full md:w-[60%] h-full flex flex-col relative border-r border-slate-100">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                            Discovery Phase {currentIndex + 1} / {questions.length}
                        </span>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg px-3 py-1 border border-blue-100/50 flex items-center gap-2">
                        <Lock size={10} className="text-[#0066CC]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#0066CC]">Ideas are encrypted & safe</span>
                    </div>
                </div>

                {/* Content - Vertically Centered */}
                <div className="flex-1 overflow-y-auto px-8 md:px-16 pb-32 custom-scrollbar flex flex-col items-center justify-center relative">
                    {/* Subtle Background Glow & Scan line effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                        <div className="w-full h-[1px] bg-[#0066CC] animate-[scan_4s_linear_infinite]"></div>
                    </div>


                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-xl mx-auto w-full"
                        >
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight mb-8">
                                {typeof currentQuestion === 'string' ? currentQuestion : currentQuestion.text}
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {isLocationQuestion ? (
                                    <>
                                        {/* Specialized Location Inputs */}
                                        <div className="bg-white border-2 border-slate-100 rounded-xl p-4 flex flex-col gap-1 focus-within:border-[#0066CC] transition-colors">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Country</span>
                                            <input
                                                type="text"
                                                value={locationData.country}
                                                onChange={(e) => handleLocationChange('country', e.target.value)}
                                                placeholder="e.g. USA"
                                                className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                            />
                                        </div>
                                        <div className="bg-white border-2 border-slate-100 rounded-xl p-4 flex flex-col gap-1 focus-within:border-[#0066CC] transition-colors">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">State / Region</span>
                                            <input
                                                type="text"
                                                value={locationData.state}
                                                onChange={(e) => handleLocationChange('state', e.target.value)}
                                                placeholder="e.g. California"
                                                className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                            />
                                        </div>
                                        <div className="bg-white border-2 border-slate-100 rounded-xl p-4 flex flex-col gap-1 focus-within:border-[#0066CC] transition-colors">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">District / City</span>
                                            <input
                                                type="text"
                                                value={locationData.district}
                                                onChange={(e) => handleLocationChange('district', e.target.value)}
                                                placeholder="e.g. San Francisco"
                                                className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300 w-full"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleManualSubmit("Globally");
                                                setLocationData({ country: '', state: '', district: '' });
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
                                                    <span className="text-xs font-bold uppercase tracking-wider">
                                                        {option}
                                                    </span>
                                                </button>
                                            );
                                        })}

                                        {/* Inline Manual Input - Integrated as a grid item */}
                                        <div className="h-full">
                                            {isManual ? (
                                                <textarea
                                                    value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                                                    onChange={(e) => handleManualSubmit(e.target.value)}
                                                    placeholder="Specify your own answer..."
                                                    className="w-full h-full min-h-[58px] p-4 rounded-xl bg-white border-2 border-[#0066CC] text-xs font-bold uppercase tracking-wider text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
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
                </div>

                {/* Footer Navigation */}
                <div className="absolute bottom-0 left-0 w-full px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                    <button
                        onClick={currentIndex === 0 ? onBack : handlePrev}
                        className="group flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-400 hover:text-slate-900 bg-transparent hover:bg-slate-50 rounded-xl uppercase tracking-widest transition-all"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {currentIndex === 0 ? 'Exit' : 'Previous'}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!hasValidAnswer || isReadonly}
                        className={`
                            group flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest shadow-lg
                            ${hasValidAnswer && !isReadonly
                                ? 'bg-[#0066CC] text-white hover:bg-[#0052a3] shadow-blue-500/20 active:scale-95'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                            }
                        `}
                    >
                        {isLastStep ? 'Finalize' : 'Continue'}
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Right Panel - Illustration (2/5 = 40%) */}
            <div className="hidden md:flex md:w-[40%] h-full bg-[#FAFBFF] items-center justify-center p-0 overflow-hidden relative border-none">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0066CC_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative z-10 w-full h-full">
                    <img
                        src="/bauhaus_last_gen.png"
                        alt="Strategic Bauhaus Geometry"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=2070&auto=format&fit=crop';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center w-full px-12 z-20">
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md tracking-tight">Intelligence Synthesis</h3>
                    <p className="text-white/90 text-xs font-medium max-w-xs mx-auto leading-relaxed drop-shadow-sm">
                        Data signals are being processed to construct your market entry protocol. Each answer refines the tactical roadmap.
                    </p>
                </div>
            </div>

            {/* Final CTA Overlay */}
            <AnimatePresence>
                {showFinalCta && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0066CC] to-blue-400"></div>

                            <div className="w-16 h-16 bg-blue-50 text-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-8">
                                <Wand2 size={28} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Intelligence Synthesis Ready</h3>
                            <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-xs mx-auto">
                                We've captured your strategic context. The analysis engine is primed to generate your execution protocol.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleFinalSubmit}
                                    className="w-full py-4 bg-[#0066CC] text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 hover:bg-[#0052a3] transition-all text-[10px] uppercase tracking-widest"
                                >
                                    GENERATE PROTOCOL REPORT
                                </button>
                                <button
                                    onClick={() => setShowFinalCta(false)}
                                    className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-[10px] uppercase tracking-widest"
                                >
                                    REVIEW INPUTS
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
