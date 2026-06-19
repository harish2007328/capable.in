import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStorage } from '../services/projectStorage';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import { LogoIcon } from '../components/Logo';
import { Plus, Bot, ArrowRight, Search, Moon, Sun, Home, LogOut, CreditCard, ChevronDown, ChevronLeft, ChevronRight, X, GitCommit, PenLine, Copy, CornerUpLeft, Sparkles, ShieldCheck, Compass, Layers, MessageSquare, Users, Globe, PhoneCall, Award } from 'lucide-react';
import { generateGreeting, generateOnboardingQuestions, mentorChat, generateSummary, generateValidationReport, generate6DayRoadmap } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';



const ThinkingBubble = ({ text = "Thinking..." }) => {
    const [seconds, setSeconds] = useState("0.0");

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            setSeconds(elapsed.toFixed(1));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col w-full px-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 mb-1.5">
                <LogoIcon className="w-[15px] h-[15px]" style={{ filter: "brightness(0)", opacity: 0.7 }} />
                <span className="text-[#737373] text-[12px] font-medium">Capable</span>
                <span className="text-[#A3A3A3] text-[12px] font-medium">•</span>
                <span className="text-[#737373] text-[12px] font-medium">
                    <span className="animate-shine">{text} ({seconds}s)</span>
                </span>
            </div>
        </div>
    );
};

const RunningToolText = ({ content }) => {
    const [seconds, setSeconds] = useState("0.0");

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            setSeconds(elapsed.toFixed(1));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return <span className="animate-shine font-medium text-[13px]">Running Tool: {content} ({seconds}s)</span>;
};

const parseThinkingContent = (content) => {
    if (!content) return { thinking: "", cleanText: "", isUnclosed: false };
    const thinkStart = content.search(/<think>/i);
    if (thinkStart !== -1) {
        const thinkEnd = content.search(/<\/think>/i);
        if (thinkEnd !== -1) {
            const thinking = content.substring(thinkStart + 7, thinkEnd).trim();
            const cleanText = (content.substring(0, thinkStart) + content.substring(thinkEnd + 8)).trim();
            return { thinking, cleanText, isUnclosed: false };
        } else {
            const thinking = content.substring(thinkStart + 7).trim();
            const cleanText = content.substring(0, thinkStart).trim();
            return { thinking, cleanText, isUnclosed: true };
        }
    }
    return { thinking: "", cleanText: content, isUnclosed: false };
};

const parseAnswersFromText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const answers = [];

    // Check if the text contains the arrow character '↳'
    const hasArrow = text.includes('↳');

    if (hasArrow) {
        let currentQuestion = null;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                // It's a question line. Extract the full question text.
                let qText = trimmed.replace(/^[•\-\*\s]+/, '').trim();
                // Strip wrapping asterisks
                qText = qText.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
                currentQuestion = qText;
            } else if (trimmed.startsWith('↳') && currentQuestion) {
                let aText = trimmed.replace(/^↳/, '').trim();
                aText = aText.replace(/^\*+/, '').replace(/\*+$/, '').trim();
                answers.push({
                    questionText: currentQuestion,
                    answer: aText
                });
                currentQuestion = null;
            }
        }
    } else {
        // Fallback or legacy format parsing
        let currentQuestion = null;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Try single-line format first: e.g. "- **Question Text**: Answer Text"
            // Make sure we only match if there is a colon and it's not a question line followed by a separate answer line
            const singleLineMatch = trimmed.match(/^[•\-\*\s]+(?:\*\*)?(.*?)(?:\*\*)?\s*:\s*(.*)$/);
            if (singleLineMatch) {
                const q = singleLineMatch[1].replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
                const a = singleLineMatch[2].trim();
                if (q && a && !a.startsWith('↳')) {
                    answers.push({ questionText: q, answer: a });
                    continue;
                }
            }

            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                let qText = trimmed.replace(/^[•\-\s\*]+/, '').trim();
                qText = qText.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/\*\*:/, '').trim();
                currentQuestion = qText;
            } else if ((trimmed.startsWith('Answer:') || trimmed.startsWith('Answer is:')) && currentQuestion) {
                let aText = trimmed.replace(/^(Answer:|Answer is:)/, '').trim();
                aText = aText.replace(/^\*+/, '').replace(/\*+$/, '').trim();
                answers.push({
                    questionText: currentQuestion,
                    answer: aText
                });
                currentQuestion = null;
            } else if (currentQuestion && trimmed.length > 0) {
                answers.push({
                    questionText: currentQuestion,
                    answer: trimmed
                });
                currentQuestion = null;
            }
        }
    }

    return answers.length > 0 ? answers : null;
};

const TypingText = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const onCompleteRef = useRef(onComplete);

    // Keep the callback ref up-to-date
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const words = text ? text.split(/\s+/) : [];
        if (words.length === 0) {
            if (onCompleteRef.current) onCompleteRef.current();
            return;
        }

        setDisplayedText(words[0]);
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex += 1;
            if (currentIndex < words.length) {
                setDisplayedText(prev => prev + " " + words[currentIndex]);
            } else {
                clearInterval(interval);
                if (onCompleteRef.current) onCompleteRef.current();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
};

