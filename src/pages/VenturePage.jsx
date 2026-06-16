import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStorage } from '../services/projectStorage';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import { LogoIcon } from '../components/Logo';
import { Plus, Bot, ArrowRight, Search, Moon, Sun, Home, LogOut, CreditCard, ChevronDown, ChevronLeft, ChevronRight, X, GitCommit, PenLine, Copy, CornerUpLeft, Sparkles, ShieldCheck, Compass, Layers } from 'lucide-react';
import { generateGreeting, generateOnboardingQuestions, mentorChat, generateSummary } from '../services/ai';



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

    const isReportValidated = messages.some(msg => msg.actionType === 'generate_report' && msg.actionStatus === 'clicked') || 
                              (onboardingState === 'completed' && !messages.some(msg => msg.actionType === 'generate_report'));

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

        setOnboardingState('generating_summary');
        setAiResponding(true);

        try {
            await ProjectStorage.updateData(projectId, {
                chats: newMessages,
                ideaAnswers: finalAnswers,
                onboardingState: 'generating_summary'
            });
        } catch (e) {
            console.error("Failed to save final answers:", e);
        }

        try {
            const companyName = project?.data?.companyName || project?.title || 'My Venture';
            const startTime = Date.now();
            const summaryText = await generateSummary(companyName, finalAnswers);
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            const finalReply = {
                role: 'assistant',
                content: `${summaryText}\n\nLet's validate your venture idea. Click below to begin:`,
                actionType: 'generate_report',
                actionStatus: 'pending',
                thoughtDuration: duration,
                isNew: true
            };

            const completedMessages = [...newMessages, finalReply];
            setMessages(completedMessages);
            setAiResponding(false);
            setOnboardingState('completed');

            await ProjectStorage.updateData(projectId, {
                chats: completedMessages,
                onboardingState: 'completed'
            });
        } catch (err) {
            console.error("Failed to generate summary:", err);
            const fallbackReply = {
                role: 'assistant',
                content: `Thank you for sharing those details. Let's validate your venture idea. Click below to begin:`,
                actionType: 'generate_report',
                actionStatus: 'pending',
                isNew: true
            };

            const completedMessages = [...newMessages, fallbackReply];
            setMessages(completedMessages);
            setAiResponding(false);
            setOnboardingState('completed');

            await ProjectStorage.updateData(projectId, {
                chats: completedMessages,
                onboardingState: 'completed'
            });
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
        try {
            await ProjectStorage.updateData(projectId, { chats: updatedMessages });
        } catch (err) {
            console.error("Failed to update report button clicked status:", err);
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

        const newMessages = [...messages, { role: 'user', content: cleanedInput }];
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
                    { role: 'assistant', content: greeting, thoughtDuration: duration, isNew: true },
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
                    { role: 'assistant', content: greeting, isNew: false },
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
            const updatedMessages = [...newMessages, { role: 'assistant', content: replyText, thoughtDuration: duration, isNew: true }];
            setMessages(updatedMessages);
            setAiResponding(false);

            await ProjectStorage.updateData(projectId, { chats: updatedMessages });
        } catch (err) {
            console.error("Failed to get mentor chat reply:", err);
            const fallbackReply = "That's an interesting point. Let's research more on this tomorrow.";
            const updatedMessages = [...newMessages, { role: 'assistant', content: fallbackReply, isNew: true }];
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
                    <div className={`relative flex items-center gap-3 min-w-0 transition-all duration-700 ease-out transform ${
                        isReportValidated 
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
                    <div className={`relative flex items-center bg-white p-1 rounded-2xl border border-[#E4E4E7] shadow-sm transition-all duration-700 ease-out transform ${
                        isReportValidated 
                            ? 'translate-y-0 opacity-100 delay-300' 
                            : '-translate-y-20 opacity-0 pointer-events-none'
                    }`}>
                        {/* Animated sliding background pill */}
                        <div
                            className="btn-primary !p-0 !cursor-default absolute top-1 bottom-1 left-1 !rounded-xl transition-all duration-300 ease-out"
                            style={{
                                width: '110px',
                                transform: `translateX(${activeTab === 'validator' ? 0 : activeTab === 'navigator' ? 110 : 220}px)`
                            }}
                        />
                        <button
                            onClick={() => setActiveTab('validator')}
                            className={`relative z-10 w-[110px] py-2 text-sm font-semibold cursor-pointer transition-colors duration-300 text-center ${activeTab === 'validator' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Validator
                        </button>
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
                    <div className={`flex items-center gap-4 transition-all duration-700 ease-out transform ${
                        isReportValidated 
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
                    {!isReportValidated ? (
                        <div className="flex flex-col items-center justify-center text-center px-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
                            <LogoIcon className="w-16 h-16 opacity-10 mb-6" style={{ filter: "brightness(0)" }} />
                            <h3 className="text-[17px] font-semibold text-zinc-800 tracking-tight mb-2">
                                Venture Workspace
                            </h3>
                            <p className="text-[12px] text-zinc-400 font-medium leading-relaxed">
                                Complete the onboarding questionnaire in the right panel and click <strong className="text-zinc-500 font-bold">Validate Your Idea</strong> to initialize your workspace modules.
                            </p>
                        </div>
                    ) : (
                        /* Actual workspace content shows here once validated */
                        <div className="flex-grow flex flex-col items-center justify-center text-zinc-400 font-medium text-sm animate-in fade-in duration-500">
                            Workspace content loaded successfully
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Floating AI Onboarding card */}
            <div className="my-[5px] mr-[5px] w-[400px] h-[calc(100vh-10px)] bg-white rounded-[1.5rem] border border-[#D1D5DB] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.03),_0_20px_50px_rgba(0,0,0,0.05)] flex flex-col relative px-0 pb-3.5 pt-4 shrink-0">
                {/* Header at the top of the chat section */}
                <div className="pb-3 border-b border-[#E4E4E7] shrink-0 pt-1 px-3.5">
                    <span className="font-sans font-medium text-[17px] text-[#18181B]">Onboarding</span>
                </div>

                {/* Chat Feed / Center Greeting */}
                <div className="flex-1 relative min-h-0 flex flex-col my-4">
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
                            <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
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

                                                                                        {/* Chevron icon positioned absolute in the top right too */}
                                                                                        <ChevronDown size={14} className={`absolute top-3.5 right-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />

                                                                                        {/* Question text with padding-right to avoid overlap */}
                                                                                        <div className="pr-[92px]">
                                                                                            <h4 className="text-[#1E293B] font-semibold text-[13.5px] leading-snug whitespace-normal break-words">
                                                                                                {ans.questionText}
                                                                                            </h4>
                                                                                        </div>

                                                                                        {/* Answer Dropdown (Collapsible) */}
                                                                                        {isExpanded && (
                                                                                            <div 
                                                                                                className="mt-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-150"
                                                                                                onClick={(e) => e.stopPropagation()} // Prevent closing accordion when clicking inside
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
                                                                        <LogoIcon className="w-[15px] h-[15px]" style={{ filter: "brightness(0)", opacity: 0.7 }} />
                                                                        <span className="text-[#737373] text-[12px] font-medium">Capable</span>
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
                                                                                    Idea Validated
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleGenerateReportClick(i)}
                                                                                    className="btn-primary !py-2 !px-4.5 !text-[12.5px] !rounded-xl cursor-pointer"
                                                                                >
                                                                                    Validate Your Idea
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
                </div>

                {/* Bottom Input Area exactly as per image */}
                <div className="pt-1 relative mx-3.5">
                    {onboardingState === 'asking_questions' && onboardingQuestions.length > 0 ? (
                        <QuestionnaireCard
                            questions={onboardingQuestions}
                            initialAnswers={onboardingAnswers}
                            onSubmit={handleQuestionnaireSubmit}
                            onDeclineOnboarding={handleDeclineOnboarding}
                        />
                    ) : (
                        <form onSubmit={handleSend} className="border border-[#E4E4E7] rounded-2xl bg-white p-3.5 flex flex-col min-h-[142px] justify-between shadow-[inset_0px_5px_10px_rgba(0,0,0,0.03),_0px_1px_2px_rgba(0,0,0,0.01)] transition-all duration-200 focus-within:border-zinc-400">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={onboardingState === 'completed' ? "Ask your mentor..." : "Share what you're building..."}
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
                    )}
                </div>

            </div>
        </div>
    );
};

export default VenturePage;
