import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateActionPlan, mentorChat } from '../services/ai';
import { Send, Plus, History, Trash2, X, ArrowLeft, Check, ChevronLeft, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import ProjectHeader from '../components/ProjectHeader';

const TaskPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [idea, setIdea] = useState('');
    const [completedDays, setCompletedDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

    // AI Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);

    useEffect(() => {
        const loadPlan = async () => {
            // Only use mock data for hardcoded dummy projects (proj_1, proj_2, etc.)
            if (id && id.startsWith('proj_') && !id.startsWith('user_proj_')) {
                setIdea(`Mock Project: ${id}`);
                setPlan({
                    short_title: `Project ${id.split('_')[1]}`,
                    phases: [{ id: 'ph1', name: 'Discovery', color: '#305eff' }],
                    days: [
                        { day: 1, phase_id: 'ph1', task: 'Initial Research', details: ['Check competitors', 'Define scope'], deliverable: 'Research Doc' },
                        { day: 2, phase_id: 'ph1', task: 'User Interviews', details: ['Interview 5 users', 'Record feedback'], deliverable: 'Interview Notes' },
                        { day: 3, phase_id: 'ph1', task: 'Market Analysis', details: ['Analyze TAM/SAM/SOM', 'Identify key players'], deliverable: 'Market Report' },
                    ]
                });
                setSelectedDay({ day: 1, phase_id: 'ph1', task: 'Initial Research', details: ['Check competitors', 'Define scope'], deliverable: 'Research Doc' });
                setChatMessages([{ role: 'assistant', content: "I'm your Capable mentor for this mock project. Ask me anything!" }]);
                setLoading(false);
                return;
            }

            // REAL DATA LOADING
            const cachedIdea = localStorage.getItem('userIdea');
            const cachedReport = localStorage.getItem('analysisReport');
            const cachedAnswers = localStorage.getItem('userAnswers');

            if (!cachedIdea || !cachedReport) {
                navigate('/');
                return;
            }

            setIdea(cachedIdea);
            const savedProgress = localStorage.getItem(`progress_${cachedIdea}`);
            if (savedProgress) setCompletedDays(JSON.parse(savedProgress));

            // Load Chat Sessions
            const savedSessions = localStorage.getItem(`chat_sessions_${cachedIdea}`);
            let initialSessions = [];
            if (savedSessions) {
                try {
                    initialSessions = JSON.parse(savedSessions);
                    setSessions(initialSessions);
                } catch (e) {
                    console.error("Failed to parse sessions", e);
                }
            }

            // Chat Initialization
            if (initialSessions.length === 0) {
                const firstSession = {
                    id: Date.now().toString(),
                    title: 'Strategic Guidance',
                    messages: [{ role: 'assistant', content: "I'm your Capable mentor. Ask me anything about your current task or strategy!" }],
                    timestamp: Date.now(),
                    isPinned: false
                };
                setSessions([firstSession]);
                setActiveSessionId(firstSession.id);
                setChatMessages(firstSession.messages);
                localStorage.setItem(`chat_sessions_${cachedIdea}`, JSON.stringify([firstSession]));
            } else {
                const active = initialSessions.sort((a, b) => b.timestamp - a.timestamp)[0];
                setActiveSessionId(active.id);
                setChatMessages(active.messages || []);
            }

            const cachedPlan = localStorage.getItem('actionPlan');
            if (cachedPlan) {
                try {
                    const parsed = JSON.parse(cachedPlan);
                    if (parsed.days && parsed.days.length > 0) {
                        setPlan(parsed);
                        setSelectedDay(parsed.days[0]);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem('actionPlan');
                }
            }

            try {
                const result = await generateActionPlan(cachedIdea, JSON.parse(cachedReport), cachedAnswers);
                setPlan(result);
                setSelectedDay(result.days[0]);
                localStorage.setItem('actionPlan', JSON.stringify(result));
                setLoading(false);
            } catch (error) {
                console.error("Failed to generate plan", error);
                setLoading(false);
            }
        };

        loadPlan();
    }, [navigate, id]);

    // Save chat sessions
    useEffect(() => {
        if (idea && chatMessages.length > 0 && activeSessionId) {
            setSessions(prev => {
                const updated = prev.map(s =>
                    s.id === activeSessionId
                        ? { ...s, messages: chatMessages, timestamp: Date.now() }
                        : s
                );
                localStorage.setItem(`chat_sessions_${idea}`, JSON.stringify(updated));
                return updated;
            });
        }
    }, [chatMessages, activeSessionId, idea]);

    const switchSession = (sessionId) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setActiveSessionId(sessionId);
            setChatMessages(session.messages);
            setIsHistoryOpen(false);
        }
    };

    const createNewSession = () => {
        const newSession = {
            id: Date.now().toString(),
            title: `New Chat`,
            messages: [{ role: 'assistant', content: `How can I help with your next step?` }],
            timestamp: Date.now(),
            isPinned: false,
            needsAutoTitle: true
        };
        const updated = [newSession, ...sessions];
        setSessions(updated);
        setActiveSessionId(newSession.id);
        setChatMessages(newSession.messages);
        localStorage.setItem(`chat_sessions_${idea}`, JSON.stringify(updated));
        setIsHistoryOpen(false);
    };

    const toggleDay = (dayNum) => {
        const newCompleted = completedDays.includes(dayNum)
            ? completedDays.filter(d => d !== dayNum)
            : [...completedDays, dayNum];
        setCompletedDays(newCompleted);
        localStorage.setItem(`progress_${idea}`, JSON.stringify(newCompleted));

        if (!completedDays.includes(dayNum) && dayNum < plan.days.length) {
            const nextDay = plan.days.find(d => d.day === dayNum + 1);
            if (nextDay) {
                setTimeout(() => setSelectedDay(nextDay), 300);
            }
        }
    };

    const goToPrevTask = () => {
        if (selectedDay && selectedDay.day > 1) {
            const prevTask = plan.days.find(d => d.day === selectedDay.day - 1);
            if (prevTask) setSelectedDay(prevTask);
        }
    };

    const goToNextTask = () => {
        if (selectedDay && selectedDay.day < plan.days.length) {
            const nextTask = plan.days.find(d => d.day === selectedDay.day + 1);
            if (nextTask) setSelectedDay(nextTask);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-blue rounded-full animate-spin"></div>
                <span className="text-slate-500 text-sm font-medium">Building your roadmap...</span>
            </div>
        );
    }

    const isPlanValid = plan && Array.isArray(plan.days) && Array.isArray(plan.phases);

    if ((!plan || !isPlanValid) && !loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center px-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <AlertCircle size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-display font-normal text-slate-900 mb-2">Generation Failed</h2>
                    <p className="text-slate-500 text-sm mb-8">
                        We couldn't generate a valid roadmap. Please try again.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                localStorage.removeItem('actionPlan');
                                window.location.reload();
                            }}
                            className="w-full py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-brand-blue transition-colors"
                        >
                            Retry Generation
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 text-slate-500 hover:text-slate-900 font-medium transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const progress = plan.days?.length > 0 ? Math.round((completedDays.length / plan.days.length) * 100) : 0;
    const currentPhase = selectedDay ? plan.phases.find(p => p.id === selectedDay.phase_id) : plan.phases[0];

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-8">
            <ProjectHeader activeStep="task" onBack={() => navigate('/dashboard')} />

            {/* Header Info */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-brand-blue uppercase">Active Venture</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-normal text-slate-900 leading-none">
                            {plan?.short_title || idea.split(' ').slice(0, 4).join(' ')}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Progress */}
                    <div className="flex-1 md:w-48">
                        <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-blue transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setConfirmModal({
                                show: true,
                                title: 'Delete Project',
                                message: 'Are you sure? This action cannot be undone.',
                                onConfirm: () => { localStorage.clear(); navigate('/'); }
                            });
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Project"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)] min-h-[600px]">

                {/* Left: Task Details (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col relative overflow-hidden">
                        {selectedDay ? (
                            <>
                                <div className="mb-6 relative">
                                    <div className="absolute -top-4 -left-4 text-8xl font-serif italic text-slate-100/50 select-none pointer-events-none">
                                        {selectedDay.day}
                                    </div>
                                    <div className="relative pt-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 mb-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPhase?.color || '#305eff' }}></div>
                                            {currentPhase?.name || 'General'}
                                        </div>
                                        <div className="text-4xl font-serif italic text-slate-900">Day {selectedDay.day}</div>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-display font-normal text-slate-900 mb-6 leading-tight">
                                    {selectedDay.task}
                                </h2>

                                <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-6">
                                    {selectedDay.details && (
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase">Tactical Steps</h3>
                                            <ul className="space-y-3">
                                                {selectedDay.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-2 flex-shrink-0"></span>
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Deliverable</h3>
                                        <p className="text-sm text-slate-700 italic">
                                            {selectedDay.deliverable}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <button
                                        onClick={() => setChatInput(`Help me with Day ${selectedDay.day}: ${selectedDay.task}`)}
                                        className="w-full py-3 bg-blue-50 text-brand-blue rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                                    >
                                        <Sparkles size={16} />
                                        Ask Mentor for Help
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={goToPrevTask}
                                            disabled={selectedDay.day <= 1}
                                            className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        <button
                                            onClick={() => toggleDay(selectedDay.day)}
                                            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${completedDays.includes(selectedDay.day)
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800'
                                                }`}
                                        >
                                            {completedDays.includes(selectedDay.day) ? (
                                                <>Completed <Check size={16} /></>
                                            ) : 'Mark Complete'}
                                        </button>

                                        <button
                                            onClick={goToNextTask}
                                            disabled={selectedDay.day >= plan.days.length}
                                            className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Select a task to begin
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Map (4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase mb-6 border-b border-slate-100 pb-4">
                        Roadmap
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-6">
                        <div className="grid grid-cols-10 gap-2">
                            {plan.days.map((d) => {
                                const isCompleted = completedDays.includes(d.day);
                                const isSelected = selectedDay?.day === d.day;
                                const phase = plan.phases.find(p => p.id === d.phase_id);
                                const phaseColor = phase?.color || '#305eff';

                                return (
                                    <button
                                        key={d.day}
                                        onClick={() => setSelectedDay(d)}
                                        style={{
                                            backgroundColor: isSelected ? phaseColor : isCompleted ? `${phaseColor}20` : 'transparent',
                                            borderColor: phaseColor,
                                            color: isSelected ? '#fff' : phaseColor
                                        }}
                                        className={`aspect-square flex items-center justify-center text-xs font-bold rounded-lg border-2 transition-all hover:scale-105 ${isSelected ? 'shadow-lg z-10' : ''
                                            }`}
                                    >
                                        {d.day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phase Statistics */}
                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Phase Progress</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {plan.phases.map(p => {
                                const phaseDays = plan.days.filter(d => d.phase_id === p.id);
                                const completedPhaseDays = phaseDays.filter(d => completedDays.includes(d.day));
                                const total = phaseDays.length;
                                const done = completedPhaseDays.length;
                                const percent = total > 0 ? (done / total) * 100 : 0;

                                return (
                                    <div key={p.id} className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-medium truncate mr-2" style={{ color: p.color }}>{p.name}</span>
                                            <span className="text-slate-400">{done}/{total}</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-500"
                                                style={{ width: `${percent}%`, backgroundColor: p.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Chat (4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">

                    {/* Chat Sidebar Overlay */}
                    {isHistoryOpen && (
                        <div className="absolute inset-0 z-20 flex bg-white/90 backdrop-blur-sm">
                            <div className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-xl animate-slide-in-left">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase">History</h3>
                                    <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-900">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    <button
                                        onClick={createNewSession}
                                        className="w-full flex items-center gap-2 p-3 bg-slate-50 text-brand-blue font-medium text-xs rounded-xl hover:bg-blue-50 transition-colors mb-2"
                                    >
                                        <Plus size={14} /> New Chat
                                    </button>
                                    {sessions.map(s => (
                                        <div key={s.id}
                                            onClick={() => switchSession(s.id)}
                                            className={`p-3 rounded-xl cursor-pointer text-xs transition-colors ${activeSessionId === s.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <div className="font-medium truncate mb-1">{s.title || 'Untitled'}</div>
                                            <div className="text-slate-400 text-[10px]">{new Date(s.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1" onClick={() => setIsHistoryOpen(false)} />
                        </div>
                    )}

                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                <History size={18} />
                            </button>
                            <div>
                                <h3 className="text-sm font-medium text-slate-900">Capable Mentor</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] text-slate-500 font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={createNewSession} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30 flex flex-col-reverse">
                        <div />
                        {chatMessages.slice().reverse().map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                    ? 'bg-slate-900 text-white rounded-br-none'
                                    : 'bg-white text-slate-600 border border-slate-100 rounded-bl-none'
                                    }`}>
                                    {m.content.split('\n').map((line, idx) => (
                                        <p key={idx} className={`min-h-[1em] ${line.startsWith('-') ? 'pl-2' : ''}`}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!chatInput.trim()) return;

                                const userMsg = { role: 'user', content: chatInput };
                                setChatMessages(prev => [...prev, userMsg]);
                                setChatInput('');

                                try {
                                    const response = await mentorChat(idea, plan, [...chatMessages, userMsg], completedDays, selectedDay?.day);
                                    setChatMessages(prev => [...prev, { role: 'assistant', content: response.message }]);

                                    // Auto-title
                                    if (sessions.find(s => s.id === activeSessionId)?.needsAutoTitle) {
                                        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: chatInput.substring(0, 30), needsAutoTitle: false } : s));
                                    }
                                } catch (error) {
                                    setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
                                }
                            }}
                            className="relative"
                        >
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask for advice..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-brand-blue rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {
                confirmModal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
                            <h3 className="text-lg font-medium text-slate-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-slate-500 text-sm mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TaskPage;
