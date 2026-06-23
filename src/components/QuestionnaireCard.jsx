import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const QuestionnaireCard = ({ questions, initialAnswers = [], onSubmit, onDeclineOnboarding }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(initialAnswers);
    const [customText, setCustomText] = useState("");
    const slideRefs = useRef([]);
    const [sliderHeight, setSliderHeight] = useState('auto');

    useEffect(() => {
        if (answers.length === 0 && questions.length > 0) {
            setAnswers(new Array(questions.length).fill(null));
        }
    }, [questions]);

    useEffect(() => {
        slideRefs.current = [];
    }, [questions]);

    useEffect(() => {
        const activeSlide = slideRefs.current[currentIndex];
        if (activeSlide) {
            const handleUpdateHeight = () => {
                setSliderHeight(activeSlide.scrollHeight || activeSlide.offsetHeight);
            };
            handleUpdateHeight();

            if (typeof ResizeObserver !== 'undefined') {
                const observer = new ResizeObserver(handleUpdateHeight);
                observer.observe(activeSlide);
                return () => observer.disconnect();
            }
        }
    }, [currentIndex, questions, answers]);

    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        if (currentQuestion && answers[currentIndex]) {
            const ansObj = answers[currentIndex];
            const optionTexts = currentQuestion.options.map(opt => typeof opt === 'object' ? opt.text : opt);
            if (!optionTexts.includes(ansObj.answer)) {
                setCustomText(ansObj.answer);
                return;
            }
        }
        setCustomText("");
    }, [currentIndex, currentQuestion, answers]);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSelectOption = (optText) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex] = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            answer: optText
        };
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 800);
        }
    };

    const handleCustomSave = () => {
        if (!customText.trim()) return;
        const newAnswers = [...answers];
        newAnswers[currentIndex] = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            answer: customText.trim()
        };
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const allAnswered = answers.length === questions.length && answers.every(a => a !== null);

    if (!currentQuestion) return null;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-black/5 border border-[#E4E4E7] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full overflow-hidden flex flex-col">
                <div className="p-3 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <button onClick={handlePrev} disabled={currentIndex === 0} className="hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer">
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-[11px] font-semibold tracking-wider text-zinc-500">{currentIndex + 1}/{questions.length}</span>
                        <button onClick={handleNext} disabled={currentIndex === questions.length - 1} className="hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer">
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Progress dots/bars */}
                    <div className="flex items-center gap-1">
                        {questions.map((_, qIdx) => {
                            const isAnswered = answers[qIdx] !== null;
                            const isActive = qIdx === currentIndex;
                            return (
                                <div
                                    key={qIdx}
                                    className={`h-1 rounded-full transition-all duration-300 ${isActive
                                        ? 'w-3.5 bg-[#18181B]'
                                        : (isAnswered ? 'w-1 bg-[#71717A]' : 'w-1 bg-[#D4D4D8]')
                                        }`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Horizontal slider container */}
                <div
                    className="w-full overflow-hidden transition-[height] duration-300 ease-out"
                    style={{ height: typeof sliderHeight === 'number' ? `${sliderHeight}px` : 'auto' }}
                >
                    <div
                        className="flex transition-transform duration-300 ease-out items-start"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {questions.map((q, qIdx) => {
                            const qAnswer = answers[qIdx];
                            return (
                                <div
                                    key={qIdx}
                                    ref={el => { slideRefs.current[qIdx] = el; }}
                                    className="w-full flex-shrink-0 p-3.5 pb-2.5"
                                >
                                    <h4 className="text-[#18181B] font-semibold text-[13.5px] leading-snug mb-3">
                                        {q.text}
                                    </h4>

                                    <div className="space-y-2">
                                        {(() => {
                                            const sortedOptions = [...q.options].sort((a, b) => {
                                                const aText = typeof a === 'object' ? a.text : a;
                                                const bText = typeof b === 'object' ? b.text : b;
                                                const isARec = q.recommendedOption && q.recommendedOption.trim().toLowerCase() === aText.trim().toLowerCase();
                                                const isBRec = q.recommendedOption && q.recommendedOption.trim().toLowerCase() === bText.trim().toLowerCase();
                                                if (isARec && !isBRec) return -1;
                                                if (!isARec && isBRec) return 1;
                                                return 0;
                                            });
                                            return sortedOptions.map((opt, optIdx) => {
                                                const optText = typeof opt === 'object' ? opt.text : opt;
                                                const optExplanation = typeof opt === 'object' ? opt.explanation : null;
                                                const isSelected = qAnswer?.answer === optText;
                                                const isRecommended = q.recommendedOption &&
                                                    q.recommendedOption.trim().toLowerCase() === optText.trim().toLowerCase();
                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleSelectOption(optText)}
                                                        className={`w-full flex flex-col items-start gap-1 px-2.5 py-2 text-[12.5px] rounded-xl transition-all cursor-pointer border relative ${isRecommended ? 'mt-2.5' : ''} ${isSelected
                                                            ? 'bg-[#18181B] border-[#18181B] text-white font-medium shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),_0_4px_12px_rgba(24,24,27,0.3)]'
                                                            : 'bg-white border-[#E4E4E7] text-zinc-700 hover:text-[#18181B] hover:bg-zinc-50 hover:border-zinc-300 shadow-sm'
                                                            }`}
                                                    >
                                                        {isRecommended && (
                                                            <span
                                                                className="absolute top-0 right-3.5 -translate-y-1/2 text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border z-10 transition-all"
                                                                style={
                                                                    isSelected
                                                                        ? { backgroundColor: '#1e40af', color: '#93c5fd', borderColor: '#3b82f6' }
                                                                        : { backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#2563eb', borderColor: 'rgba(59, 130, 246, 0.15)' }
                                                                }
                                                            >
                                                                Recommended
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-2 w-full">
                                                            <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white text-[#18181B]' : 'border-zinc-300 bg-transparent'
                                                                }`}>
                                                                {isSelected && (
                                                                    <div className="w-1 h-1 rounded-full bg-[#18181B]" />
                                                                )}
                                                            </div>
                                                            <span className="text-left font-medium leading-tight text-[12.5px]">{optText}</span>
                                                        </div>
                                                        {optExplanation && (
                                                            <span className={`text-[10.5px] text-left leading-normal pl-[22px] transition-colors ${isSelected ? 'text-zinc-400' : 'text-zinc-500'
                                                                }`}>
                                                                ({optExplanation})
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-2.5 pt-0">
                    <div className="border border-[#E4E4E7] rounded-xl bg-white p-2 flex flex-col min-h-[60px] justify-between shadow-[inset_0px_5px_10px_rgba(0,0,0,0.03),_0px_1px_2px_rgba(0,0,0,0.01)] transition-all duration-200 focus-within:border-zinc-400">
                        <textarea
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Or write custom response here..."
                            className="w-full bg-transparent border-none p-0 text-[12px] text-[#303030] placeholder:text-zinc-400 focus:ring-0 focus:outline-none resize-none flex-1 min-h-[22px] custom-scrollbar"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCustomSave();
                                }
                            }}
                        />
                        <div className="flex items-center justify-end mt-0.5">
                            {allAnswered ? (
                                <button
                                    onClick={() => onSubmit(answers)}
                                    className="px-3 py-1 rounded-lg text-[12px] font-semibold bg-[#18181B] text-white hover:bg-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),_0_4px_12px_rgba(24,24,27,0.3)] transition-all cursor-pointer"
                                >
                                    Submit All
                                </button>
                            ) : (
                                <button
                                    onClick={handleCustomSave}
                                    disabled={!customText.trim()}
                                    className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center disabled:opacity-40 cursor-pointer ${customText.trim()
                                        ? 'bg-[#303030] text-white hover:bg-[#262626]'
                                        : 'bg-[#E4E4E7] text-zinc-500'
                                        }`}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-2.5 pb-2.5 pt-0 flex items-center justify-between text-[11px] gap-2">
                    <button
                        onClick={onDeclineOnboarding}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 hover:bg-zinc-300 border border-transparent font-semibold transition-all cursor-pointer flex-1 text-center"
                    >
                        Decline onboarding
                    </button>
                    <button
                        onClick={() => {
                            const newAnswers = [...answers];
                            newAnswers[currentIndex] = {
                                questionId: currentQuestion.id,
                                questionText: currentQuestion.text,
                                answer: "Skipped"
                            };
                            setAnswers(newAnswers);
                            if (currentIndex < questions.length - 1) {
                                setTimeout(() => {
                                    handleNext();
                                }, 300);
                            }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 hover:bg-zinc-300 border border-transparent font-semibold transition-all cursor-pointer flex-1 text-center"
                    >
                        Decline this question
                    </button>
                </div>
            </div>
        </div>
    );
};
