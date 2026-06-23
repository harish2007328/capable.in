import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStorage } from '../services/projectStorage';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import { LogoIcon } from '../components/Logo';
import { Plus, Bot, ArrowRight, Search, Moon, Sun, Home, LogOut, CreditCard, ChevronDown, ChevronLeft, X, GitCommit, PenLine, Copy, CornerUpLeft, Sparkles, ShieldCheck, Compass, Layers, MessageSquare, Users, Globe, PhoneCall, Award, Lock, Check } from 'lucide-react';
import { generateGreeting, generateOnboardingQuestions, mentorChat, generateSummary, generateValidationReport, generate6DayRoadmap } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';

// Import Modular Components and Helpers
import { ThinkingBubble, RunningToolText, TypingText } from '../components/ChatHelpers';
import { QuestionnaireCard } from '../components/QuestionnaireCard';
import { ValidationReport } from '../components/ValidationReport';
import { RoadmapCanvas } from '../components/RoadmapCanvas';
import { 
    parseThinkingContent, 
    parseAnswersFromText, 
    generateFallbackValidationReport, 
    generateFallback6DayRoadmap, 
    generateNextPhase 
} from '../utils/roadmapHelpers';

const VenturePage = () => {
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
    const { user, logout } = useAuth();
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
    const [activeRightTab, setActiveRightTab] = useState('chat');
    const [selectedDay, setSelectedDay] = useState(1);
    const [focusDayNum, setFocusDayNum] = useState(1);
    const [expandedDays, setExpandedDays] = useState({ 1: true });

    const roadmapCanvasRef = useRef(null);
    const hasAutoSelectedRef = useRef(false);

    const roadmapPhases = project?.data?.roadmap?.phases || (project?.data?.roadmap?.days ? [
        { id: 0, title: "Validation Phase", days: project.data.roadmap.days }
    ] : []);

    const handleToggleDayExpand = (dayNum) => {
        setExpandedDays(prev => ({
            ...prev,
            [dayNum]: !prev[dayNum]
        }));
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
                        setExpandedDays(prev => ({ ...prev, [targetDay]: true }));
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
                setExpandedDays(prev => ({ ...prev, [firstUncompletedDay.day]: true }));
            } else {
                setSelectedDay(1);
                setFocusDayNum(1);
                setExpandedDays(prev => ({ ...prev, 1: true }));
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

        // Sync with the nested phases array if it exists
        const updatedPhases = project.data.roadmap.phases ? project.data.roadmap.phases.map(phase => {
            return {
                ...phase,
                days: phase.days.map(day => {
                    if (day.day === dayNum) {
                        const matchingDay = updatedDays.find(d => d.day === dayNum);
                        if (matchingDay) {
                            return {
                                ...day,
                                tasks: matchingDay.tasks
                            };
                        }
                    }
                    return day;
                })
            };
        }) : undefined;

        const updatedRoadmap = {
            ...project.data.roadmap,
            days: updatedDays,
            ...(updatedPhases ? { phases: updatedPhases } : {})
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
                            setExpandedDays(prev => ({
                                ...prev,
                                [dayNum]: false
                            }));

                            // Snappier transition: wait for collapse coords update, center in 300ms, then expand
                            setTimeout(() => {
                                roadmapCanvasRef.current?.centerOnDayNode(nextDayNum, 1.2, 300, () => {
                                    setExpandedDays(prev => ({
                                        ...prev,
                                        [nextDayNum]: true
                                    }));
                                });
                            }, 50);
                        }
                        return currentProject;
                    });
                }, 50);
            }
        }
    };

    const handleBrainstormRoadmap = (dayNum, title, objective) => {
        setActiveTab('navigator');
        setActiveRightTab('chat');
        setInputValue(`I'd like to brainstorm Day ${dayNum} of our Validation Sprint: "${title}". The objective is "${objective}". How do we execute the tasks for today?`);
        setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    };

    const handleQuestionnaireSubmit = async (finalAnswers) => {
        setOnboardingAnswers(finalAnswers);

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

        const capableMsg = {
            role: 'assistant',
            content: `I have successfully structured your custom **6-Day Validation Sprint Roadmap**. You can view and track your actionable checklist under the **Navigator** tab on the left.\n\nLet's brainstorm Day 1 tasks when you are ready!`,
            isNew: true
        };

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

        const capableMsg = {
            role: 'assistant',
            content: `I have successfully structured your custom **6-Day Validation Sprint Roadmap**. You can view and track your actionable checklist under the **Navigator** tab on the left.\n\nLet's brainstorm Day 1 tasks when you are ready!`,
            isNew: true
        };

        const finalMessages = [
            ...updatedMessages,
            { role: 'tool_call', content: 'Sprint Roadmap structured', status: 'completed', duration: duration },
            capableMsg
        ];

        setMessages(finalMessages);
        setIsValidating(false);
        setActiveTab('navigator');
        setActiveRightTab('chat');

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

        const newMessages = [
            ...messages,
            {
                role: 'user',
                content: cleanedInput,
                agent: (project?.data?.roadmap) ? undefined : 'onboarding_agent'
            }
        ];
        setMessages(newMessages);
        setInputValue('');
        setAiResponding(true);

        try {
            await ProjectStorage.updateData(projectId, { chats: newMessages });
        } catch (err) {
            console.error("Failed to save chat:", err);
        }

        // Direct Goal/Roadmap Generation Intercept (e.g., "$100", "roadmap", "goal", etc.)
        const isGoalRoadmapGen = /(roadmap|goal|achieve|100|generate|create|sprint|validation|start|plan)/i.test(cleanedInput);
        if (!project?.data?.roadmap && isGoalRoadmapGen) {
            try {
                const startTime = Date.now();
                const tempMessages = [
                    ...newMessages,
                    { role: 'tool_call', content: `Structuring custom Validation Roadmap for: "${cleanedInput}"...`, status: 'running' }
                ];
                setMessages(tempMessages);
                setIsValidating(true);

                const projectTitleVal = project?.data?.companyName || project?.title || 'My Venture';
                
                const [roadmapRes, validationRes] = await Promise.all([
                    generate6DayRoadmap(cleanedInput, []).catch(err => {
                        console.warn("Roadmap API failed, falling back to template:", err);
                        return generateFallback6DayRoadmap(projectTitleVal);
                    }),
                    generateValidationReport(cleanedInput, [], project?.data?.location || null).catch(err => {
                        console.warn("Validation Report API failed, falling back to template:", err);
                        return generateFallbackValidationReport(projectTitleVal);
                    })
                ]);

                const endTime = Date.now();
                const duration = ((endTime - startTime) / 1000).toFixed(1);

                const capableMsg = {
                    role: 'assistant',
                    content: `I have structured your custom **Validation Roadmap** to achieve your goal: "${cleanedInput}". You can view and track your actionable checklist under the **Navigator** tab.\n\nLet's brainstorm Day 1 tasks when you are ready!`,
                    isNew: true
                };

                const finalMessages = [
                    ...newMessages,
                    { role: 'tool_call', content: 'Sprint Roadmap structured', status: 'completed', duration: duration },
                    capableMsg
                ];

                setMessages(finalMessages);
                setIsValidating(false);
                setAiResponding(false);
                setOnboardingState('completed');
                setActiveTab('navigator');
                setActiveRightTab('chat');

                setProject(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        data: {
                            ...prev.data,
                            roadmap: roadmapRes,
                            validationReport: validationRes,
                            onboardingState: 'completed',
                            chats: finalMessages
                        }
                    };
                });

                await ProjectStorage.updateData(projectId, {
                    chats: finalMessages,
                    roadmap: roadmapRes,
                    validationReport: validationRes,
                    onboardingState: 'completed'
                });

            } catch (err) {
                console.error("Direct roadmap generation failed:", err);
                const fallbackReply = "I encountered an error generating your custom roadmap. Let's try starting with the onboarding questions first.";
                const finalMessages = [
                    ...newMessages,
                    { role: 'assistant', agent: 'onboarding_agent', content: fallbackReply, isNew: true }
                ];
                setMessages(finalMessages);
                setAiResponding(false);
                await ProjectStorage.updateData(projectId, { chats: finalMessages }).catch(console.error);
            }
            return;
        }

        // First message - triggers onboarding generation
        if (messages.length === 0 && onboardingState === 'none') {
            try {
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

                await ProjectStorage.updateData(projectId, {
                    chats: messagesWithGreeting,
                    onboardingState: 'generating_questions'
                });

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

        // Intercept phase generation request
        const completedDaysCount = project?.data?.roadmap?.days?.filter(d => d.tasks?.every(t => t.completed))?.length || 0;
        const totalDaysCount = project?.data?.roadmap?.days?.length || 0;
        const isAllCompleted = totalDaysCount > 0 && completedDaysCount === totalDaysCount;
        
        const isPhaseRequest = /(next|new|generate|add|build|expand|create|show|proceed|go\s*to|move\s*to)\s*(phase|mindmap|minmap|roadmap|sprint|tasks|checklist)/i.test(cleanedInput) || 
                               /what\s*(to\s*do\s*)?next/i.test(cleanedInput) || 
                               /what's\s*next/i.test(cleanedInput) || 
                               /phase\s*\d+/i.test(cleanedInput) ||
                               (isAllCompleted && /^(continue|next|proceed|go\s*on|go\s*ahead)$/i.test(cleanedInput));
                               
        if (isPhaseRequest && project?.data?.roadmap) {
            try {
                const startTime = Date.now();
                const nextPhaseIdx = roadmapPhases.length;
                const matchDays = cleanedInput.match(/(\d+)\s*day/i);
                const requestedDaysCount = matchDays ? parseInt(matchDays[1], 10) : null;

                const newPhase = generateNextPhase(
                    roadmapPhases,
                    project?.data?.idea || project?.data?.companyName,
                    project?.data?.companyName,
                    requestedDaysCount
                );

                const updatedPhases = [...roadmapPhases, newPhase];
                const updatedRoadmap = {
                    ...project.data.roadmap,
                    phases: updatedPhases,
                    days: updatedPhases.reduce((all, p) => [...all, ...(p.days || [])], [])
                };

                const toolCallMsg = {
                    role: 'tool_call',
                    content: `Capable is designing Phase ${nextPhaseIdx + 1}: ${newPhase.title} (${newPhase.days.length} days)...`,
                    status: 'running'
                };
                
                setMessages(prev => [...prev, toolCallMsg]);

                await new Promise(resolve => setTimeout(resolve, 2200));

                const chatPromptMessages = [
                    ...newMessages,
                    {
                        role: 'system',
                        content: `[DEVELOPER NOTE: The roadmap has just been expanded with Phase ${nextPhaseIdx + 1}: "${newPhase.title}" (Days ${newPhase.days[0].day} to ${newPhase.days[newPhase.days.length - 1].day}). Please write a warm, encouraging response congratulating the user on starting this phase. Describe in a detailed paragraph what has been generated (the phase title, days, and core objective), explain that they can see it stacked above the previous phase on their canvas, and explicitly mention that the color theme of this new phase has been set to match the initial phase exactly to keep the venture roadmap visually unified and brand-consistent. Write this as a solid, encouraging co-founder paragraph.]`
                    }
                ];

                const response = await mentorChat(
                    project?.data?.companyName || project?.title || 'My Venture',
                    updatedRoadmap,
                    chatPromptMessages,
                    updatedRoadmap.days?.filter(d => d.tasks?.every(t => t.completed))?.map(d => d.day) || [],
                    newPhase.days[0].day
                );

                const endTime = Date.now();
                const duration = ((endTime - startTime) / 1000).toFixed(1);

                const replyText = response?.message || response?.reply || response?.content || `Phase ${nextPhaseIdx + 1} has been generated.`;

                const finalMessages = [
                    ...newMessages,
                    { role: 'tool_call', content: `Phase ${nextPhaseIdx + 1} structured`, status: 'completed', duration: duration },
                    {
                        role: 'assistant',
                        content: replyText,
                        isNew: true
                    }
                ];

                setMessages(finalMessages);
                setAiResponding(false);

                setProject(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        data: {
                            ...prev.data,
                            roadmap: updatedRoadmap,
                            chats: finalMessages
                        }
                    };
                });

                await ProjectStorage.updateData(projectId, {
                    chats: finalMessages,
                    roadmap: updatedRoadmap
                });

                setActiveTab('navigator');
                const firstDayOfNewPhase = newPhase.days[0].day;
                setSelectedDay(firstDayOfNewPhase);
                setFocusDayNum(firstDayOfNewPhase);
                setExpandedDays(prev => ({ ...prev, [firstDayOfNewPhase]: true }));
                setTimeout(() => {
                    roadmapCanvasRef.current?.centerOnDayNode(firstDayOfNewPhase, 1.2);
                }, 100);

            } catch (err) {
                console.error("Failed to generate next phase:", err);
                const fallbackReply = "I encountered an issue generating the next phase structure. Please try again.";
                const finalMessages = [
                    ...newMessages,
                    {
                        role: 'assistant',
                        content: fallbackReply,
                        isNew: true
                    }
                ];
                setMessages(finalMessages);
                setAiResponding(false);
                await ProjectStorage.updateData(projectId, { chats: finalMessages }).catch(console.error);
            }
            return;
        }

        // Standard chat response
        try {
            const startTime = Date.now();

            const response = await mentorChat(
                project?.data?.companyName || project?.title || 'My Venture',
                project?.data?.roadmap || null,
                newMessages,
                project?.data?.roadmap?.days?.filter(d => d.tasks?.every(t => t.completed))?.map(d => d.day) || [],
                selectedDay
            );
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            const replyText = response?.message || response?.reply || response?.content || "I see. Let's continue building the strategy.";
            const updatedMessages = [
                ...newMessages,
                {
                    role: 'assistant',
                    agent: (project?.data?.roadmap) ? undefined : 'onboarding_agent',
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
                    agent: (project?.data?.roadmap) ? undefined : 'onboarding_agent',
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

    return (
        <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden relative font-sans">
            {/* Left Container (Workspace canvas + header) */}
            <div className="flex-1 h-full flex flex-col min-w-0">
                {/* Top Header */}
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

                        <div className="h-6 w-[1px] bg-zinc-300/60 shrink-0" />

                        <div className="flex flex-col select-none min-w-0">
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

                    {/* Middle Options Tab */}
                    <div className={`relative flex items-center bg-white p-1 rounded-2xl border border-[#E4E4E7] shadow-sm transition-all duration-700 ease-out transform ${isReportValidated
                        ? 'translate-y-0 opacity-100 delay-300'
                        : '-translate-y-20 opacity-0 pointer-events-none'
                        }`}>
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

                    {/* Right Side Control Bar */}
                    <div className={`flex items-center gap-4 transition-all duration-700 ease-out transform ${isReportValidated
                        ? 'translate-y-0 opacity-100 delay-500'
                        : '-translate-y-20 opacity-0 pointer-events-none'
                        }`}>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="btn-primary !py-2 !px-5 !rounded-xl !text-sm cursor-pointer"
                        >
                            Upgrade
                        </button>

                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                            title={isDarkMode ? "Light Mode" : "Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

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
                                <RoadmapCanvas
                                    ref={roadmapCanvasRef}
                                    project={project}
                                    isDarkMode={isDarkMode}
                                    focusDayNum={focusDayNum}
                                    setFocusDayNum={setFocusDayNum}
                                    selectedDay={selectedDay}
                                    setSelectedDay={setSelectedDay}
                                    expandedDays={expandedDays}
                                    setExpandedDays={setExpandedDays}
                                    handleToggleDayExpand={handleToggleDayExpand}
                                    handleToggleRoadmapTask={handleToggleRoadmapTask}
                                    activeTab={activeTab}
                                />
                            )}

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

            {/* Right Side Sidebar */}
            <div className="my-[5px] mr-[5px] w-[400px] h-[calc(100vh-10px)] bg-white rounded-[1rem] border border-[#D1D5DB] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.03),_0_20px_50px_rgba(0,0,0,0.05)] flex flex-col relative px-0 pb-3.5 pt-0 shrink-0">
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
                                <ValidationReport
                                    project={project}
                                    isValidating={isValidating}
                                    validationSeconds={validationSeconds}
                                    setActiveRightTab={setActiveRightTab}
                                />
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
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white via-white/70 to-transparent pointer-events-none z-10" />
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none z-10" />
                                    </>
                                )}

                                <div className={`flex-1 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'} custom-scrollbar min-h-0 flex flex-col justify-between`}>
                                    {messages.length === 0 ? (
                                        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 select-none">
                                            <LogoIcon className="w-20 h-20 opacity-10 mb-6" style={{ filter: "brightness(0)" }} />
                                            <h3 className="text-2xl font-medium text-[#18181B] leading-snug tracking-tight whitespace-pre-line">
                                                Tell me more about your{"\n"}Idea/Business
                                            </h3>
                                        </div>
                                    ) : (
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
                                                            <div key={i} className={`flex flex-col w-full px-1 relative group ${getMessageSpacing(i, messages)}`}>
                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                    <LogoIcon className="w-[15px] h-[15px] shrink-0" style={{ filter: "brightness(0)", opacity: 0.7 }} />
                                                                    <span className="text-[#737373] text-[12px] font-bold font-sans">Capable</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 px-1 py-1 animate-in fade-in duration-200">
                                                                    <GitCommit className={`text-zinc-400 rotate-90 ${msg.status === 'running' ? 'animate-pulse' : ''}`} size={15} />
                                                                    {msg.status === 'running' ? (
                                                                        <RunningToolText content={msg.content} />
                                                                    ) : (
                                                                        <span className="text-[#A3A3A3] font-medium text-[13px]">
                                                                            Tool Called: {msg.content} {msg.duration ? `(${msg.duration}s)` : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
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
                                                                                                    {isAnswered ? (
                                                                                                        <span className="absolute top-3 right-9 text-[8.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]/60 shadow-sm">
                                                                                                            Answered
                                                                                                        </span>
                                                                                                    ) : (
                                                                                                        <span className="absolute top-3 right-9 text-[8.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]/60 shadow-sm">
                                                                                                            Unanswered
                                                                                                        </span>
                                                                                                    )}

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
                    const hideInput = activeRightTab !== 'chat';

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
                                            : onboardingState === 'asking_questions'
                                                ? "Ask your mentor or type a goal (e.g., earn $100)..."
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
