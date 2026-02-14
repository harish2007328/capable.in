import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Search,
    Zap,
    Clock,
    CheckCircle,
    TrendingUp,
    User,
    Shield,
    LogOut,
    Trash2,
    Folder,
    Globe,
    Cpu,
    Flame,
    Calendar
} from 'lucide-react';
import { ProjectStorage } from '../services/projectStorage';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, updateUser } = useAuth();

    const [activeSection, setActiveSection] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Settings state
    const [settingsState, setSettingsState] = useState({
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        title: user?.user_metadata?.title || '',
        bio: user?.user_metadata?.bio || '',
        website: user?.user_metadata?.website || '',
        twitter: user?.user_metadata?.twitter || '',
        researchDepth: user?.user_metadata?.researchDepth || 'Deep',
        autoResearch: user?.user_metadata?.autoResearch !== false, // Default to true
        isSaving: false
    });

    useEffect(() => {
        const load = async () => {
            await ProjectStorage.init();
            const allProjects = await ProjectStorage.getAll();
            setProjects(allProjects);
        };
        load();

        if (user) {
            setSettingsState({
                name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
                title: user?.user_metadata?.title || '',
                bio: user?.user_metadata?.bio || '',
                website: user?.user_metadata?.website || '',
                twitter: user?.user_metadata?.twitter || '',
                researchDepth: user?.user_metadata?.researchDepth || 'Deep',
                autoResearch: user?.user_metadata?.autoResearch !== false,
                isSaving: false
            });
        }

        const hash = location.hash.replace('#', '');
        if (['projects', 'metrics', 'settings'].includes(hash)) {
            setActiveSection(hash);
        }
    }, [location.hash, user]);

    const handleSaveSettings = async () => {
        setSettingsState(s => ({ ...s, isSaving: true }));
        try {
            await updateUser({
                data: {
                    full_name: settingsState.name,
                    title: settingsState.title,
                    bio: settingsState.bio,
                    website: settingsState.website,
                    twitter: settingsState.twitter,
                    researchDepth: settingsState.researchDepth,
                    autoResearch: settingsState.autoResearch
                }
            });
            alert('Settings saved to database!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Error saving settings. Please try again.');
        } finally {
            setSettingsState(s => ({ ...s, isSaving: false }));
        }
    };

    const handleClearData = async () => {
        if (confirm('Are you sure? This will delete all projects from the SERVER and this browser PERMANENTLY.')) {
            await ProjectStorage.clearAll();
            window.location.reload();
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.data?.idea || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProjectClick = (id) => {
        ProjectStorage.setActiveId(id);
        navigate(`/project/${id}`);
    };

    const handleDeleteProject = (e, id) => {
        e.stopPropagation();
        setDeleteTargetId(id);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        await ProjectStorage.delete(deleteTargetId);
        const allProjects = await ProjectStorage.getAll();
        setProjects(allProjects);
        setDeleteTargetId(null);
    };

    // Sync modal state with global layout (e.g. for sidebar blur)
    useEffect(() => {
        const isModalOpen = !!deleteTargetId;
        window.dispatchEvent(new CustomEvent('modal-state-changed', {
            detail: { isOpen: isModalOpen }
        }));
    }, [deleteTargetId]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            {/* Minimal Fixed Header */}
            <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-10 fixed top-0 left-0 lg:left-64 right-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
                        className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <h1 className="text-xs font-bold text-slate-900">
                        {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Founder'}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-[10px] font-bold text-orange-600">{(() => { const activityDates = new Set(); projects.forEach(p => { if (p.createdAt) activityDates.add(new Date(p.createdAt).toDateString()); const progress = p.data?.progress || {}; Object.values(progress).forEach(val => { if (val && typeof val === 'string') activityDates.add(new Date(val).toDateString()); else if (val === true) activityDates.add(new Date().toDateString()); }); }); let streak = 0; const today = new Date(); for (let i = 0; i < 365; i++) { const d = new Date(today); d.setDate(d.getDate() - i); if (activityDates.has(d.toDateString()) || i === 0) streak++; else break; } return Math.max(streak, 1); })()}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 hidden sm:block">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="w-full px-4 md:px-10 pt-20 max-w-[1440px] mx-auto overflow-x-hidden">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeSection === 'projects' && (
                        <div>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Ventures</h2>
                                    <p className="text-sm text-slate-500 font-medium">Manage and track your active execution plans.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative w-full sm:w-72 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0066CC] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search ventures..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0066CC] transition-all placeholder:text-slate-300 shadow-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0066CC] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#0052a3] transition-all shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Plus size={18} />
                                        New Venture
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredProjects.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div
                                            onClick={() => handleProjectClick(project.id)}
                                            className="p-8 h-full flex flex-col relative overflow-hidden group cursor-pointer border border-slate-100 bg-white hover:border-[#0066CC]/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all rounded-lg"
                                        >
                                            <div className="mb-4 h-6 flex items-center justify-between">
                                                {/* Phase badge */}
                                                {(() => {
                                                    const d = project.data || {};
                                                    const progress = d.progress || {};
                                                    const totalTasks = d.plan?.days?.length || 0;
                                                    const doneTasks = totalTasks > 0 ? d.plan.days.filter(t => progress[t.id]).length : 0;

                                                    let label, bg, text;
                                                    if (d.plan) {
                                                        label = `Execution · ${doneTasks}/${totalTasks}`;
                                                        bg = 'bg-emerald-50 border-emerald-100'; text = 'text-emerald-600';
                                                    } else if (d.report) {
                                                        label = 'Strategy';
                                                        bg = 'bg-blue-50 border-blue-100'; text = 'text-[#0066CC]';
                                                    } else if (d.questions?.length > 0) {
                                                        label = 'Discovery';
                                                        bg = 'bg-amber-50 border-amber-100'; text = 'text-amber-600';
                                                    } else {
                                                        label = 'Ideation';
                                                        bg = 'bg-slate-50 border-slate-100'; text = 'text-slate-400';
                                                    }
                                                    return (
                                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${bg} ${text}`}>
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
                                                <button
                                                    onClick={(e) => handleDeleteProject(e, project.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete venture"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-base font-black text-slate-800 mb-3 tracking-tight line-clamp-1">
                                                    {project.title || 'Untitled Venture'}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 font-medium line-clamp-3 leading-relaxed">
                                                    {project.data?.projectDescription || project.data?.idea || 'No description provided.'}
                                                </p>
                                            </div>

                                            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recently'}
                                                </span>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#0066CC] transition-colors">
                                                    Open Venture
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {filteredProjects.length === 0 && (
                                    <div className="col-span-full py-32 text-center bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <div className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] mb-4">No Ventures Found</div>
                                        <p className="text-slate-400 text-xs font-medium mb-8">Start your journey by creating a new execution plan.</p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="px-10 py-4 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0066CC] transition-all shadow-xl shadow-slate-200"
                                        >
                                            Start Your First Venture
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'metrics' && <MetricsView projects={projects} />}
                    {activeSection === 'settings' && (
                        <SettingsView
                            user={user}
                            logout={logout}
                            navigate={navigate}
                            state={settingsState}
                            setState={setSettingsState}
                            onSave={handleSaveSettings}
                            onClear={handleClearData}
                        />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {deleteTargetId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setDeleteTargetId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl border border-slate-100 p-6 max-w-[280px] w-full text-center"
                        >
                            <h3 className="text-sm font-black text-slate-900 mb-1">Delete Venture?</h3>
                            <p className="text-slate-400 text-[10px] mb-6 font-medium leading-relaxed">
                                This action is permanent and cannot be undone.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-2.5 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-[0.98]"
                                >
                                    Delete Permanently
                                </button>
                                <button
                                    onClick={() => setDeleteTargetId(null)}
                                    className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* --- Sub-Components --- */

const MetricsView = ({ projects }) => {
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());

    // ─── REAL DATA COMPUTATION ───

    // Get real task completion for a project (from data.progress + data.plan)
    const getRealCompletion = (project) => {
        const plan = project.data?.plan;
        const progress = project.data?.progress || {};
        if (!plan?.days || plan.days.length === 0) {
            // Fallback: pipeline stage check
            let score = 0;
            if (project.data?.idea) score += 20;
            if (project.data?.questions?.length > 0) score += 20;
            if (project.data?.answers) score += 20;
            if (project.data?.report) score += 20;
            if (project.data?.plan) score += 20;
            return Math.min(score, 100);
        }
        const total = plan.days.length;
        const completed = plan.days.filter(d => progress[d.id]).length;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    // Aggregate stats
    const totalTasks = projects.reduce((sum, p) => sum + (p.data?.plan?.days?.length || 0), 0);
    const completedTasks = projects.reduce((sum, p) => {
        const progress = p.data?.progress || {};
        return sum + Object.values(progress).filter(Boolean).length;
    }, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const reportsGenerated = projects.filter(p => p.data?.report).length;
    const plansActive = projects.filter(p => p.data?.plan).length;
    const totalChats = projects.reduce((sum, p) => {
        const chats = p.data?.chats;
        if (Array.isArray(chats)) return sum + chats.length;
        if (chats && typeof chats === 'object') {
            return sum + Object.values(chats).reduce((s, session) => s + (Array.isArray(session) ? session.length : 0), 0);
        }
        return sum;
    }, 0);

    // Streak calculation (includes both creation and task completion activity)
    const getStreak = () => {
        const activityDates = new Set();
        projects.forEach(p => {
            if (p.createdAt) activityDates.add(new Date(p.createdAt).toDateString());
            // Extract actual completion dates from progress timestamps
            const progress = p.data?.progress || {};
            Object.values(progress).forEach(val => {
                if (val && typeof val === 'string') {
                    // ISO timestamp — extract the date
                    activityDates.add(new Date(val).toDateString());
                } else if (val === true) {
                    // Legacy boolean — count today as fallback
                    activityDates.add(new Date().toDateString());
                }
            });
        });
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            if (activityDates.has(d.toDateString()) || i === 0) streak++;
            else break;
        }
        return Math.max(streak, 1);
    };

    // Average completion (real)
    const avgCompletion = projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + getRealCompletion(p), 0) / projects.length)
        : 0;

    // Active days
    const activeDays = [...new Set(projects.map(p => p.createdAt ? new Date(p.createdAt).toDateString() : null).filter(Boolean))].length;

    // Phase progress across all projects
    const getPhaseProgress = () => {
        const phaseMap = {};
        projects.forEach(p => {
            const plan = p.data?.plan;
            const progress = p.data?.progress || {};
            if (!plan?.phases || !plan?.days) return;
            plan.phases.forEach(phase => {
                if (!phaseMap[phase.title || phase.name]) {
                    phaseMap[phase.title || phase.name] = { total: 0, completed: 0 };
                }
                const phaseDays = plan.days.filter(d => d.phase_id === phase.id);
                phaseMap[phase.title || phase.name].total += phaseDays.length;
                phaseMap[phase.title || phase.name].completed += phaseDays.filter(d => progress[d.id]).length;
            });
        });
        return Object.entries(phaseMap).map(([name, data]) => ({
            name,
            total: data.total,
            completed: data.completed,
            percent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
        }));
    };

    // Calendar
    const getMonthCalendar = () => {
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const activeDateStrings = projects
            .map(p => p.createdAt ? new Date(p.createdAt).toDateString() : null)
            .filter(Boolean);

        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(calYear, calMonth, d);
            const count = activeDateStrings.filter(ds => ds === date.toDateString()).length;
            const isToday = date.toDateString() === new Date().toDateString();
            cells.push({ day: d, count, isToday, date });
        }
        return cells;
    };

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
        else setCalMonth(calMonth - 1);
    };
    const nextMonth = () => {
        const now = new Date();
        if (calYear === now.getFullYear() && calMonth === now.getMonth()) return;
        if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
        else setCalMonth(calMonth + 1);
    };

    const streak = getStreak();
    const calendarCells = getMonthCalendar();
    const monthName = new Date(calYear, calMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const isCurrentMonth = calYear === new Date().getFullYear() && calMonth === new Date().getMonth();
    const phaseProgress = getPhaseProgress();
    const PHASE_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#3B82F6'];

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Metrics</h2>
                <p className="text-sm text-slate-500 font-medium">Real-time data from your ventures and execution plans.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-min">

                {/* Row 1: 4 Primary Stat Cards */}
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Streak</p>
                    <div className="flex items-center gap-1.5">
                        <Flame size={16} className="text-orange-500" />
                        <span className="text-lg font-black text-slate-900">{streak}</span>
                        <span className="text-[8px] text-slate-400 font-bold">days</span>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Ventures</p>
                    <p className="text-lg font-black text-slate-900">{projects.length}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Tasks Done</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">{completedTasks}</span>
                        <span className="text-[8px] text-slate-400 font-bold">/ {totalTasks}</span>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Completion</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-black ${completionRate >= 80 ? 'text-emerald-600' : completionRate >= 40 ? 'text-[#0066CC]' : 'text-slate-900'}`}>{completionRate}%</span>
                    </div>
                </div>

                {/* Row 2: Secondary Stats */}
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Reports</p>
                    <p className="text-lg font-black text-slate-900">{reportsGenerated}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Plans Active</p>
                    <p className="text-lg font-black text-slate-900">{plansActive}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">AI Chats</p>
                    <p className="text-lg font-black text-slate-900">{totalChats}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Active Days</p>
                    <p className="text-lg font-black text-slate-900">{activeDays}</p>
                </div>

                {/* Row 3: Calendar (2 cols) + Venture Progress (2 cols) */}
                <div className="col-span-2 bg-white border border-slate-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-black text-slate-900">Calendar</h3>
                        <div className="flex items-center gap-1.5">
                            <button onClick={prevMonth} className="w-5 h-5 flex items-center justify-center rounded border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-[9px] font-bold text-slate-600 min-w-[80px] text-center">{monthName}</span>
                            <button onClick={nextMonth} className={`w-5 h-5 flex items-center justify-center rounded border border-slate-100 transition-colors ${isCurrentMonth ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}>
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-px">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[7px] font-black text-slate-300 py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-px">
                        {calendarCells.map((cell, i) => (
                            <div
                                key={i}
                                className={`h-7 flex items-center justify-center rounded text-[9px] font-bold relative ${!cell ? '' :
                                    cell.isToday ? 'bg-[#0066CC] text-white' :
                                        cell.count > 0 ? 'bg-blue-50 text-[#0066CC]' :
                                            'text-slate-400 hover:bg-slate-50'
                                    }`}
                                title={cell && cell.count > 0 ? `${cell.count} venture${cell.count !== 1 ? 's' : ''}` : ''}
                            >
                                {cell && (
                                    <>
                                        {cell.day}
                                        {cell.count > 0 && (
                                            <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full ${cell.isToday ? 'bg-white' : 'bg-[#0066CC]'}`}></span>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Venture Progress (2 cols) — Real Task Data */}
                {projects.length > 0 ? (
                    <div className="col-span-2 bg-white border border-slate-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-black text-slate-900">Venture Progress</h3>
                            <span className="text-[8px] font-bold text-slate-400">{avgCompletion}% avg</span>
                        </div>
                        <div className="space-y-3">
                            {projects.map(project => {
                                const pct = getRealCompletion(project);
                                const taskCount = project.data?.plan?.days?.length || 0;
                                const doneCount = taskCount > 0
                                    ? (project.data?.plan?.days || []).filter(d => (project.data?.progress || {})[d.id]).length
                                    : 0;
                                return (
                                    <div key={project.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[60%]">{project.title || 'Untitled Venture'}</span>
                                            <span className="text-[9px] font-black text-slate-500">
                                                {taskCount > 0 ? `${doneCount}/${taskCount} tasks` : `${pct}%`}
                                            </span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' :
                                                    pct >= 50 ? 'bg-[#0066CC]' :
                                                        pct >= 25 ? 'bg-amber-500' : 'bg-slate-300'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="col-span-2 bg-white border border-slate-100 p-6 rounded-xl flex items-center justify-center">
                        <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">No ventures yet</p>
                    </div>
                )}

                {/* Row 4: Phase Progress (2 cols) + Task Completion Chart (2 cols) */}
                {phaseProgress.length > 0 && (
                    <div className="col-span-2 bg-white border border-slate-100 p-4 rounded-xl">
                        <h3 className="text-[11px] font-black text-slate-900 mb-3">Phase Progress</h3>
                        <div className="space-y-3">
                            {phaseProgress.map((phase, idx) => (
                                <div key={phase.name} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold" style={{ color: PHASE_COLORS[idx % PHASE_COLORS.length] }}>{phase.name}</span>
                                        <span className="text-[9px] font-black text-slate-500">{phase.completed}/{phase.total}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${phase.percent}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: PHASE_COLORS[idx % PHASE_COLORS.length] }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Task Completion Chart (2 cols) */}
                {projects.some(p => p.data?.plan?.days?.length > 0) && (
                    <div className={`${phaseProgress.length > 0 ? 'col-span-2' : 'col-span-4'} bg-white border border-slate-100 p-4 rounded-xl`}>
                        <h3 className="text-[11px] font-black text-slate-900 mb-3">Task Completion</h3>
                        <div className="space-y-2.5">
                            {projects.filter(p => p.data?.plan?.days?.length > 0).map(project => {
                                const total = project.data.plan.days.length;
                                const done = project.data.plan.days.filter(d => (project.data.progress || {})[d.id]).length;
                                const pct = Math.round((done / total) * 100);
                                return (
                                    <div key={project.id} className="flex items-center gap-3">
                                        <span className="text-[9px] font-bold text-slate-600 truncate w-24 shrink-0">{project.title || 'Untitled'}</span>
                                        <div className="flex-1 flex items-center h-5 bg-slate-50 rounded-md overflow-hidden border border-slate-100">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full flex items-center justify-end pr-1.5 text-[8px] font-black text-white ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#0066CC]' : pct > 0 ? 'bg-amber-500' : ''}`}
                                            >
                                                {pct > 15 && `${pct}%`}
                                            </motion.div>
                                            {pct <= 15 && <span className="text-[8px] font-black text-slate-400 pl-1.5">{pct}%</span>}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 shrink-0">{done}/{total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Row 5: Recent Activity (2 cols) + Breakdown (2 cols) */}
                {projects.length > 0 && (
                    <div className="col-span-2 bg-white border border-slate-100 p-4 rounded-xl">
                        <h3 className="text-[11px] font-black text-slate-900 mb-3">Recent Activity</h3>
                        <div>
                            {[...projects]
                                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                                .slice(0, 5)
                                .map((project, i) => {
                                    const pct = getRealCompletion(project);
                                    // Determine milestone
                                    let milestone = 'Created';
                                    if (pct >= 80) milestone = 'Nearly Complete';
                                    else if (pct >= 50) milestone = 'In Progress';
                                    else if (project.data?.plan) milestone = 'Plan Generated';
                                    else if (project.data?.report) milestone = 'Report Ready';
                                    else if (project.data?.answers) milestone = 'Questions Answered';
                                    else if (project.data?.questions?.length > 0) milestone = 'Discovering';

                                    return (
                                        <div key={project.id} className="flex items-start gap-2.5 py-1.5 relative">
                                            {i < Math.min(projects.length, 5) - 1 && (
                                                <div className="absolute left-[6px] top-[20px] w-px h-[calc(100%-8px)] bg-slate-100"></div>
                                            )}
                                            <div className={`w-3 h-3 rounded-full border-[1.5px] mt-0.5 shrink-0 ${pct >= 80 ? 'border-emerald-500 bg-emerald-50' :
                                                pct >= 50 ? 'border-[#0066CC] bg-blue-50' :
                                                    'border-slate-200 bg-slate-50'
                                                }`}></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold text-slate-800 truncate">{project.title || 'Untitled Venture'}</p>
                                                <p className="text-[8px] text-slate-400 font-medium mt-0.5">
                                                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                                                    <span className="mx-1">·</span>
                                                    <span className={`${pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-[#0066CC]' : 'text-slate-400'}`}>{milestone}</span>
                                                    <span className="mx-1">·</span>
                                                    {pct}%
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Breakdown (2 cols) */}
                <div className="col-span-2 bg-white border border-slate-100 p-4 rounded-xl">
                    <h3 className="text-[11px] font-black text-slate-900 mb-3">Breakdown</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Just Started', range: [0, 24], color: 'bg-slate-300', dotColor: 'bg-slate-300' },
                            { label: 'In Progress', range: [25, 49], color: 'bg-amber-500', dotColor: 'bg-amber-500' },
                            { label: 'Almost There', range: [50, 79], color: 'bg-[#0066CC]', dotColor: 'bg-[#0066CC]' },
                            { label: 'Completed', range: [80, 100], color: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
                        ].map(bucket => {
                            const count = projects.filter(p => {
                                const pct = getRealCompletion(p);
                                return pct >= bucket.range[0] && pct <= bucket.range[1];
                            }).length;
                            return (
                                <div key={bucket.label} className="flex items-center gap-2 bg-slate-50/50 rounded-lg px-3 py-2">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bucket.dotColor}`}></div>
                                    <span className="text-[9px] font-bold text-slate-500 flex-1">{bucket.label}</span>
                                    <span className="text-[11px] font-black text-slate-900">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    {(() => {
                        const best = [...projects].sort((a, b) => getRealCompletion(b) - getRealCompletion(a))[0];
                        if (!best) return null;
                        const bestPct = getRealCompletion(best);
                        const bestTasks = best.data?.plan?.days?.length || 0;
                        const bestDone = bestTasks > 0
                            ? (best.data?.plan?.days || []).filter(d => (best.data?.progress || {})[d.id]).length
                            : 0;
                        return (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Top Venture</p>
                                    <p className="text-[10px] font-bold text-slate-800 truncate">{best.title || 'Untitled'}</p>
                                    {bestTasks > 0 && (
                                        <p className="text-[8px] text-slate-400 font-medium">{bestDone}/{bestTasks} tasks</p>
                                    )}
                                </div>
                                <span className={`text-sm font-black ${bestPct >= 80 ? 'text-emerald-600' : 'text-[#0066CC]'}`}>{bestPct}%</span>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

const SettingsView = ({ user, logout, navigate, state, setState, onSave, onClear }) => (
    <div className="max-w-4xl space-y-12 pb-32">
        <section className="bg-white border border-slate-100 p-6 md:p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Profile Settings</h2>

            <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center text-3xl font-bold rounded-full border-4 border-white shadow-xl overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="flex-1 space-y-1.5 text-center md:text-left">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Venture Founder'}
                    </h3>
                    <p className="text-slate-500 font-medium">{user?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-blue-50 text-[#0066CC] text-[9px] font-black rounded-lg border border-blue-100 uppercase tracking-[0.2em]">Founder Account</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <input
                        type="text"
                        value={state.name}
                        onChange={(e) => setState({ ...state, name: e.target.value })}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-lg outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0066CC] transition-all font-bold text-[11px] uppercase tracking-wider"
                    />
                </div>
                <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Title</label>
                    <input
                        type="text"
                        value={state.title}
                        onChange={(e) => setState({ ...state, title: e.target.value })}
                        placeholder="e.g. Full Stack Founder"
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-lg outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0066CC] transition-all font-bold text-[11px] uppercase tracking-wider"
                    />
                </div>
                <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Website</label>
                    <input
                        type="text"
                        value={state.website}
                        onChange={(e) => setState({ ...state, website: e.target.value })}
                        placeholder="e.g. yoursite.com"
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-lg outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0066CC] transition-all font-bold text-[11px]"
                    />
                </div>
                <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Twitter / X</label>
                    <input
                        type="text"
                        value={state.twitter}
                        onChange={(e) => setState({ ...state, twitter: e.target.value })}
                        placeholder="e.g. @username"
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-lg outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0066CC] transition-all font-bold text-[11px]"
                    />
                </div>
                <div className="md:col-span-2 space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Bio</label>
                    <textarea
                        rows={4}
                        value={state.bio}
                        onChange={(e) => setState({ ...state, bio: e.target.value })}
                        placeholder="Tell us about your venture journey..."
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-lg outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0066CC] transition-all font-medium text-xs resize-none"
                    />
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={state.isSaving}
                    className="w-full sm:w-auto px-10 py-4 bg-[#0066CC] text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-[#0052a3] transition-all disabled:opacity-50"
                >
                    {state.isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </section>

        {/* AI & Research Preferences */}
        <section className="bg-white border border-slate-100 p-6 md:p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">AI & Research Preferences</h2>
            <div className="grid gap-6">
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 rounded-lg border border-slate-100 group gap-6">
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-[#0066CC] transition-colors">
                            <Cpu size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900">Research Depth</p>
                            <p className="text-xs text-slate-500">Fine-tune how deep the AI dives into market analysis.</p>
                        </div>
                    </div>
                    <div className="flex p-1 bg-white rounded-lg border border-slate-100 w-full sm:w-auto">
                        {['Standard', 'Deep', 'Ultra'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setState({ ...state, researchDepth: level })}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${state.researchDepth === level ? 'bg-[#0066CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 rounded-lg border border-slate-100 group gap-6">
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-[#0066CC] transition-colors">
                            <Globe size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900">Auto-Research Sources</p>
                            <p className="text-xs text-slate-500">Include global databases and news archives.</p>
                        </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={state.autoResearch}
                            onChange={(e) => setState({ ...state, autoResearch: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066CC]"></div>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-white border border-slate-100 p-6 md:p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Security & Preferences</h2>
            <div className="grid gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-white transition-all group gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-[#0066CC] transition-colors">
                            <Shield size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-200 text-slate-500 text-[9px] font-black rounded-lg uppercase tracking-widest w-full sm:w-auto text-center">Off</div>
                </div>

                <button
                    onClick={onClear}
                    className="flex flex-col sm:flex-row items-center justify-between p-6 bg-red-50/30 rounded-lg border border-red-50 hover:bg-red-50 transition-all group gap-4"
                >
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-red-300 group-hover:text-red-500 transition-colors">
                            <Trash2 size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-red-900">Clear All Data</p>
                            <p className="text-xs text-red-500">Permanently delete everything from server and browser</p>
                        </div>
                    </div>
                    <div className="px-4 py-1.5 bg-red-100 text-red-600 text-[9px] font-black rounded-lg uppercase tracking-widest w-full sm:w-auto text-center">Danger</div>
                </button>

                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-all group gap-4"
                >
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-slate-900 transition-colors">
                            <LogOut size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900">Sign Out</p>
                            <p className="text-xs text-slate-500">Terminate your current session</p>
                        </div>
                    </div>
                    <div className="px-4 py-1.5 bg-white text-slate-400 text-[9px] font-black rounded-lg border border-slate-100 uppercase tracking-widest w-full sm:w-auto text-center">Logout</div>
                </button>
            </div>
        </section>
    </div>
);



export default DashboardPage;
