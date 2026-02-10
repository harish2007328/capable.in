import React, { useState, useRef, useEffect } from 'react';
import { mentorChat } from '../services/ai';
import { Send, Sparkles, Menu, Edit, Pin, MessageSquare, Zap, X, Trash2, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MentorChat = ({ idea, plan, completedDays = [], currentTaskId, onSelectTask, projectId }) => {
    const storageKey = `mentor_sessions_${projectId}`;

    // Session Management State
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);

        // Initial default session
        const initialId = Date.now().toString();
        return [{
            id: initialId,
            title: idea || "Initial Strategy",
            messages: [{ role: 'assistant', type: 'text', content: "I'm ready to help you execute. Which task should we tackle first?" }],
            isPinned: false,
            timestamp: Date.now()
        }];
    });

    const [activeSessionId, setActiveSessionId] = useState(() => {
        return sessions[0]?.id || Date.now().toString();
    });

    const [input, setInput] = useState('');
    const [mentions, setMentions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Event listener for adding task mentions from TaskView
    useEffect(() => {
        const handleMention = (e) => {
            const { id, title } = e.detail;
            if (!mentions.some(m => m.id === id)) {
                setMentions(prev => [...prev, { id, title }]);
            }
            // Focus input
            document.getElementById('mentor-chat-input')?.focus();
        };

        window.addEventListener('add-task-mention', handleMention);
        return () => window.removeEventListener('add-task-mention', handleMention);
    }, [mentions]);

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem(storageKey, JSON.stringify(sessions));
    }, [sessions, storageKey]);

    const handleCreateSession = () => {
        const newId = Date.now().toString();
        const newSession = {
            id: newId,
            title: `Insight Session ${sessions.length + 1}`,
            messages: [{ role: 'assistant', type: 'text', content: "New session started. How can I assist with your strategy today?" }],
            isPinned: false,
            timestamp: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
        setIsOpen(false);
    };

    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        if (sessions.length === 1) {
            alert("At least one session must remain.");
            return;
        }
        if (window.confirm("Delete this chat session?")) {
            const nextSessions = sessions.filter(s => s.id !== sessionId);
            setSessions(nextSessions);
            if (activeSessionId === sessionId) {
                setActiveSessionId(nextSessions[0].id);
            }
        }
    };

    const handleTogglePin = (e, sessionId) => {
        e.stopPropagation();
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
        ));
    };

    const sendQuery = async (queryText) => {
        if (loading) return;

        // Construct full message with mention context if any
        let fullQuery = queryText;
        if (mentions.length > 0) {
            const mentionContext = mentions.map(m => `@${m.id} (${m.title})`).join(', ');
            fullQuery = `[Context tasks: ${mentionContext}] ${queryText}`;
        }

        const userMsg = { role: 'user', type: 'text', content: queryText, mentions: [...mentions] };

        // Optimistic UI Update for specific session
        setSessions(prev => prev.map(s =>
            s.id === activeSessionId
                ? { ...s, messages: [...s.messages, userMsg], timestamp: Date.now() }
                : s
        ));

        setMentions([]); // Clear mentions after sending
        setLoading(true);

        try {
            const response = await mentorChat(idea, plan, [...activeSession.messages.map(m => {
                // Attach context to last message if it's from user to help AI
                return m.role === 'user' ? { ...m, content: m.mentions?.length ? `[Context tasks: ${m.mentions.map(mt => `@${mt.id}`).join(', ')}] ${m.content}` : m.content } : m;
            }), { role: 'user', content: fullQuery }], completedDays, currentTaskId);
            const assistantMessages = [{ role: 'assistant', type: 'text', content: response.message }];
            if (response.taskEdit) assistantMessages.push({ role: 'assistant', type: 'action', actionType: 'edit', data: response.taskEdit });
            if (response.tasksAdd) assistantMessages.push({ role: 'assistant', type: 'action', actionType: 'add', data: response.tasksAdd });

            setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, ...assistantMessages] }
                    : s
            ));
        } catch (e) {
            setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, { role: 'assistant', type: 'text', content: "Sorry, I lost my connection." }] }
                    : s
            ));
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!input.trim() && mentions.length === 0) || loading) return;
        const val = input;
        setInput('');
        await sendQuery(val);
    };

    // Sorted Sessions: Pinned first, then latest
    const sortedSessions = [...sessions].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
    });

    return (
        <div className="flex h-full bg-white relative overflow-hidden">
            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 bg-slate-50/30 transition-all duration-500 ease-in-out ${isOpen ? 'blur-sm opacity-40 scale-[0.99]' : ''}`}>
                {/* Header */}
                <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white z-20 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} className="text-[#0066CC]" /> AI Mentor
                        </span>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 group"
                        title="Menu"
                    >
                        <Menu size={18} className="group-hover:text-slate-600" />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
                    {activeSession.messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.type === 'action' ? (
                                <div className="max-w-[85%] w-full">
                                    {m.actionType === 'edit' && (
                                        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-4 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                                                <Zap size={12} fill="currentColor" />
                                                Strategy Update
                                            </div>
                                            <div className="text-sm font-semibold text-slate-800">{m.data.newTask}</div>
                                        </div>
                                    )}
                                    {m.actionType === 'add' && (
                                        <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-4 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
                                                <Sparkles size={12} fill="currentColor" />
                                                Refining Plan
                                            </div>
                                            <div className="text-xs text-slate-500">{m.data.tasks.length} insights added.</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={`
                                    max-w-[88%] p-4 text-sm leading-relaxed shadow-sm
                                    ${m.role === 'user'
                                        ? 'bg-[#0066CC] text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
                                    }
                                `}>
                                    <div className="markdown-content prose prose-slate prose-sm max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => {
                                                    if (props.href && props.href.startsWith('task:')) {
                                                        const taskId = props.href.split(':')[1];
                                                        return (
                                                            <button
                                                                onClick={() => onSelectTask && onSelectTask(taskId)}
                                                                className="text-[#0066CC] font-bold hover:underline underline-offset-2 transition-colors"
                                                            >
                                                                {props.children}
                                                            </button>
                                                        );
                                                    }
                                                    return (
                                                        <a
                                                            {...props}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#0066CC] font-bold hover:underline decoration-blue-200"
                                                        />
                                                    );
                                                },
                                                table: ({ node, ...props }) => (
                                                    <div className="my-4 overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm custom-scrollbar">
                                                        <table className="w-full text-left border-collapse min-w-[300px]" {...props} />
                                                    </div>
                                                ),
                                                thead: ({ node, ...props }) => (
                                                    <thead className="bg-slate-50/50 border-b border-slate-100" {...props} />
                                                ),
                                                th: ({ node, ...props }) => (
                                                    <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" {...props} />
                                                ),
                                                td: ({ node, ...props }) => (
                                                    <td className="px-4 py-2.5 text-xs text-slate-600 border-b border-slate-50/50 last:border-0" {...props} />
                                                )
                                            }}
                                        >
                                            {m.content
                                                .replace(/@(\d+)/g, '[Task $1](task:$1)')
                                                .replace(/(?<!\[)(Task|Step|Day)\s+(\d+)/gi, '[$1 $2](task:$2)')
                                            }
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex gap-2 items-center">
                                <span className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    {/* Mention Chips */}
                    {mentions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            {mentions.map(m => (
                                <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 bg-[#0066CC]/5 border border-[#0066CC]/10 rounded-lg text-[#0066CC] animate-in zoom-in-95 duration-150">
                                    <Target size={10} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Day {m.id}</span>
                                    <button
                                        onClick={() => setMentions(prev => prev.filter(item => item.id !== m.id))}
                                        className="hover:bg-[#0066CC]/10 rounded-full p-0.5 transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="relative flex items-center bg-white shadow-sm border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-[#0066CC]/10 transition-all">
                        <input
                            type="text"
                            id="mentor-chat-input"
                            value={input}
                            onChange={(e) => {
                                const val = e.target.value;
                                setInput(val);
                                // If @ is typed at the end, we could trigger a picker, but for now we'll just handle clicks
                            }}
                            placeholder="Message mentor..."
                            className="flex-1 bg-transparent border-none py-3 pl-5 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={(!input.trim() && mentions.length === 0) || loading}
                            className="absolute right-2 p-1.5 bg-[#0066CC] text-white rounded-xl hover:bg-[#0052a3] shadow-md shadow-blue-500/10 disabled:opacity-20 transition-all font-bold"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            </div>

            {/* MODERN SIDEBAR DRAWER (Light Theme) */}
            {isOpen && (
                <>
                    <div className="absolute inset-0 z-40 bg-slate-900/5 backdrop-blur-sm transition-all animate-in fade-in duration-150" onClick={() => setIsOpen(false)} />

                    <div className="absolute top-0 right-0 h-full w-[280px] bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col select-none">
                        {/* Sidebar Header */}
                        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white z-20 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-[#0066CC]" /> Sessions
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 group"
                                title="Close"
                            >
                                <X size={18} className="group-hover:text-slate-600" />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-6 custom-scrollbar">
                            {/* New Chat Button */}
                            <button
                                onClick={handleCreateSession}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all font-medium text-sm group"
                            >
                                <Edit size={16} className="text-slate-400 group-hover:text-[#0066CC]" />
                                New chat
                            </button>

                            {/* Chats Section */}
                            <section className="space-y-1">
                                <h4 className="px-3 pb-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Recent Chats</h4>
                                <div className="space-y-1">
                                    {sortedSessions.map(session => (
                                        <div
                                            key={session.id}
                                            onClick={() => { setActiveSessionId(session.id); setIsOpen(false); }}
                                            className={`
                                                group relative px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                                                ${activeSessionId === session.id
                                                    ? 'bg-blue-50/50 border-blue-100 text-[#0066CC]'
                                                    : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <MessageSquare size={14} className={activeSessionId === session.id ? 'text-[#0066CC]' : 'text-slate-400'} />
                                                <span className="text-sm font-medium truncate leading-tight">
                                                    {session.title}
                                                </span>
                                            </div>

                                            {/* Action Accessibility Bits */}
                                            <div className={`flex items-center gap-1.5 transition-opacity ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                <button
                                                    onClick={(e) => handleTogglePin(e, session.id)}
                                                    className={`p-1 rounded-md transition-colors ${session.isPinned ? 'text-[#0066CC] bg-blue-100' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                                                    title={session.isPinned ? "Unpin chat" : "Pin chat"}
                                                >
                                                    <Pin size={12} fill={session.isPinned ? "currentColor" : "none"} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 border-t border-slate-50 flex items-center gap-2 text-slate-200">
                            <Zap size={10} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Operations Intelligence</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MentorChat;