const QuestionnaireCard = ({ questions, initialAnswers = [], onSubmit, onDeclineOnboarding }) => {
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

const generateFallbackValidationReport = (title) => {
    return {
        overview: {
            elevator_pitch: `A specialized service that makes it extremely simple to launch and validate a ${title} business.`,
            problem: `Many founders struggle to test the real-world demand for ${title} before spending thousands on building a product.`,
            solution: `Capable provides automated validation agents, roadmap engines, and custom user workspaces to fast-track testing.`,
            target_users: [
                { segment: "Early stage founders", description: "Aspiring entrepreneurs looking to validate their new idea." },
                { segment: "Product managers", description: "Corporate innovation teams testing new feature concepts." }
            ],
            why_now: `The barrier to entry for building software is lower than ever, making rapid market validation the ultimate competitive advantage.`
        },
        market: {
            market_size: `An estimated 300,000+ new startup concepts are drafted monthly, representing a massive addressable user base.`,
            growth_signals: [
                "Increased focus on capital-efficient building and bootstrapping.",
                "Surge in early-stage validation tools and micro-SaaS interest."
            ],
            competitors: [
                { name: "Traditional incubators", what_they_do: "Slow, manual mentorship cohorts.", weakness: "Expensive and non-scalable." },
                { name: "Landing page builders", what_they_do: "Quick site creation.", weakness: "Doesn't offer strategic AI validation or task guidance." }
            ],
            unique_edge: `Capable offers an integrated co-founder agent workspace that combines market intelligence, strategic reports, and roadmaps.`
        },
        execution: {
            how_it_works: [
                { step: 1, action: "Founder inputs basic venture idea details" },
                { step: 2, action: "Capable clarifies scope via structured questions" },
                { step: 3, action: "Capable structures custom validation roadmap" },
                { step: 4, action: "Founder runs the 6-day validation timeline" }
            ],
            business_model: "Subscription-based freemium SaaS model with custom add-ons.",
            revenue_streams: ["Standard monthly tier", "Premium custom agency tier"],
            feasibility: "Highly feasible, utilizing robust API integrations and clean component structures.",
            est_mvp_cost: "$500 - $1,500",
            est_timeline: "1-2 weeks"
        },
        reality: {
            risks: [
                { category: "Market Risk", description: "Users might prefer manual consulting over AI co-founders.", severity: "Medium" },
                { category: "Feasibility Risk", description: "API latency might slow down report generation.", severity: "Low" }
            ],
            open_questions: [
                "Will users pay for validation reports?",
                "What is the average retention of founders on Capable?",
                "Can we scrape competition data with 100% accuracy?"
            ],
            validation_plan: [
                { step: 1, action: "Create a simple landing page explaining Capable." },
                { step: 2, action: "Drive 100 targeted visitors to the page via posts." },
                { step: 3, action: "Collect at least 15 waitlist signups." }
            ]
        }
    };
};

const generateFallback6DayRoadmap = (title) => {
    return {
        title: "6-Day Validation Sprint",
        days: [
            {
                day: 1,
                title: "Audience Definition",
                objective: "Identify and document the exact profiles of your first 10 core customers.",
                tasks: [
                    { id: "d1-t1", text: "Write down 3 customer personas for your product.", completed: false },
                    { id: "d1-t2", text: "Find 2 online communities where these personas gather.", completed: false },
                    { id: "d1-t3", text: "Draft a 100-word introduction post for feedback.", completed: false }
                ]
            },
            {
                day: 2,
                title: "Value Proposition",
                objective: "Refine your unique sales hook and competitive advantage.",
                tasks: [
                    { id: "d2-t1", text: "Compare your offer to 3 close competitors.", completed: false },
                    { id: "d2-t2", text: "Draft a clean headline and 3 core value bullet points.", completed: false },
                    { id: "d2-t3", text: "Choose a primary color scheme and visual layout.", completed: false }
                ]
            },
            {
                day: 3,
                title: "Landing Page Pitch",
                objective: "Deploy a simple validation landing page with a waitlist form.",
                tasks: [
                    { id: "d3-t1", text: "Setup a clean landing page project structure.", completed: false },
                    { id: "d3-t2", text: "Add an input field for capturing emails.", completed: false },
                    { id: "d3-t3", text: "Verify that form submissions save correctly to your database.", completed: false }
                ]
            },
            {
                day: 4,
                title: "Traffic Generation",
                objective: "Drive initial organic visitors to your validation page.",
                tasks: [
                    { id: "d4-t1", text: "Share your product hook in 2 target communities.", completed: false },
                    { id: "d4-t2", text: "Message 5 potential users directly on social channels.", completed: false },
                    { id: "d4-t3", text: "Monitor visitor analytics and scroll rates.", completed: false }
                ]
            },
            {
                day: 5,
                title: "Feedback Interviews",
                objective: "Talk to early signups to gather product critiques.",
                tasks: [
                    { id: "d5-t1", text: "Send a friendly follow-up email to all signups.", completed: false },
                    { id: "d5-t2", text: "Schedule 3 brief feedback calls.", completed: false },
                    { id: "d5-t3", text: "Log key feature requests and user concerns.", completed: false }
                ]
            },
            {
                day: 6,
                title: "Validation Review",
                objective: "Analyze conversion rates and make a pivot or proceed decision.",
                tasks: [
                    { id: "d6-t1", text: "Calculate waitlist conversion percentage (signups/visitors).", completed: false },
                    { id: "d6-t2", text: "Summarize top 3 validation blockers.", completed: false },
                    { id: "d6-t3", text: "Determine the go/no-go choice for full MVP build.", completed: false }
                ]
            }
        ]
    };
};

const getRoadmapCoords = (totalDays = 6, centerY = 600) => {
    const coords = [];
    const L = Math.ceil(totalDays / 2); // Days on Left
    const R = totalDays - L;            // Days on Right
    
    for (let day = 1; day <= totalDays; day++) {
        if (day <= L) {
            const idx = day - 1;
            const y = centerY + (idx - (L - 1) / 2) * 350;
            coords.push({ x: 450, y });
        } else {
            const idx = day - L - 1;
            const y = centerY + (idx - (R - 1) / 2) * 350;
            coords.push({ x: 950, y });
        }
    }
    return coords;
};

const calculateTaskLayout = (tasks = [], dayY, taskHeights = {}) => {
    const GAP = 14; // constant spacing of 14px between cards
    const N = tasks.length;
    if (N === 0) return [];
    
    const heights = tasks.map(task => {
        const measured = taskHeights[task.id];
        if (measured) return measured;
        
        const text = task.text || "";
        const charCount = text.length;
        const lineCount = Math.max(1, Math.ceil(charCount / 26));
        return Math.max(44, 22 + lineCount * 15);
    });
    
    const coords = new Array(N);
    const M = Math.floor((N - 1) / 2); // Middle task index
    
    // Set middle task centered at dayY
    coords[M] = { taskY: dayY, height: heights[M] };
    
    // Lay out tasks above middle task (going up)
    for (let i = M - 1; i >= 0; i--) {
        const prev = coords[i + 1];
        const taskY = prev.taskY - prev.height / 2 - GAP - heights[i] / 2;
        coords[i] = { taskY, height: heights[i] };
    }
    
    // Lay out tasks below middle task (going down)
    for (let i = M + 1; i < N; i++) {
        const prev = coords[i - 1];
        const taskY = prev.taskY + prev.height / 2 + GAP + heights[i] / 2;
        coords[i] = { taskY, height: heights[i] };
    }
    
    return coords;
};


const VenturePage = () => {
    const MCQ_LETTERS = ['A', 'B', 'C', 'D'];
    const renderFormattedText = (text) => {
        if (!text) return null;
        return text.split(/\n\n+/).map((para, idx) => (
            <div key={idx} className="mb-2.5 last:mb-0 whitespace-pre-line">
                {para}
            </div>
        ));
    };
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [aiResponding, setAiResponding] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('ur-space');
    const [avatarError, setAvatarError] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const messagesEndRef = useRef(null);

    const [onboardingState, setOnboardingState] = useState('none');
    const [onboardingQuestions, setOnboardingQuestions] = useState([]);
    const [onboardingAnswers, setOnboardingAnswers] = useState([]);
    const [expandedAnswers, setExpandedAnswers] = useState({});

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const [isValidating, setIsValidating] = useState(false);
    const [validationSeconds, setValidationSeconds] = useState(0);
    const [validatorTab, setValidatorTab] = useState('overview');
    const [activeRightTab, setActiveRightTab] = useState('chat');
    const [selectedDay, setSelectedDay] = useState(1);
    const [focusDayNum, setFocusDayNum] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isCentered, setIsCentered] = useState(false);
    const zoomScaleRef = useRef(1.1);
    const panOffsetRef = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const mouseDownPos = useRef({ x: 0, y: 0 });
    const canvasViewportRef = useRef(null);
    const canvasRef = useRef(null);
    const hasAutoSelectedRef = useRef(false);
    const hasInitialCenteredRef = useRef(false);

    const [taskHeights, setTaskHeights] = useState({});
    const days = project?.data?.roadmap?.days || [];
    const totalDays = days.length || 6;
    const canvasHeight = Math.max(1200, 100 + Math.ceil(totalDays / 2) * 350);
    const centerY = canvasHeight / 2;
    const roadmapCoords = getRoadmapCoords(totalDays, centerY);

    const measureTaskRef = (taskId) => (el) => {
        if (el) {
            const h = el.offsetHeight;
            if (h > 0 && taskHeights[taskId] !== h) {
                setTaskHeights(prev => {
                    if (prev[taskId] === h) return prev;
                    return { ...prev, [taskId]: h };
                });
            }
        }
    };

    useEffect(() => {
        hasAutoSelectedRef.current = false;
        hasInitialCenteredRef.current = false;
        setTaskHeights({});
    }, [projectId]);

    useEffect(() => {
        if (activeTab !== 'navigator') {
            setIsCentered(false);
            return;
        }

        const viewport = canvasViewportRef.current;
        if (!viewport) return;

        const days = project?.data?.roadmap?.days || [];
        const N = days.length;
        const initialScale = 0.9;

        if (N > 0 && !hasInitialCenteredRef.current) {
            const rect = viewport.getBoundingClientRect();
            
            // Center on the active day card initially
            const targetDay = focusDayNum || 1;
            const idx = targetDay - 1;

            const activeCoord = roadmapCoords[idx] || { x: 700, y: centerY };

            const viewportCenterX = rect.width / 2;
            const viewportCenterY = rect.height / 2;

            const initialX = viewportCenterX - activeCoord.x * initialScale;
            const initialY = viewportCenterY - activeCoord.y * initialScale;

            panOffsetRef.current = { x: initialX, y: initialY };
            zoomScaleRef.current = initialScale;

            if (canvasRef.current) {
                canvasRef.current.style.transform = `translate(${initialX}px, ${initialY}px) scale(${initialScale})`;
            }
            setIsCentered(true);
            hasInitialCenteredRef.current = true;
        } else if (N > 0) {
            setIsCentered(true);
        } else {
            const rect = viewport.getBoundingClientRect();
            const canvasWidth = 1400;
            const initialX = (rect.width - canvasWidth * initialScale) / 2;
            const initialY = (rect.height - canvasHeight * initialScale) / 2;
            panOffsetRef.current = { x: initialX, y: initialY };
            zoomScaleRef.current = initialScale;

            if (canvasRef.current) {
                canvasRef.current.style.transform = `translate(${initialX}px, ${initialY}px) scale(${initialScale})`;
            }
            setIsCentered(true);
        }

        const handleWheel = (e) => {
            e.preventDefault();

            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (e.ctrlKey) {
                // Pinch zoom (centered on cursor)
                let delta = -e.deltaY;
                const maxDelta = 120;
                if (delta > maxDelta) delta = maxDelta;
                if (delta < -maxDelta) delta = -maxDelta;

                const zoomFactor = Math.exp(delta * 0.0015);
                const oldScale = zoomScaleRef.current;
                let newScale = oldScale * zoomFactor;
                newScale = Math.min(Math.max(newScale, 0.4), 3.0);

                const tx = mouseX - (mouseX - panOffsetRef.current.x) * (newScale / oldScale);
                const ty = mouseY - (mouseY - panOffsetRef.current.y) * (newScale / oldScale);

                zoomScaleRef.current = newScale;
                panOffsetRef.current = { x: tx, y: ty };
            } else {
                // Two-finger swipe / scroll pan
                panOffsetRef.current.x -= e.deltaX;
                panOffsetRef.current.y -= e.deltaY;
            }

            if (canvasRef.current) {
                canvasRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${zoomScaleRef.current})`;
            }
        };

        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            viewport.removeEventListener('wheel', handleWheel);
        };
    }, [activeTab, project?.data?.roadmap]);

    const centerOnDayNode = (dayNum, targetScale = 0.9) => {
        const viewport = canvasViewportRef.current;
        if (!viewport || !canvasRef.current || !project?.data?.roadmap?.days) return;

        const days = project.data.roadmap.days;
        const N = days.length;
        if (N === 0) return;

        const idx = dayNum - 1;
        const activeCoord = ROADMAP_COORDS[idx] || { x: 700, y: 600 };

        const rect = viewport.getBoundingClientRect();
        const viewportCenterX = rect.width / 2;
        const viewportCenterY = rect.height / 2;

        const targetX = viewportCenterX - activeCoord.x * targetScale;
        const targetY = viewportCenterY - activeCoord.y * targetScale;

        // Apply smooth transition temporarily
        canvasRef.current.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        zoomScaleRef.current = targetScale;
        panOffsetRef.current = { x: targetX, y: targetY };
        canvasRef.current.style.transform = `translate(${targetX}px, ${targetY}px) scale(${targetScale})`;

        setTimeout(() => {
            if (canvasRef.current) {
                canvasRef.current.style.transition = '';
            }
        }, 600);
    };

    const handleMouseDown = (e) => {
        // Prevent dragging if clicking elements inside cards
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
            return;
        }
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - panOffsetRef.current.x,
            y: e.clientY - panOffsetRef.current.y
        };
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        panOffsetRef.current = { x: dx, y: dy };

        if (canvasRef.current) {
            canvasRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(${zoomScaleRef.current})`;
        }
    };

    const handleMouseUpOrLeave = (e) => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const isReportValidated = !!project?.data?.roadmap;

    const getUserInitials = () => {
        if (user?.profile?.name) {
            const parts = user.profile.name.split(' ');
            if (parts.length > 1) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0].substring(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'HS';
    };

    const handleAnimationComplete = (index) => {
        setMessages(prev => prev.map((m, idx) => idx === index ? { ...m, isNew: false } : m));
    };

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                navigate('/');
                return;
            }
            try {
                const p = await ProjectStorage.getById(projectId);
                if (!p) {
                    navigate('/');
                    return;
                }
                setProject(p);
                if (p.data?.roadmap) {
                    setActiveTab('navigator');
                    const days = p.data.roadmap.days || [];
                    if (days.length > 0) {
                        const firstUncompletedDay = days.find(d => d.tasks?.some(t => !t.completed));
                        const targetDay = firstUncompletedDay ? firstUncompletedDay.day : 1;
                        setSelectedDay(targetDay);
                        setFocusDayNum(targetDay);
                        hasAutoSelectedRef.current = true;
                    }
                }
                // Load existing chats if any
                if (p.data?.chats) {
                    setMessages(p.data.chats.map(m => ({ ...m, isNew: false })));
                    if (p.data?.onboardingState) {
                        setOnboardingState(p.data.onboardingState);
                        if (p.data?.onboardingQuestions) {
                            setOnboardingQuestions(p.data.onboardingQuestions);
                        }
                        if (p.data?.ideaAnswers) {
                            setOnboardingAnswers(p.data.ideaAnswers);
                        }
                    } else {
                        // Fallback for older projects
                        if (p.data?.ideaAnswers) {
                            setOnboardingState('completed');
                            setOnboardingAnswers(p.data.ideaAnswers);
                        } else if (p.data.chats.length > 0) {
                            setOnboardingState('completed');
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load project details:", err);
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [projectId, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (hasAutoSelectedRef.current) return;
        const days = project?.data?.roadmap?.days || [];
        if (days.length > 0) {
            const firstUncompletedDay = days.find(d => d.tasks?.some(t => !t.completed));
            if (firstUncompletedDay) {
                setSelectedDay(firstUncompletedDay.day);
                setFocusDayNum(firstUncompletedDay.day);
            } else {
                setSelectedDay(1);
                setFocusDayNum(1);
            }
            hasAutoSelectedRef.current = true;
        }
    }, [project?.data?.roadmap]);

    useEffect(() => {
        let interval;
        if (isValidating) {
            setValidationSeconds(0);
            interval = setInterval(() => {
                setValidationSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isValidating]);



    const handleToggleRoadmapTask = async (dayNum, taskId) => {
        if (!project?.data?.roadmap) return;
        const updatedDays = project.data.roadmap.days.map(day => {
            if (day.day === dayNum) {
                return {
                    ...day,
                    tasks: day.tasks.map(task => {
                        if (task.id === taskId) {
                            return { ...task, completed: !task.completed };
                        }
                        return task;
                    })
                };
            }
            return day;
        });

        const updatedRoadmap = {
            ...project.data.roadmap,
            days: updatedDays
        };

        setProject(prev => ({
            ...prev,
            data: {
                ...prev.data,
                roadmap: updatedRoadmap
            }
        }));

        await ProjectStorage.updateData(projectId, {
            roadmap: updatedRoadmap
        }).catch(console.error);

        // Check if all tasks of the day are completed for auto-progression
        const completedDayData = updatedDays.find(d => d.day === dayNum);
        if (completedDayData && completedDayData.tasks && completedDayData.tasks.every(t => t.completed)) {
            const nextDayNum = dayNum + 1;
            const hasNextDay = updatedDays.some(d => d.day === nextDayNum);
            if (hasNextDay) {
                setTimeout(() => {
                    // Check if they haven't unchecked anything in the meantime
                    setProject(currentProject => {
                        const currentRoadmap = currentProject?.data?.roadmap;
                        if (!currentRoadmap) return currentProject;
                        const targetDay = currentRoadmap.days.find(d => d.day === dayNum);
                        const isStillComplete = targetDay && targetDay.tasks && targetDay.tasks.every(t => t.completed);
                        if (isStillComplete) {
                            setSelectedDay(nextDayNum);
                            setFocusDayNum(nextDayNum);
                            centerOnDayNode(nextDayNum, 0.9);
                        }
                        return currentProject;
                    });
                }, 800);
            }
        }
    };

    const handleBrainstormRoadmap = (dayNum, title, objective) => {
        setActiveTab('navigator');
        setActiveRightTab('chat');
        setInputValue(`I'd like to brainstorm Day ${dayNum} of our Validation Sprint: "${title}". The objective is "${objective}". How do we execute the tasks for today?`);
        // Find input box and focus
        setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    };


    const handleQuestionnaireSubmit = async (finalAnswers) => {
        setOnboardingAnswers(finalAnswers);

        // Format user's answers as a list in the message content
        const answersPreviewText = `Here is a summary of my answers:\n\n` + finalAnswers.map((ans, idx) => {
            return `• ${ans.questionText}\n  ↳ ${ans.answer}`;
        }).join('\n\n');

        const newMessages = [
            ...messages,
            {
                role: 'user',
                content: answersPreviewText,
                isAnswersPreview: true,
                answers: finalAnswers
            }
        ];
        setMessages(newMessages);

        setOnboardingState('completed');
        setIsValidating(true);
        setAiResponding(true);

        const projectTitleVal = project?.data?.companyName || project?.title || 'My Venture';
        const ideaText = project?.data?.idea || projectTitleVal;

        // Add progress messages/indicators to the feed
        const tempMessages = [
            ...newMessages,
            { role: 'tool_call', content: 'Structuring Sprint Roadmap...', status: 'running' }
        ];
        setMessages(tempMessages);

        try {
            await ProjectStorage.updateData(projectId, {
                chats: tempMessages,
                ideaAnswers: finalAnswers,
                onboardingState: 'completed'
            });
        } catch (e) {
            console.error("Failed to save final answers:", e);
        }

        let roadmapResult;
        let validationResult;
        const startTime = Date.now();

        try {
            const [roadmapRes, validationRes] = await Promise.all([
                generate6DayRoadmap(ideaText, finalAnswers).catch(err => {
                    console.warn("Roadmap API failed, falling back to template:", err);
                    return generateFallback6DayRoadmap(projectTitleVal);
                }),
                generateValidationReport(ideaText, finalAnswers, project?.data?.location || null).catch(err => {
                    console.warn("Validation Report API failed, falling back to template:", err);
                    return generateFallbackValidationReport(projectTitleVal);
                })
            ]);
            roadmapResult = roadmapRes;
            validationResult = validationRes;
        } catch (e) {
            console.error("Parallel generation failed completely:", e);
            roadmapResult = generateFallback6DayRoadmap(projectTitleVal);
            validationResult = generateFallbackValidationReport(projectTitleVal);
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);

        // Create main Capable agent message
        const capableMsg = {
            role: 'assistant',
            content: `I have successfully structured your custom **6-Day Validation Sprint Roadmap**. You can view and track your actionable checklist under the **Navigator** tab on the left.\n\nLet's brainstorm Day 1 tasks when you are ready!`,
            isNew: true
        };

        // Remove the temporary tool calls and add the agent messages
        const finalMessages = [
            ...newMessages,
            { role: 'tool_call', content: 'Sprint Roadmap structured', status: 'completed', duration: duration },
            capableMsg
        ];

        setMessages(finalMessages);
        setIsValidating(false);
        setAiResponding(false);
        setActiveTab('navigator');
        setActiveRightTab('chat');

        // Update project state in memory
        setProject(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                data: {
                    ...prev.data,
                    roadmap: roadmapResult,
                    validationReport: validationResult,
                    onboardingState: 'completed',
                    chats: finalMessages
                }
            };
        });

        // Persist to DB
        try {
            await ProjectStorage.updateData(projectId, {
                chats: finalMessages,
                roadmap: roadmapResult,
                validationReport: validationResult,
                onboardingState: 'completed'
            });
        } catch (err) {
            console.error("Failed to update roadmap in DB:", err);
        }
    };

    const handleGenerateReportClick = async (msgIndex) => {
        const updatedMessages = messages.map((msg, idx) => {
            if (idx === msgIndex) {
                return { ...msg, actionStatus: 'clicked' };
            }
            return msg;
        });
        setMessages(updatedMessages);
        setIsValidating(true);

        const projectTitleVal = project?.data?.companyName || project?.title || 'My Venture';
        const ideaText = project?.data?.idea || projectTitleVal;

        // Add progress messages/indicators to the feed
        const tempMessages = [
            ...updatedMessages,
            { role: 'tool_call', content: 'Structuring Sprint Roadmap...', status: 'running' }
        ];
        setMessages(tempMessages);

        let roadmapResult;
        let validationResult;
        const startTime = Date.now();

        try {
            const [roadmapRes, validationRes] = await Promise.all([
                generate6DayRoadmap(ideaText, onboardingAnswers).catch(err => {
                    console.warn("Roadmap API failed, falling back to template:", err);
                    return generateFallback6DayRoadmap(projectTitleVal);
                }),
                generateValidationReport(ideaText, onboardingAnswers, project?.data?.location || null).catch(err => {
                    console.warn("Validation Report API failed, falling back to template:", err);
                    return generateFallbackValidationReport(projectTitleVal);
                })
            ]);
            roadmapResult = roadmapRes;
            validationResult = validationRes;
        } catch (e) {
            console.error("Parallel generation failed completely:", e);
            roadmapResult = generateFallback6DayRoadmap(projectTitleVal);
            validationResult = generateFallbackValidationReport(projectTitleVal);
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);

        // Create main Capable agent message
        const capableMsg = {
            role: 'assistant',
            content: `I have successfully structured your custom **6-Day Validation Sprint Roadmap**. You can view and track your actionable checklist under the **Navigator** tab on the left.\n\nLet's brainstorm Day 1 tasks when you are ready!`,
            isNew: true
        };

        // Remove the temporary tool calls and add the agent messages
        const finalMessages = [
            ...updatedMessages,
            { role: 'tool_call', content: 'Sprint Roadmap structured', status: 'completed', duration: duration },
            capableMsg
        ];

        setMessages(finalMessages);
        setIsValidating(false);
        setActiveTab('navigator');
        setActiveRightTab('chat');

        // Update project state in memory
        setProject(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                data: {
                    ...prev.data,
                    roadmap: roadmapResult,
                    validationReport: validationResult,
                    onboardingState: 'completed',
                    chats: finalMessages
                }
            };
        });

        // Persist to DB
        try {
            await ProjectStorage.updateData(projectId, {
                chats: finalMessages,
                roadmap: roadmapResult,
                validationReport: validationResult,
                onboardingState: 'completed'
            });
        } catch (err) {
            console.error("Failed to update roadmap/report in DB:", err);
        }
    };

    const handleDeclineOnboarding = async () => {
        setOnboardingState('completed');
        const declineReply = {
            role: 'assistant',
            content: "Understood. I've skipped the onboarding questions. Let's chat directly about your venture. What would you like to brainstorm first?",
            isNew: true
        };
        const updatedMessages = [...messages, declineReply];
        setMessages(updatedMessages);
        await ProjectStorage.updateData(projectId, {
            chats: updatedMessages,
            onboardingState: 'completed'
        }).catch(console.error);
    };

    const handleSaveTitle = async () => {
        setIsEditingTitle(false);
        const newTitle = editTitleValue.trim();
        if (!newTitle || newTitle === (project?.data?.companyName || project?.title)) return;

        try {
            await ProjectStorage.updateData(projectId, { companyName: newTitle });
            setProject(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    title: newTitle,
                    data: {
                        ...prev.data,
                        companyName: newTitle,
                        projectTitle: newTitle,
                        project_name: newTitle,
                        title: newTitle
                    }
                };
            });
        } catch (err) {
            console.error("Failed to update venture name:", err);
        }
    };

    const handleSaveName = async () => {
        setIsEditingName(false);
        const newName = editNameValue.trim();
        if (!newName || newName === (project?.data?.userName || user?.profile?.name || user?.user_metadata?.name)) return;

        try {
            if (updateUser) {
                await updateUser({ name: newName, full_name: newName });
            }
            await ProjectStorage.updateData(projectId, { userName: newName });
            setProject(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        userName: newName,
                        name: newName,
                        full_name: newName
                    }
                };
            });
        } catch (err) {
            console.error("Failed to update user name:", err);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const cleanedInput = inputValue.trim();
        if (!cleanedInput || aiResponding) return;

        // If in asking questions MCQ state, chat input is disabled, so we return
        if (onboardingState === 'asking_questions') {
            return;
        }

        const newMessages = [
            ...messages,
            {
                role: 'user',
                content: cleanedInput,
                agent: isReportValidated ? undefined : 'onboarding_agent'
            }
        ];
        setMessages(newMessages);
        setInputValue('');
        setAiResponding(true);

        // Save current messages to ProjectStorage
        try {
            await ProjectStorage.updateData(projectId, { chats: newMessages });
        } catch (err) {
            console.error("Failed to save chat:", err);
        }

        // First message - triggers onboarding generation
        if (messages.length === 0 && onboardingState === 'none') {
            try {
                // 1. Generate greeting first (fast call)
                const startTime = Date.now();
                const greeting = await generateGreeting(cleanedInput);
                const endTime = Date.now();
                const duration = ((endTime - startTime) / 1000).toFixed(1);

                const messagesWithGreeting = [
                    ...newMessages,
                    { role: 'assistant', agent: 'onboarding_agent', content: greeting, thoughtDuration: duration, isNew: true },
                    { role: 'tool_call', content: 'Generate Questions', status: 'running' }
                ];
                setMessages(messagesWithGreeting);
                setAiResponding(false);
                setOnboardingState('generating_questions');

                // Save greeting & running tool call to DB immediately
                await ProjectStorage.updateData(projectId, {
                    chats: messagesWithGreeting,
                    onboardingState: 'generating_questions'
                });

                // 2. Generate questions and wait for at least 6 seconds in parallel
                const toolStartTime = Date.now();
                const questionPromise = generateOnboardingQuestions(cleanedInput);
                const delayPromise = new Promise(resolve => setTimeout(resolve, 6000));
                const [response] = await Promise.all([questionPromise, delayPromise]);
                const { questions } = response;
                const toolEndTime = Date.now();
                const toolDuration = ((toolEndTime - toolStartTime) / 1000).toFixed(1);

                const messagesWithCompletedTool = [
                    ...newMessages,
                    { role: 'assistant', agent: 'onboarding_agent', content: greeting, isNew: false },
                    { role: 'tool_call', content: 'Generate Questions', status: 'completed', duration: toolDuration }
                ];

                setMessages(messagesWithCompletedTool);
                setOnboardingQuestions(questions);
                setOnboardingState('asking_questions');

                // Save asking state, questions, & completed tool call to DB
                await ProjectStorage.updateData(projectId, {
                    chats: messagesWithCompletedTool,
                    onboardingState: 'asking_questions',
                    onboardingQuestions: questions
                });

            } catch (err) {
                console.error("Failed to start onboarding:", err);
                setOnboardingState('none');
                const fallbackMessages = [...newMessages, {
                    role: 'assistant',
                    agent: 'onboarding_agent',
                    content: "I'm having a little trouble formulating questions. Tell me a bit about who you think your target customers are.",
                    isNew: true
                }];
                setMessages(fallbackMessages);
                setAiResponding(false);
                ProjectStorage.updateData(projectId, { chats: fallbackMessages }).catch(console.error);
            }
            return;
        }

        // Standard chat response (using Groq API via mentorChat)
        try {
            const startTime = Date.now();

            const response = await mentorChat(
                project?.data?.companyName || project?.title || 'My Venture',
                null,
                newMessages
            );
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            const replyText = response?.reply || response?.content || "I see. Let's continue building the strategy.";
            const updatedMessages = [
                ...newMessages,
                {
                    role: 'assistant',
                    agent: isReportValidated ? undefined : 'onboarding_agent',
                    content: replyText,
                    thoughtDuration: duration,
                    isNew: true
                }
            ];
            setMessages(updatedMessages);
            setAiResponding(false);

            await ProjectStorage.updateData(projectId, { chats: updatedMessages });
        } catch (err) {
            console.error("Failed to get mentor chat reply:", err);
            const fallbackReply = "That's an interesting point. Let's research more on this tomorrow.";
            const updatedMessages = [
                ...newMessages,
                {
                    role: 'assistant',
                    agent: isReportValidated ? undefined : 'onboarding_agent',
                    content: fallbackReply,
                    isNew: true
                }
            ];
            setMessages(updatedMessages);
            setAiResponding(false);
            ProjectStorage.updateData(projectId, { chats: updatedMessages }).catch(console.error);
        }
    };

    if (loading) return <FullScreenLoader />;

    const avatarUrl = user?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    return (
        <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden relative font-sans">
            {/* Left Container (Workspace canvas + header) */}
            <div className="flex-1 h-full flex flex-col min-w-0">
                {/* Top Header (Transparent, just for the left side) */}
                <header className="w-full h-16 bg-transparent flex items-center justify-between px-6 z-40 shrink-0">
                    {/* Left Side: Avatar & Dropdown + Inline Editors */}
                    <div className={`relative flex items-center gap-3 min-w-0 transition-all duration-700 ease-out transform ${isReportValidated
                        ? 'translate-y-0 opacity-100 delay-0'
                        : '-translate-y-20 opacity-0 pointer-events-none'
                        }`}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-[#E4E4E7] shadow-sm hover:bg-zinc-50 transition-all cursor-pointer h-10 shrink-0"
                            aria-label="User menu"
                        >
                            {avatarUrl && !avatarError ? (
                                <img
                                    src={avatarUrl}
                                    alt="User avatar"
                                    onError={() => setAvatarError(true)}
                                    className="w-7 h-7 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-[#E4E4E7] flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                    {getUserInitials()}
                                </div>
                            )}
                            <ChevronDown size={14} className="text-zinc-500 shrink-0" />
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-[1px] bg-zinc-300/60 shrink-0" />

                        {/* Venture & User name display/edit */}
                        <div className="flex flex-col select-none min-w-0">
                            {/* Venture Title */}
                            <div className="flex items-center gap-1 group/title relative min-w-0">
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        value={editTitleValue}
                                        onChange={(e) => setEditTitleValue(e.target.value)}
                                        onBlur={handleSaveTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveTitle();
                                            if (e.key === 'Escape') setIsEditingTitle(false);
                                        }}
                                        className="text-[13px] font-semibold text-zinc-800 bg-zinc-50 border border-zinc-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-500 max-w-[150px] font-sans"
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <span
                                            onClick={() => {
                                                setEditTitleValue(project?.data?.companyName || project?.title || 'My Venture');
                                                setIsEditingTitle(true);
                                            }}
                                            className="text-[13px] font-semibold text-zinc-800 cursor-pointer hover:text-zinc-500 border-b border-dashed border-transparent hover:border-zinc-400 transition-all truncate max-w-[150px] font-sans"
                                            title="Click to edit Venture name"
                                        >
                                            {project?.data?.companyName || project?.title || 'My Venture'}
                                        </span>
                                        <PenLine size={11} className="text-zinc-400 opacity-0 group-hover/title:opacity-100 transition-opacity pointer-events-none shrink-0" />
                                    </>
                                )}
                            </div>

                            {/* User Name */}
                            <div className="flex items-center gap-1 group/name relative min-w-0">
                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={editNameValue}
                                        onChange={(e) => setEditNameValue(e.target.value)}
                                        onBlur={handleSaveName}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveName();
                                            if (e.key === 'Escape') setIsEditingName(false);
                                        }}
                                        className="text-[10px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-500 max-w-[120px] font-sans"
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <span
                                            onClick={() => {
                                                setEditNameValue(project?.data?.userName || user?.profile?.name || user?.user_metadata?.name || 'Venture Founder');
                                                setIsEditingName(true);
                                            }}
                                            className="text-[10px] font-medium text-zinc-400 cursor-pointer hover:text-zinc-500 border-b border-dashed border-transparent hover:border-zinc-400 transition-all truncate max-w-[120px] font-sans"
                                            title="Click to edit founder name"
                                        >
                                            {project?.data?.userName || user?.profile?.name || user?.user_metadata?.name || 'Venture Founder'}
                                        </span>
                                        <PenLine size={9} className="text-zinc-400 opacity-0 group-hover/name:opacity-100 transition-opacity pointer-events-none shrink-0" />
                                    </>
                                )}
                            </div>
                        </div>

                        {userMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-[#E4E4E7] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* Menu Items */}
                                <button
                                    onClick={() => { navigate('/'); setUserMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <Home size={14} className="text-zinc-400" />
                                    Go Home
                                </button>
                                <button
                                    onClick={() => { navigate('/pricing'); setUserMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <CreditCard size={14} className="text-zinc-400" />
                                    Upgrade Plan
                                </button>
                                <div className="h-px bg-[#F4F4F5] my-1.5" />
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Middle: Segments/Options */}
                    <div className={`relative flex items-center bg-white p-1 rounded-2xl border border-[#E4E4E7] shadow-sm transition-all duration-700 ease-out transform ${isReportValidated
                        ? 'translate-y-0 opacity-100 delay-300'
                        : '-translate-y-20 opacity-0 pointer-events-none'
                        }`}>
                        {/* Animated sliding background pill */}
                        <div
                            className="btn-primary !p-0 !cursor-default absolute top-1 bottom-1 left-1 !rounded-xl transition-all duration-300 ease-out"
                            style={{
                                width: '110px',
                                transform: `translateX(${activeTab === 'navigator' ? 0 : 110}px)`
                            }}
                        />
                        <button
                            onClick={() => setActiveTab('navigator')}
                            className={`relative z-10 w-[110px] py-2 text-sm font-semibold cursor-pointer transition-colors duration-300 text-center ${activeTab === 'navigator' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Navigator
                        </button>
                        <button
                            onClick={() => setActiveTab('ur-space')}
                            className={`relative z-10 w-[110px] py-2 text-sm font-semibold cursor-pointer transition-colors duration-300 text-center ${activeTab === 'ur-space' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Ur Space
                        </button>
                    </div>

                    {/* Right Side: Upgrade Button, Theme Toggle, Search Icon */}
                    <div className={`flex items-center gap-4 transition-all duration-700 ease-out transform ${isReportValidated
                        ? 'translate-y-0 opacity-100 delay-500'
                        : '-translate-y-20 opacity-0 pointer-events-none'
                        }`}>
                        {/* Upgrade Button */}
                        <button
                            onClick={() => navigate('/pricing')}
                            className="btn-primary !py-2 !px-5 !rounded-xl !text-sm cursor-pointer"
                        >
                            Upgrade
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                            title={isDarkMode ? "Light Mode" : "Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Search Icon button */}
                        <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer" title="Search">
                            <Search size={18} />
                        </button>
                    </div>
                </header>

                {/* Workspace canvas under header */}
                <div className="flex-grow flex items-center justify-center relative overflow-hidden">
                    {isValidating ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm animate-in fade-in duration-500 select-none">
                            <Bot size={44} className="text-[#303030] animate-bounce mb-4" />
                            <h3 className="text-[17px] font-semibold text-zinc-800 tracking-tight mb-2">
                                Structuring Sprint Roadmap...
                            </h3>
                            <p className="text-[12px] text-zinc-400 font-medium leading-relaxed mb-6">
                                🧭 <strong>Capable</strong> is detailing your 6-day market validation sprint.
                            </p>
                            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden mb-2">
                                <div className="bg-[#303030] h-1.5 rounded-full animate-pulse" style={{ width: '75%' }} />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono">Elapsed time: {validationSeconds}s</span>
                        </div>
                    ) : !isReportValidated ? (
                        <div className="flex flex-col items-center justify-center text-center px-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
                            <LogoIcon className="w-16 h-16 opacity-10 mb-6" style={{ filter: "brightness(0)" }} />
                            <h3 className="text-[17px] font-semibold text-zinc-800 tracking-tight mb-2">
                                Venture Workspace
                            </h3>
                            <p className="text-[12px] text-zinc-400 font-medium leading-relaxed">
                                Complete the onboarding questionnaire in the right panel and click <strong className="text-zinc-500 font-bold">Generate Roadmap</strong> to initialize your workspace modules.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col bg-zinc-50 overflow-hidden">
                                                       {activeTab === 'navigator' && (
                                <div 
                                    ref={canvasViewportRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUpOrLeave}
                                    onMouseLeave={handleMouseUpOrLeave}
                                    className={`flex-grow h-full relative overflow-hidden select-none transition-colors duration-300 ${
                                        isDarkMode ? 'bg-[#09090b]' : 'bg-zinc-50'
                                    } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                >
                                    {/* Subtle Grid Backdrop */}
                                    <div 
                                        className="absolute inset-0 pointer-events-none" 
                                        style={{
                                            backgroundImage: isDarkMode
                                                ? 'radial-gradient(circle, rgba(255,255,255,0.035) 1.5px, transparent 1.5px)'
                                                : 'radial-gradient(circle, rgba(0,0,0,0.045) 1.5px, transparent 1.5px)',
                                            backgroundSize: '40px 40px'
                                        }} 
                                    />

                                    {/* Ambient Glow Effects in corners */}
                                    <div 
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: isDarkMode
                                                ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.07), transparent 70%)'
                                                : 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.04), transparent 70%)'
                                        }}
                                    />

                                    {/* Winding Canvas Content */}
                                    <div 
                                        ref={canvasRef}
                                        className="absolute top-0 left-0 w-[1400px] h-[1200px] origin-top-left"
                                        style={{
                                            transform: `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${zoomScaleRef.current})`
                                        }}
                                    >
                                        {/* SVG laser lines path connecting days */}
                                        <svg 
                                            width="1400" 
                                            height="1200" 
                                            className="absolute top-0 left-0 pointer-events-none overflow-visible z-45"
                                        >
                                            <defs>
                                                {/* Neon Glow Filters */}
                                                <filter id="glow-emerald" x="-35%" y="-35%" width="170%" height="170%">
                                                    <feGaussianBlur stdDeviation="5" result="blur" />
                                                    <feMerge>
                                                        <feMergeNode in="blur" />
                                                        <feMergeNode in="blur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                                <filter id="glow-indigo" x="-35%" y="-35%" width="170%" height="170%">
                                                    <feGaussianBlur stdDeviation="7" result="blur" />
                                                    <feMerge>
                                                        <feMergeNode in="blur" />
                                                        <feMergeNode in="blur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            {/* Style sheet for laser moving dash animation */}
                                            <style>{`
                                                @keyframes laserFlow {
                                                    from { stroke-dashoffset: 24; }
                                                    to { stroke-dashoffset: 0; }
                                                }
                                                .laser-line-anim {
                                                    animation: laserFlow 1.2s linear infinite;
                                                }
                                            `}</style>

                                            {/* Render Path Segments */}
                                            {(() => {
                                                const days = project?.data?.roadmap?.days || [];

                                                const getRoundedOrthogonalPath = (x0, y0, x1, y1, radius = 16) => {
                                                    if (Math.abs(y1 - y0) < 2) {
                                                        return `M ${x0} ${y0} L ${x1} ${y1}`;
                                                    }
                                                    
                                                    const xmid = (x0 + x1) / 2;
                                                    const isGoingRight = x1 > x0;
                                                    const isGoingDown = y1 > y0;
                                                    
                                                    const dx = isGoingRight ? 1 : -1;
                                                    const dy = isGoingDown ? 1 : -1;
                                                    
                                                    const rX = Math.min(radius, Math.abs(xmid - x0));
                                                    const rY = Math.min(radius, Math.abs(y1 - y0) / 2);
                                                    const r = Math.min(rX, rY);
                                                    
                                                    const startHorizontalSegment = xmid - dx * r;
                                                    const firstCurveControlX = xmid;
                                                    const firstCurveControlY = y0;
                                                    const firstCurveEndX = xmid;
                                                    const firstCurveEndY = y0 + dy * r;
                                                    
                                                    const verticalLineEndX = xmid;
                                                    const verticalLineEndY = y1 - dy * r;
                                                    
                                                    const secondCurveControlX = xmid;
                                                    const secondCurveControlY = y1;
                                                    const secondCurveEndX = xmid + dx * r;
                                                    const secondCurveEndY = y1;
                                                    
                                                    return `M ${x0} ${y0} L ${startHorizontalSegment} ${y0} Q ${firstCurveControlX} ${firstCurveControlY}, ${firstCurveEndX} ${firstCurveEndY} L ${verticalLineEndX} ${verticalLineEndY} Q ${secondCurveControlX} ${secondCurveControlY}, ${secondCurveEndX} ${secondCurveEndY} L ${x1} ${y1}`;
                                                };

                                                return days.map((day) => {
                                                    const coord = ROADMAP_COORDS[day.day - 1] || { x: 700, y: 600 };
                                                    const isCompleted = day.tasks && day.tasks.every(t => t.completed);
                                                    const isActive = focusDayNum === day.day;

                                                    let isLocked = false;
                                                    if (day.day > 1) {
                                                        const prevDay = days.find(d => d.day === day.day - 1);
                                                        if (prevDay) {
                                                            const prevCompleted = prevDay.tasks?.every(t => t.completed);
                                                            if (!prevCompleted) {
                                                                isLocked = true;
                                                            }
                                                        }
                                                    }

                                                    let segmentState = isLocked ? 'locked' : isCompleted ? 'completed' : isActive ? 'active' : 'unlocked';
                                                    
                                                    let lineColor = isDarkMode ? '#27272a' : '#e4e4e7'; // locked default
                                                    if (segmentState === 'active' || segmentState === 'completed') {
                                                        lineColor = isDarkMode ? '#f4f4f5' : '#18181b'; // active/completed solid line
                                                    } else if (segmentState === 'unlocked') {
                                                        lineColor = isDarkMode ? '#52525b' : '#a1a1aa'; // unlocked but inactive
                                                    }

                                                     const isLeft = day.day <= 3;
                                                     const startX = isLeft ? 625 : 775;
                                                     const startY = 600;
                                                     const endX = isLeft ? coord.x + 100 : coord.x - 100;
                                                     const endY = coord.y;

                                                     const pathD = getRoundedOrthogonalPath(startX, startY, endX, endY, 16);

                                                     return (
                                                         <g key={`branch-${day.day}`}>
                                                             {/* Core to Day path */}
                                                             <path 
                                                                 d={pathD} 
                                                                 fill="none" 
                                                                 stroke={lineColor} 
                                                                 strokeWidth={segmentState === 'active' || segmentState === 'completed' ? "2.5" : "1.8"} 
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 strokeDasharray={segmentState === 'locked' ? "4, 4" : "none"}
                                                                 className="transition-all duration-300"
                                                             />
                                                             <circle cx={startX} cy={startY} r="4" fill={lineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1.5" className="transition-all duration-300" />
                                                             <circle cx={endX} cy={endY} r="4" fill={lineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1.5" className="transition-all duration-300" />
                                                             
                                                             {/* Day to Task sub-branches */}
                                                             {!isLocked && (() => {
                                                                  const dayTasks = day.tasks || [];
                                                                  const taskLayouts = calculateTaskLayout(dayTasks, coord.y, taskHeights);
                                                                  return dayTasks.map((task, tIdx) => {
                                                                      const { taskY } = taskLayouts[tIdx];
                                                                      const taskX = isLeft ? coord.x - 275 : coord.x + 275;

                                                                      const tStartX = isLeft ? coord.x - 100 : coord.x + 100;
                                                                      const tStartY = coord.y;
                                                                      const tEndX = isLeft ? taskX + 100 : taskX - 100;
                                                                      const tEndY = taskY;

                                                                      const tPathD = getRoundedOrthogonalPath(tStartX, tStartY, tEndX, tEndY, 12);

                                                                      let tLineColor = isDarkMode ? '#27272a' : '#e4e4e7';
                                                                      if (task.completed) {
                                                                          tLineColor = isDarkMode ? '#a1a1aa' : '#52525b';
                                                                      } else if (isActive) {
                                                                          tLineColor = isDarkMode ? '#f4f4f5' : '#18181b';
                                                                      } else {
                                                                          tLineColor = isDarkMode ? '#52525b' : '#a1a1aa';
                                                                      }

                                                                      return (
                                                                          <g key={`task-branch-${day.day}-${task.id}`}>
                                                                              <path 
                                                                                  d={tPathD} 
                                                                                  fill="none" 
                                                                                  stroke={tLineColor} 
                                                                                  strokeWidth={task.completed || isActive ? "2" : "1.5"} 
                                                                                  strokeLinecap="round"
                                                                                  strokeLinejoin="round"
                                                                                  strokeDasharray={isLocked ? "3, 3" : "none"}
                                                                                  className="transition-all duration-300"
                                                                              />
                                                                              <circle cx={tStartX} cy={tStartY} r="3" fill={tLineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1" className="transition-all duration-300" />
                                                                              <circle cx={tEndX} cy={tEndY} r="3" fill={tLineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1" className="transition-all duration-300" />
                                                                         </g>
                                                                     );
                                                                 });
                                                             })()}
                                                         </g>
                                                     );
                                                 });
                                            })()}
                                        </svg>

                                        {/* Central Core Node */}
                                        <div 
                                            className="absolute w-[150px] h-[64px] rounded-lg p-3 flex flex-col justify-center items-center gap-1.5 select-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-xl hover:shadow-2xl hover:scale-105 z-40"
                                            style={{
                                                left: '700px',
                                                top: '600px'
                                            }}
                                        >
                                            {/* Breathing border glow */}
                                            <div className="absolute inset-0 rounded-lg border border-indigo-500/20 animate-pulse pointer-events-none" />

                                            {/* Overall Progress bar */}
                                            {(() => {
                                                const allDays = project?.data?.roadmap?.days || [];
                                                let total = 0;
                                                let completed = 0;
                                                allDays.forEach(d => {
                                                    if (d.tasks) {
                                                        total += d.tasks.length;
                                                        completed += d.tasks.filter(t => t.completed).length;
                                                    }
                                                });
                                                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                                                return (
                                                    <div className="w-full flex flex-col items-center gap-1.5">
                                                        <span className="text-[9px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                                                            OVERALL PROGRESS
                                                        </span>
                                                        <div className="h-1.5 w-[110px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out" 
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                                                            {pct}% COMPLETED
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Render Day Progress Nodes */}
                                        {(() => {
                                            const days = project?.data?.roadmap?.days || [];
                                            return days.map((day, idx) => {
                                                const coord = ROADMAP_COORDS[idx] || { x: 700, y: 600 };
                                                const dayTasks = day.tasks || [];
                                                const totalCount = dayTasks.length;
                                                const completedCount = dayTasks.filter(t => t.completed).length;
                                                const isCompleted = totalCount > 0 && completedCount === totalCount;
                                                const isActive = focusDayNum === day.day;

                                                let isLocked = false;
                                                if (day.day > 1) {
                                                    const prevDay = days.find(d => d.day === day.day - 1);
                                                    if (prevDay) {
                                                        const prevCompleted = prevDay.tasks?.every(t => t.completed);
                                                        if (!prevCompleted) {
                                                            isLocked = true;
                                                        }
                                                    }
                                                }

                                                const progressFraction = totalCount > 0 ? completedCount / totalCount : 0;

                                                return (
                                                    <div
                                                        key={day.day}
                                                        onClick={() => {
                                                            if (isLocked) return;
                                                            setSelectedDay(day.day);
                                                            setFocusDayNum(day.day);
                                                            centerOnDayNode(day.day, 0.9);
                                                        }}
                                                        className={`absolute w-[200px] min-h-[82px] rounded-lg border p-4 flex flex-col gap-2 transition-all duration-300 ease-out select-none ${
                                                            isLocked 
                                                                ? (isDarkMode 
                                                                    ? 'bg-zinc-900/20 border-zinc-900/80 opacity-40' 
                                                                    : 'bg-zinc-100/40 border-zinc-200/50 opacity-45')
                                                                : isActive 
                                                                    ? (isDarkMode 
                                                                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                                                                        : 'bg-indigo-50/40 border-indigo-200 shadow-lg shadow-indigo-500/5')
                                                                    : isCompleted 
                                                                        ? (isDarkMode 
                                                                            ? 'bg-emerald-950/15 border-emerald-900/60 hover:border-emerald-700' 
                                                                            : 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300')
                                                                        : (isDarkMode 
                                                                            ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900' 
                                                                            : 'bg-white/80 border-[#E4E4E7] hover:border-zinc-300 hover:bg-white')
                                                        } ${!isLocked && 'hover:shadow-lg hover:-translate-y-0.5'}`}
                                                        style={{
                                                            left: `${coord.x}px`,
                                                            top: `${coord.y}px`,
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: isActive ? 30 : isLocked ? 10 : 20,
                                                            cursor: isLocked ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        {isActive && !isLocked && (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 animate-pulse pointer-events-none" />
                                                        )}

                                                        <div className="flex items-center justify-between w-full relative z-10">
                                                            <span className={`text-[9px] font-black tracking-wider uppercase ${
                                                                isLocked 
                                                                    ? 'text-zinc-400/60' 
                                                                    : isActive 
                                                                        ? 'text-indigo-500 dark:text-indigo-400' 
                                                                        : isCompleted 
                                                                            ? 'text-emerald-500' 
                                                                            : 'text-zinc-400'
                                                            }`}>
                                                                DAY {day.day}
                                                            </span>

                                                            {!isLocked && (
                                                                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">
                                                                    {completedCount}/{totalCount} Tasks
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <h4 className={`text-[11.5px] font-extrabold leading-tight truncate relative z-10 ${
                                                            isLocked 
                                                                ? 'text-zinc-400/50 dark:text-zinc-500/50' 
                                                                : isActive 
                                                                    ? (isDarkMode ? 'text-white' : 'text-zinc-900') 
                                                                    : (isDarkMode ? 'text-zinc-300' : 'text-zinc-700')
                                                        }`} title={day.title}>
                                                            {day.title}
                                                        </h4>

                                                        {isLocked ? (
                                                            <div className="text-[9px] font-bold text-zinc-400/40 dark:text-zinc-500/40 flex items-center gap-1 mt-auto relative z-10">
                                                                Locked
                                                            </div>
                                                        ) : (
                                                            <div className="w-full mt-auto relative z-10">
                                                                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                                                                            isCompleted 
                                                                                ? 'bg-emerald-500' 
                                                                                : isActive 
                                                                                    ? 'bg-indigo-500' 
                                                                                    : 'bg-zinc-400 dark:bg-zinc-500'
                                                                        }`} 
                                                                        style={{ width: `${progressFraction * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            });
                                        })()}

                                        {/* Render Task Sub-Branches Badges */}
                                        {(() => {
                                             const days = project?.data?.roadmap?.days || [];
 
                                             return days.map((day) => {
                                                 const coord = ROADMAP_COORDS[day.day - 1] || { x: 700, y: 600 };
                                                 const dayTasks = day.tasks || [];
                                                 const isLeft = day.day <= 3;
 
                                                 const taskLayouts = calculateTaskLayout(dayTasks, coord.y, taskHeights);
 
                                                 return dayTasks.map((task, tIdx) => {
                                                      const { taskY } = taskLayouts[tIdx];
                                                      const taskX = isLeft ? coord.x - 275 : coord.x + 275;

                                                     return (
                                                         <div
                                                             key={`task-node-${day.day}-${task.id}`}
                                                             ref={measureTaskRef(task.id)}
                                                             onClick={() => handleToggleRoadmapTask(day.day, task.id)}
                                                             className={`absolute w-[200px] min-h-[44px] rounded-md px-3.5 py-2.5 flex items-start gap-2.5 border shadow-sm transition duration-200 select-none cursor-pointer hover:shadow-md hover:scale-[1.02] z-20 ${
                                                                 task.completed 
                                                                     ? (isDarkMode 
                                                                         ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5' 
                                                                         : 'bg-emerald-50/40 border-emerald-200 text-emerald-600 shadow-emerald-500/20')
                                                                     : (focusDayNum === day.day)
                                                                         ? (isDarkMode
                                                                             ? 'bg-zinc-900 border-indigo-500/50 text-zinc-200'
                                                                             : 'bg-white border-indigo-400 text-zinc-800')
                                                                         : (isDarkMode 
                                                                             ? 'bg-zinc-950 border-zinc-800 text-zinc-400' 
                                                                             : 'bg-zinc-50 border-zinc-200/80 text-zinc-500')
                                                             }`}
                                                             style={{
                                                                 left: `${taskX}px`,
                                                                 top: `${taskY}px`,
                                                                 transform: 'translate(-50%, -50%)'
                                                             }}
                                                             title={task.text}
                                                         >
                                                             <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                                                 task.completed 
                                                                     ? 'bg-emerald-500 border-emerald-600 text-white' 
                                                                     : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                                             }`}>
                                                                 {task.completed && (
                                                                     <svg className="w-2.5 h-2.5 stroke-[2.5px] stroke-current" fill="none" viewBox="0 0 24 24">
                                                                         <polyline points="20 6 9 17 4 12" />
                                                                     </svg>
                                                                 )}
                                                             </div>

                                                             <span className={`text-[10px] leading-normal font-semibold text-left ${
                                                                 task.completed ? 'opacity-75' : ''
                                                             }`}>
                                                                 {task.text}
                                                             </span>
                                                         </div>
                                                     );
                                                 });
                                             });
                                         })()}
                                    </div>

                                    {/* Floating Canvas zoom controls UI */}
                                    <div 
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className={`absolute bottom-6 right-6 p-1.5 rounded-2xl border flex items-center gap-1 shadow-lg z-50 transition-colors duration-300 ${
                                            isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white/90 border-zinc-200 text-zinc-800'
                                        }`}
                                    >
                                        <button 
                                            onClick={() => {
                                                const oldScale = zoomScaleRef.current;
                                                const newScale = Math.min(oldScale + 0.15, 3.0);
                                                zoomScaleRef.current = newScale;
                                                if (canvasRef.current) {
                                                    canvasRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${newScale})`;
                                                }
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-xl cursor-pointer transition-colors ${
                                                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                                            }`}
                                            title="Zoom In"
                                        >
                                            +
                                        </button>
                                        <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                                        
                                        <span className="text-[10px] font-mono font-bold px-2">
                                            {Math.round(zoomScaleRef.current * 100)}%
                                        </span>
                                        
                                        <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                                        <button 
                                            onClick={() => {
                                                const oldScale = zoomScaleRef.current;
                                                const newScale = Math.max(oldScale - 0.15, 0.4);
                                                zoomScaleRef.current = newScale;
                                                if (canvasRef.current) {
                                                    canvasRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${newScale})`;
                                                }
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-xl cursor-pointer transition-colors ${
                                                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                                            }`}
                                            title="Zoom Out"
                                        >
                                            -
                                        </button>
                                        <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                                        <button 
                                            onClick={() => {
                                                centerOnDayNode(focusDayNum, 0.9);
                                            }}
                                            className={`px-3 h-8 flex items-center justify-center text-[10px] font-bold rounded-xl cursor-pointer transition-colors ${
                                                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-650'
                                            }`}
                                            title="Recenter view on active day"
                                        >
                                            Recenter
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Ur Space (Default) */}
                            {activeTab === 'ur-space' && (
                                <div className="flex-grow flex flex-col items-center justify-center p-6 text-zinc-400 font-medium text-sm animate-in fade-in duration-500">
                                    <LogoIcon className="w-16 h-16 opacity-10 mb-4" style={{ filter: "brightness(0)" }} />
                                    <h4 className="text-[15px] font-semibold text-zinc-700 tracking-tight">Your Custom Workspace</h4>
                                    <p className="text-[11.5px] text-zinc-400 font-normal leading-relaxed text-center mt-1.5 max-w-xs">
                                        Use this blank canvas for custom founder note-taking, canvas boards, or manual goals.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Floating AI Onboarding card */}
            <div className="my-[5px] mr-[5px] w-[400px] h-[calc(100vh-10px)] bg-white rounded-[1rem] border border-[#D1D5DB] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.03),_0_20px_50px_rgba(0,0,0,0.05)] flex flex-col relative px-0 pb-3.5 pt-0 shrink-0">
                {/* Header at the top of the chat section */}
                <div className="py-3 border-b border-[#E4E4E7] shrink-0 px-3.5 flex items-center">
                    <div className="flex items-center gap-2 w-full select-none">
                        <button
                            onClick={() => setActiveRightTab('home')}
                            className={`px-3 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer rounded-lg border ${activeRightTab === 'home'
                                ? 'bg-[#303030] border-[rgba(0,0,0,0.41)] text-[#eaeaea] shadow-[0px_4px_4.2px_rgba(0,0,0,0.37),_inset_0px_4px_9.2px_#000000] hover:bg-[#262626]'
                                : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800'
                                }`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => setActiveRightTab('chat')}
                            className={`px-3 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer rounded-lg border ${activeRightTab === 'chat'
                                ? 'bg-[#303030] border-[rgba(0,0,0,0.41)] text-[#eaeaea] shadow-[0px_4px_4.2px_rgba(0,0,0,0.37),_inset_0px_4px_9.2px_#000000] hover:bg-[#262626]'
                                : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800'
                                }`}
                        >
                            Capable
                        </button>
                        <button
                            onClick={() => setActiveRightTab('validation')}
                            className={`px-3 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer rounded-lg border ${activeRightTab === 'validation'
                                ? 'bg-[#303030] border-[rgba(0,0,0,0.41)] text-[#eaeaea] shadow-[0px_4px_4.2px_rgba(0,0,0,0.37),_inset_0px_4px_9.2px_#000000] hover:bg-[#262626]'
                                : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800'
                                }`}
                        >
                            Idea Validation
                        </button>
                    </div>
                </div>

                {/* Right Card Body */}
                <div className="flex-1 relative min-h-0 flex flex-col my-4 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeRightTab === 'home' && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className="flex-1 flex flex-col min-h-0 overflow-hidden"
                            >
                                <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar text-left select-none space-y-5 pb-6">
                                    <div className="flex flex-col items-center text-center mb-6">
                                        <LogoIcon className="w-12 h-12 mb-3" style={{ filter: "brightness(0)" }} />
                                        <h3 className="text-[17px] font-bold text-zinc-800 font-sans">Capable Workspace</h3>
                                        <p className="text-[12px] text-zinc-500 mt-1 leading-relaxed">
                                            Your AI-powered Strategic Co-founder.
                                        </p>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="border border-[#E4E4E7] rounded-2xl p-4 bg-zinc-50/50">
                                            <h4 className="text-[12.5px] font-bold text-zinc-800 flex items-center gap-1.5">
                                                <Compass size={14} className="text-zinc-600" />
                                                Navigator Roadmap
                                            </h4>
                                            <p className="text-[11.5px] text-zinc-500 mt-1.5 leading-relaxed">
                                                A tailored 6-day validation checklist on the left panel. Complete tasks, track progress metrics, and click <strong>"Brainstorm"</strong> on any day to dive into execution tactics.
                                            </p>
                                        </div>

                                        <div className="border border-[#E4E4E7] rounded-2xl p-4 bg-zinc-50/50">
                                            <h4 className="text-[12.5px] font-bold text-[#18181B] flex items-center gap-1.5">
                                                <MessageSquare size={14} className="text-zinc-600" />
                                                Interactive AI Chat
                                            </h4>
                                            <p className="text-[11.5px] text-zinc-500 mt-1.5 leading-relaxed">
                                                Switch to the <strong>"Capable"</strong> tab above to chat in real-time, answer onboarding questions, modify tasks, edit timelines, and brainstorm strategy.
                                            </p>
                                        </div>

                                        <div className="border border-[#E4E4E7] rounded-2xl p-4 bg-zinc-50/50">
                                            <h4 className="text-[12.5px] font-bold text-zinc-800 flex items-center gap-1.5">
                                                <ShieldCheck size={14} className="text-zinc-600" />
                                                Idea Validation Report
                                            </h4>
                                            <p className="text-[11.5px] text-zinc-500 mt-1.5 leading-relaxed">
                                                Switch to the <strong>"Idea Validation"</strong> tab above to read the synthesized report: competitor weaknesses, execution hurdles, revenue model, and estimated build cost.
                                            </p>
                                        </div>

                                        <div className="pt-2 flex justify-center">
                                            <button
                                                onClick={() => setActiveRightTab('chat')}
                                                className="btn-primary w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                            >
                                                {isReportValidated ? "Open Chat Workspace" : "Start Onboarding Chat"}
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeRightTab === 'validation' && (
                            <motion.div
                                key="validation"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className="flex-1 flex flex-col min-h-0 overflow-hidden"
                            >
                                {(() => {
                                    const rep = project?.data?.validationReport;
                                    if (rep) {
                                        return (
                                            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar text-left space-y-5 pb-6">
                                                {/* Section 1: Overview */}
                                                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                                                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Overview</span>
                                                    <h4 className="text-[13px] font-bold text-zinc-800 mt-1">{rep.overview?.elevator_pitch}</h4>
                                                    <div className="mt-3 space-y-2 text-[12px] leading-relaxed">
                                                        <p className="text-zinc-600"><strong className="text-zinc-800">Problem:</strong> {rep.overview?.problem}</p>
                                                        <p className="text-zinc-600"><strong className="text-zinc-800">Solution:</strong> {rep.overview?.solution}</p>
                                                        <p className="text-zinc-600"><strong className="text-zinc-800">Why Now:</strong> {rep.overview?.why_now}</p>
                                                    </div>
                                                </div>

                                                {/* Section 2: Market Analysis */}
                                                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                                                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Market & Competitors</span>
                                                    <p className="text-[12px] text-zinc-600 mt-1.5 leading-relaxed">{rep.market?.market_size}</p>
                                                    <div className="mt-3 space-y-2.5">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Key Competitors</span>
                                                        {rep.market?.competitors?.map((comp, idx) => (
                                                            <div key={idx} className="bg-white border border-zinc-200/60 rounded-xl p-3 text-[12px]">
                                                                <div className="flex justify-between items-center font-bold text-zinc-800">
                                                                    <span>{comp.name}</span>
                                                                </div>
                                                                <p className="text-zinc-500 mt-1 text-[11px] leading-relaxed">{comp.what_they_do}</p>
                                                                <p className="text-zinc-600 mt-1 text-[11px] leading-relaxed"><strong className="text-zinc-700">Weakness:</strong> {comp.weakness}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {rep.market?.unique_edge && (
                                                        <div className="mt-3.5 pt-3 border-t border-zinc-200/60 text-[12px] leading-relaxed">
                                                            <strong className="text-zinc-800 block mb-0.5">Your Competitive Moat</strong>
                                                            <p className="text-zinc-600">{rep.market?.unique_edge}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Section 3: Execution Engine */}
                                                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                                                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Execution</span>
                                                    <div className="mt-2.5 flex justify-between gap-3 text-center">
                                                        <div className="flex-1 bg-white border border-zinc-200/60 rounded-xl p-2.5 shadow-sm">
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Est. MVP Cost</span>
                                                            <p className="text-[13px] font-bold text-zinc-800 mt-0.5">{rep.execution?.est_mvp_cost}</p>
                                                        </div>
                                                        <div className="flex-1 bg-white border border-zinc-200/60 rounded-xl p-2.5 shadow-sm">
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Timeline</span>
                                                            <p className="text-[13px] font-bold text-zinc-800 mt-0.5">{rep.execution?.est_timeline}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3.5 text-[12px] leading-relaxed space-y-2">
                                                        <p className="text-zinc-600"><strong className="text-zinc-800">Business Model:</strong> {rep.execution?.business_model}</p>
                                                        {rep.execution?.feasibility && (
                                                            <p className="text-zinc-600"><strong className="text-zinc-800">Build Feasibility:</strong> {rep.execution?.feasibility}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Section 4: Risks & Validation */}
                                                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                                                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Reality Check</span>
                                                    <div className="mt-3 space-y-2">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Key Risks</span>
                                                        {rep.reality?.risks?.map((risk, idx) => (
                                                            <div key={idx} className="flex justify-between items-start text-[12px] border-b border-zinc-100 last:border-b-0 py-1.5">
                                                                <div className="pr-4">
                                                                    <span className="font-semibold text-zinc-800">{risk.category}: </span>
                                                                    <span className="text-zinc-500 leading-normal text-[11.5px]">{risk.description}</span>
                                                                </div>
                                                                <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${risk.severity === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                    }`}>{risk.severity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isValidating) {
                                        return (
                                            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center select-none">
                                                <Bot size={40} className="text-[#303030] animate-bounce mb-4" />
                                                <h4 className="text-[14.5px] font-bold text-zinc-800 font-sans">Structuring Validation Report...</h4>
                                                <p className="text-[12px] text-zinc-500 mt-2 leading-relaxed max-w-xs">
                                                    Capable is analyzing market signals, competitor weaknesses, and feasibility in the background.
                                                </p>
                                                <div className="w-full max-w-[200px] bg-zinc-200 h-1.5 rounded-full overflow-hidden mt-4 mb-2">
                                                    <div className="bg-zinc-800 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                                                </div>
                                                <span className="text-[11px] text-zinc-400 font-mono">Elapsed time: {validationSeconds}s</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center select-none">
                                            <ShieldCheck size={40} className="text-zinc-300 mb-4 animate-pulse" />
                                            <h4 className="text-[14.5px] font-bold text-zinc-700 font-sans">Validation Report Pending</h4>
                                            <p className="text-[12px] text-zinc-400 mt-2 leading-relaxed max-w-xs">
                                                Your custom validation report will generate automatically in the background once you complete the onboarding questionnaire in the **Capable** tab.
                                            </p>
                                            <button
                                                onClick={() => setActiveRightTab('chat')}
                                                className="mt-5 px-4 py-2 bg-zinc-800 text-white hover:bg-black rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                                            >
                                                Go to Onboarding Chat
                                            </button>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}

                        {activeRightTab === 'chat' && (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className="flex-1 flex flex-col min-h-0 overflow-hidden"
                            >
                                {messages.length > 0 && (
                                    <>
                                        {/* Top gradient fade */}
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white via-white/70 to-transparent pointer-events-none z-10" />
                                        {/* Bottom gradient fade */}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none z-10" />
                                    </>
                                )}

                                <div className={`flex-1 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'} custom-scrollbar min-h-0 flex flex-col justify-between`}>
                                    {messages.length === 0 ? (
                                        /* Center Greeting exactly as per image */
                                        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 select-none">
                                            <LogoIcon className="w-20 h-20 opacity-10 mb-6" style={{ filter: "brightness(0)" }} />
                                            <h3 className="text-2xl font-medium text-[#18181B] leading-snug tracking-tight whitespace-pre-line">
                                                Tell me more about your{"\n"}Idea/Business
                                            </h3>
                                        </div>
                                    ) : (
                                        /* Chat Messages */
                                        <div className="pl-3.5 pr-3.5 pt-5 pb-5">
                                            {(() => {
                                                const getMessageSpacing = (index, allMsgs) => {
                                                    if (index === 0) return 'mt-0';
                                                    const current = allMsgs[index];
                                                    const prev = allMsgs[index - 1];
                                                    if (current.role === 'tool_call' || prev.role === 'tool_call') {
                                                        return 'mt-5';
                                                    }
                                                    return 'mt-9';
                                                };

                                                return messages.map((msg, i) => {
                                                    if (msg.role === 'tool_call') {
                                                        return (
                                                            <div key={i} className={`flex items-center gap-2 px-1 py-1 animate-in fade-in duration-200 ${getMessageSpacing(i, messages)}`}>
                                                                <GitCommit className={`text-zinc-400 rotate-90 ${msg.status === 'running' ? 'animate-pulse' : ''}`} size={15} />
                                                                {msg.status === 'running' ? (
                                                                    <RunningToolText content={msg.content} />
                                                                ) : (
                                                                    <span className="text-[#A3A3A3] font-medium text-[13px]">
                                                                        Tool Called: {msg.content} {msg.duration ? `(${msg.duration}s)` : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div key={i} className={`flex flex-col ${getMessageSpacing(i, messages)}`}>
                                                            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start w-full'} animate-in fade-in duration-200`}>
                                                                {msg.role === 'user' ? (
                                                                    (() => {
                                                                        const parsedAnswers = (msg.isAnswersPreview && msg.answers)
                                                                            ? msg.answers
                                                                            : parseAnswersFromText(msg.content);

                                                                        if (parsedAnswers) {
                                                                            const totalQuestions = parsedAnswers.length;
                                                                            const skippedCount = parsedAnswers.filter(a => !a.answer || a.answer === 'Skipped' || a.answer.toLowerCase() === 'skipped').length;
                                                                            const answeredCount = totalQuestions - skippedCount;
                                                                            return (
                                                                                <div className="w-full rounded-2xl bg-black/5 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in duration-300 flex flex-col gap-3.5 border-none">
                                                                                    <div className="flex items-center justify-between text-left">
                                                                                        <span className="text-[11.5px] font-bold text-zinc-500 uppercase tracking-wider">Completed Questionnaire</span>
                                                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-200/60 text-zinc-600">{answeredCount}/{totalQuestions} Answered</span>
                                                                                    </div>
                                                                                    <div className="space-y-2.5">
                                                                                        {parsedAnswers.map((ans, idx) => {
                                                                                            const key = `${i}-${idx}`;
                                                                                            const isExpanded = !!expandedAnswers[key];
                                                                                            const isSkipped = !ans.answer || ans.answer === 'Skipped' || ans.answer.toLowerCase() === 'skipped';
                                                                                            const isAnswered = ans.answer && !isSkipped;

                                                                                            return (
                                                                                                <div
                                                                                                    key={idx}
                                                                                                    className="relative bg-white rounded-xl p-3.5 flex flex-col transition-all cursor-pointer shadow-sm hover:shadow-md select-none border-none text-left"
                                                                                                    onClick={() => setExpandedAnswers(prev => ({ ...prev, [key]: !prev[key] }))}
                                                                                                >
                                                                                                    {/* Floating Tag */}
                                                                                                    {isAnswered ? (
                                                                                                        <span className="absolute top-3 right-9 text-[8.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]/60 shadow-sm">
                                                                                                            Answered
                                                                                                        </span>
                                                                                                    ) : (
                                                                                                        <span className="absolute top-3 right-9 text-[8.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]/60 shadow-sm">
                                                                                                            Unanswered
                                                                                                        </span>
                                                                                                    )}

                                                                                                    {/* Chevron icon */}
                                                                                                    <ChevronDown size={14} className={`absolute top-3.5 right-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />

                                                                                                    <div className="pr-[92px]">
                                                                                                        <h4 className="text-[#1E293B] font-semibold text-[13.5px] leading-snug whitespace-normal break-words font-sans">
                                                                                                            {ans.questionText}
                                                                                                        </h4>
                                                                                                    </div>

                                                                                                    {isExpanded && (
                                                                                                        <div
                                                                                                            className="mt-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-150"
                                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                                        >
                                                                                                            <div className="text-[13px] font-medium text-zinc-500 leading-relaxed whitespace-pre-wrap pl-2 border-l border-zinc-200">
                                                                                                                {isAnswered ? ans.answer : 'Skipped / Unanswered'}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div className="max-w-[82%] px-4 py-3 text-[14px] leading-relaxed bg-[#E4E4E7] text-[#18181B] rounded-2xl rounded-tr-none">
                                                                                {renderFormattedText(msg.content)}
                                                                            </div>
                                                                        );
                                                                    })()
                                                                ) : (
                                                                    (() => {
                                                                        const { thinking, cleanText, isUnclosed } = parseThinkingContent(msg.content);
                                                                        const isLastMessage = i === messages.length - 1;
                                                                        const shouldAnimate = msg.isNew && isLastMessage;

                                                                        return (
                                                                            <div className="flex flex-col w-full px-1 relative group">
                                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                                    <LogoIcon className="w-[15px] h-[15px] shrink-0" style={{ filter: "brightness(0)", opacity: 0.7 }} />
                                                                                    <span className="text-[#737373] text-[12px] font-bold font-sans">Capable</span>
                                                                                    {msg.agent === 'onboarding_agent' && (
                                                                                        <>
                                                                                            <span className="text-[#A3A3A3] text-[12px] font-medium">•</span>
                                                                                            <span className="text-[#737373] text-[12px] font-medium italic">
                                                                                                Onboarding Agent used
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                    {thinking && !isUnclosed && (
                                                                                        <>
                                                                                            <span className="text-[#A3A3A3] text-[12px] font-medium">•</span>
                                                                                            <span className="text-[#737373] text-[12px] font-medium">
                                                                                                Thought for {msg.thoughtDuration ? parseFloat(msg.thoughtDuration).toFixed(1) : Math.max(1.5, (thinking.length / 250)).toFixed(1)}s
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                    {isUnclosed && (
                                                                                        <>
                                                                                            <span className="text-[#A3A3A3] text-[12px] font-medium">•</span>
                                                                                            <span className="text-[#737373] text-[12px] font-medium">
                                                                                                <span className="animate-shine">Thinking...</span>
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-[14px] leading-relaxed text-[#303030]">
                                                                                    {shouldAnimate ? (
                                                                                        <div className="whitespace-pre-line">
                                                                                            <TypingText
                                                                                                text={cleanText}
                                                                                                onComplete={() => handleAnimationComplete(i)}
                                                                                            />
                                                                                        </div>
                                                                                    ) : (
                                                                                        renderFormattedText(cleanText)
                                                                                    )}
                                                                                </div>

                                                                                {msg.actionType === 'generate_report' && (
                                                                                    <div className="mt-3.5 flex">
                                                                                        {msg.actionStatus === 'clicked' ? (
                                                                                            <button
                                                                                                disabled
                                                                                                className="btn-primary !py-2 !px-4.5 !text-[12.5px] !rounded-xl opacity-50 cursor-default"
                                                                                            >
                                                                                                Roadmap Generated
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() => handleGenerateReportClick(i)}
                                                                                                className="btn-primary !py-2 !px-4.5 !text-[12.5px] !rounded-xl cursor-pointer"
                                                                                            >
                                                                                                Generate Roadmap
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* Copy & Reply Actions */}
                                                                                {!isUnclosed && (
                                                                                    <div className="flex items-center gap-1.5 mt-0 h-0 overflow-hidden opacity-0 scale-0 origin-left transition-all duration-300 ease-out group-hover:h-5 group-hover:mt-2 group-hover:opacity-100 group-hover:scale-100">
                                                                                        <button
                                                                                            onClick={() => navigator.clipboard.writeText(cleanText)}
                                                                                            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer p-0.5"
                                                                                            title="Copy response"
                                                                                        >
                                                                                            <Copy size={13.5} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setInputValue(prev => {
                                                                                                    const quote = `> ${cleanText.substring(0, 60)}...\n\n`;
                                                                                                    return quote + prev;
                                                                                                });
                                                                                            }}
                                                                                            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer p-0.5"
                                                                                            title="Reply to message"
                                                                                        >
                                                                                            <CornerUpLeft size={13.5} />
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}

                                            {onboardingState === 'asking_questions' && onboardingQuestions.length > 0 && (
                                                <div className="mt-6">
                                                    <QuestionnaireCard
                                                        questions={onboardingQuestions}
                                                        initialAnswers={onboardingAnswers}
                                                        onSubmit={handleQuestionnaireSubmit}
                                                        onDeclineOnboarding={handleDeclineOnboarding}
                                                    />
                                                </div>
                                            )}

                                            {aiResponding && onboardingState === 'generating_summary' && (
                                                <div className="mt-6">
                                                    <ThinkingBubble text="Summarizing your venture idea..." />
                                                </div>
                                            )}
                                            {aiResponding && onboardingState === 'completed' && (
                                                <div className="mt-6">
                                                    <ThinkingBubble text="Analyzing context..." />
                                                </div>
                                            )}
                                            {aiResponding && onboardingState !== 'generating_questions' && onboardingState !== 'asking_questions' && onboardingState !== 'generating_summary' && onboardingState !== 'completed' && (
                                                <div className="mt-6">
                                                    <ThinkingBubble text="Thinking..." />
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Input Area */}
                {(() => {
                    const hideInput = activeRightTab !== 'chat' || (onboardingState === 'asking_questions' && onboardingQuestions.length > 0);

                    if (hideInput) return null;

                    return (
                        <div className="pt-1 relative mx-3.5 shrink-0">
                            <form onSubmit={handleSend} className="border border-[#E4E4E7] rounded-2xl bg-white p-3.5 flex flex-col min-h-[110px] justify-between shadow-[inset_0px_5px_10px_rgba(0,0,0,0.03),_0px_1px_2px_rgba(0,0,0,0.01)] transition-all duration-200 focus-within:border-zinc-400">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={
                                        isReportValidated
                                            ? "Brainstorm with Capable..."
                                            : onboardingState === 'completed'
                                                ? "Ask your mentor..."
                                                : "Share what you're building..."
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    className="w-full bg-transparent border-none p-0.5 text-[13px] text-[#303030] placeholder:text-zinc-400 focus:ring-0 focus:outline-none resize-none flex-1 min-h-[72px] custom-scrollbar"
                                />
                                <div className="flex items-center justify-between px-0.5">
                                    <button
                                        type="button"
                                        className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                                        title="Attach details"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || aiResponding}
                                        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-40 ${inputValue.trim()
                                            ? 'bg-[#303030] text-white hover:bg-[#262626] cursor-pointer'
                                            : 'bg-[#E4E4E7] text-zinc-500'
                                            }`}
                                        aria-label="Send message"
                                    >
                                        <ArrowRight size={14} className="stroke-[2.5]" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default VenturePage;
