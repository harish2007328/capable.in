import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    LayoutGrid,
    List,
    ChevronRight,
    Target,
    Zap,
    Clock,
    Flame,
    Calendar,
    ArrowRight,
    MessageSquare
} from 'lucide-react';
import MentorChat from './MentorChat';
import { ProjectStorage } from '../services/projectStorage';

const DEFAULT_PHASES = [
    { id: 'p1', title: 'Research' },
    { id: 'p2', title: 'Local Validation' },
    { id: 'p3', title: 'Minimum Build' },
    { id: 'p4', title: 'Launch and Feedback' },
];

const PHASE_COLORS = [
    '#6366F1', // Indigo (Research)
    '#EC4899', // Pink (Local Validation) - Changed from Purple for contrast
    '#10B981', // Emerald (Minimum Build)
    '#F59E0B', // Amber (Launch)
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
];

const TaskView = ({ plan, projectId }) => {
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [completionStatuses, setCompletionStatuses] = useState({});
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Helper to get phases safely
    const displayPhases = (plan?.phases && plan.phases.length > 0) ? plan.phases : DEFAULT_PHASES;

    useEffect(() => {
        if (!plan || !plan.days || !projectId) return;

        const load = async () => {
            const project = await ProjectStorage.getById(projectId);
            const savedProgress = project?.data?.progress || {};
            setCompletionStatuses(savedProgress);

            const firstIncomplete = plan.days.find(day => !savedProgress[day.id]);
            setSelectedDayData(firstIncomplete || plan.days[0]);
            setIsInitialLoad(false);
        };
        load();
    }, [plan, projectId]);

    // Scroll selected task into view in the Roadmap
    useEffect(() => {
        if (selectedDayData?.id) {
            const element = document.getElementById(`task-item-${selectedDayData.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        }
    }, [selectedDayData]);

    const toggleCompletion = async (dayId) => {
        const isCurrentlyDone = !!completionStatuses[dayId];
        const next = { ...completionStatuses, [dayId]: isCurrentlyDone ? false : new Date().toISOString() };

        setCompletionStatuses(next);
        await ProjectStorage.updateData(projectId, { progress: next });

        // Auto-advance to next task if marking as complete
        if (!isCurrentlyDone) {
            const currentIndex = plan.days.findIndex(d => d.id === dayId);
            if (currentIndex !== -1 && currentIndex < plan.days.length - 1) {
                // Small delay to allow the user to see the checkmark animation
                setTimeout(() => {
                    setSelectedDayData(plan.days[currentIndex + 1]);
                }, 300);
            }
        }
    };

    const handleNext = () => {
        if (!selectedDayData) return;
        const currentIndex = plan.days.findIndex(d => d.id === selectedDayData.id);
        if (currentIndex !== -1 && currentIndex < plan.days.length - 1) {
            setSelectedDayData(plan.days[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        if (!selectedDayData) return;
        const currentIndex = plan.days.findIndex(d => d.id === selectedDayData.id);
        if (currentIndex > 0) {
            setSelectedDayData(plan.days[currentIndex - 1]);
        }
    };

    if (!plan) return (
        <div className="h-full flex flex-col items-center justify-center bg-white p-20 animate-pulse">
            <div className="w-12 h-12 bg-slate-100 rounded-lg mb-4"></div>
            <div className="h-4 w-48 bg-slate-100 rounded"></div>
        </div>
    );

    const completedCount = Object.values(completionStatuses).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / plan.days.length) * 100) || 0;

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Control Bar Removed as per request */}

            {/* THREE-COLUMN DOCK - flex-1 and overflow-hidden is CRITICAL */}
            <div className="flex-1 min-h-0 flex gap-6 p-6 overflow-hidden">

                {/* COLUMN 1: INSPECTOR (Task Details) - Moved to Left */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-w-0">
                    {selectedDayData ? (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {/* Header Section - Unified Style */}
                            <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={14} /> Task Details
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-blue-50 text-[var(--brand-accent)] text-[10px] font-bold rounded-full uppercase tracking-wide border border-blue-100">
                                        Day {selectedDayData.day_number}
                                    </span>
                                    {completionStatuses[selectedDayData.id] && (
                                        <span className="flex items-center gap-1 text-[var(--brand-accent)] text-[10px] font-bold bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            <CheckCircle2 size={12} />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                                <h2 className="text-xl font-normal text-slate-900 leading-snug font-display">
                                    {selectedDayData.title}
                                </h2>

                                <section>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Objective
                                    </h3>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        {selectedDayData.task}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Action Steps</h3>
                                    <div className="space-y-3">
                                        {selectedDayData.details?.map((detail, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed group">
                                                <div className="flex-none w-5 h-5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold group-hover:border-[var(--brand-accent)]/30 group-hover:bg-blue-50 group-hover:text-[var(--brand-accent)] transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <span className="pt-0.5 text-xs font-medium">{detail}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {selectedDayData.deliverable && (
                                    <section className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
                                        <h3 className="text-[10px] font-bold text-[var(--brand-accent)]/70 uppercase tracking-wider mb-1 flex items-center gap-2">
                                            <Target size={12} /> Key Deliverable
                                        </h3>
                                        <p className="text-sm font-bold text-[var(--brand-accent)]">
                                            {selectedDayData.deliverable}
                                        </p>
                                    </section>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
                                {/* Navigation (Left) - Icon Only & Brand Blue */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrev}
                                        disabled={plan.days.findIndex(d => d.id === selectedDayData.id) === 0}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)] shadow-sm shadow-blue-200 transition-all disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                                        title="Previous Task"
                                    >
                                        <ChevronRight size={16} className="rotate-180" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={plan.days.findIndex(d => d.id === selectedDayData.id) === plan.days.length - 1}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)] shadow-sm shadow-blue-200 transition-all disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                                        title="Next Task"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* Main Action (Right) */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            // Emit custom event for MentorChat to pick up
                                            window.dispatchEvent(new CustomEvent('add-task-mention', {
                                                detail: { id: selectedDayData.day, title: selectedDayData.title }
                                            }));
                                        }}
                                        className="px-4 h-9 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        <MessageSquare size={14} />
                                        Ask AI
                                    </button>
                                    <button
                                        onClick={() => toggleCompletion(selectedDayData.id)}
                                        className={`px-5 h-9 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all ${completionStatuses[selectedDayData.id]
                                            ? 'bg-white border border-[var(--brand-accent)] text-[var(--brand-accent)] hover:bg-blue-50'
                                            : 'bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'}`}
                                    >
                                        {completionStatuses[selectedDayData.id] ? (
                                            <>Completed</>
                                        ) : (
                                            <>Mark Complete <ArrowRight size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
                            <Target size={40} className="text-slate-300 mb-4" />
                            <p className="text-sm font-bold text-slate-400">Select a task to view details</p>
                        </div>
                    )}
                </div>

                {/* COLUMN 2: ROADMAP (List/Grid) */}
                <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-w-0">
                    <div className="h-14 px-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} /> Roadmap
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {/* No transitions on container switch to avoid morphing artifacts */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-10 gap-2' : 'space-y-2'}>
                            {plan.days.map((day) => {
                                const isSelected = selectedDayData?.id === day.id;
                                const isDone = completionStatuses[day.id];
                                const phaseIdx = plan.phases.findIndex(p => p.id === day.phase_id);
                                const pColor = phaseIdx >= 0 ? PHASE_COLORS[phaseIdx % PHASE_COLORS.length] : '#6366F1';

                                if (viewMode === 'grid') {
                                    /* 
                                     * Grid Item Styles:
                                     * - Undone: Muted Version of Phase Color (transparent bg, colored border/text)
                                     * - Done: Solid filled with phase color
                                     * - Selected: Ring/Shadow to highlight
                                     */
                                    let bg = 'transparent';
                                    let border = 'transparent';
                                    let text = '';
                                    let shadow = 'none';

                                    if (isDone) {
                                        bg = pColor;
                                        border = `1px solid ${pColor}`;
                                        text = 'white';
                                    } else if (isSelected) {
                                        // Selected but not done
                                        bg = 'white';
                                        border = `2px solid ${pColor}`;
                                        text = pColor;
                                        shadow = `0 4px 12px ${pColor}40`; // 25% opacity
                                    } else {
                                        // Undone and not selected - Muted Phase Color
                                        // We use the hex color + alpha for transparency
                                        bg = `${pColor}08`; // ~3% opacity (very subtle tint)
                                        border = `1px solid ${pColor}30`; // ~20% opacity border
                                        text = `${pColor}80`; // ~50% opacity text (readable but muted)
                                    }

                                    return (
                                        <button
                                            key={day.id}
                                            id={`task-item-${day.id}`}
                                            onClick={() => setSelectedDayData(day)}
                                            style={{
                                                backgroundColor: bg,
                                                borderColor: isSelected && !isDone ? pColor : (isDone ? pColor : `${pColor}30`),
                                                borderWidth: isSelected && !isDone ? '2px' : '1px',
                                                color: text,
                                                boxShadow: shadow
                                            }}
                                            className="aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-105"
                                            title={`Day ${day.day_number}: ${day.title}`}
                                        >
                                            {isDone ? <CheckCircle2 size={14} /> : day.day_number}
                                        </button>
                                    );
                                }

                                /* List View Item - Colored by Phase */
                                const listBg = isSelected ? 'white' : 'white';
                                const listBorder = isSelected ? `1px solid ${pColor}` : '1px solid transparent';
                                const listShadow = isSelected ? `0 2px 8px ${pColor}20` : 'none'; // Subtle shadow on select

                                // Badge Styles
                                const mutedBg = `${pColor}20`; // ~12% opacity
                                const mutedText = pColor;

                                let badgeBg = isSelected ? pColor : mutedBg;
                                let badgeText = isSelected ? 'white' : mutedText;

                                return (
                                    <button
                                        key={day.id}
                                        id={`task-item-${day.id}`}
                                        onClick={() => setSelectedDayData(day)}
                                        style={{
                                            backgroundColor: listBg,
                                            border: listBorder,
                                            boxShadow: listShadow
                                        }}
                                        className="w-full px-4 py-3 rounded-lg flex items-center gap-4 text-left group transition-all"
                                    >
                                        <div
                                            className="w-6 h-6 rounded flex-none flex items-center justify-center text-[10px] font-bold transition-colors"
                                            style={{ backgroundColor: badgeBg, color: badgeText }}
                                        >
                                            {isDone ? <CheckCircle2 size={12} /> : day.day_number}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`
                                                font-bold leading-tight text-xs truncate
                                                ${isDone ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}
                                            `}>
                                                {day.title}
                                            </p>
                                        </div>
                                        {isSelected && <ChevronRight size={14} style={{ color: pColor }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phase Legend - Grid Layout & Visual Progress */}
                    <div className="p-5 border-t border-slate-200 bg-white shrink-0">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Progress</span>
                            <span className="text-[10px] font-bold text-slate-400">{Math.round(progressPercent)}% Overall</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {displayPhases.map((phase, idx) => {
                                const pColor = PHASE_COLORS[idx % PHASE_COLORS.length];

                                // Calculate Progress for this specific phase
                                const phaseDays = plan?.days?.filter(d => d.phase_id === phase.id) || [];
                                const totalInPhase = phaseDays.length;
                                const completedInPhase = phaseDays.filter(d => completionStatuses[d.id]).length;
                                const phasePercent = totalInPhase > 0 ? (completedInPhase / totalInPhase) * 100 : 0;

                                return (
                                    <div key={phase.id || idx} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide">
                                            <span style={{ color: pColor }}>{phase.title || phase.name}</span>
                                            <span className="text-slate-400">{completedInPhase}/{totalInPhase}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500 ease-out"
                                                style={{
                                                    width: `${phasePercent}%`,
                                                    backgroundColor: pColor
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: CHAT (Right Column) */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-w-0">
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                        <MentorChat
                            idea={plan.short_title || "My Project"}
                            plan={plan}
                            completedDays={Object.keys(completionStatuses).filter(k => completionStatuses[k])}
                            currentTaskId={selectedDayData?.day}
                            projectId={projectId}
                            onSelectTask={(taskId) => {
                                const found = plan.days.find(d => String(d.day) === String(taskId) || String(d.id) === String(taskId));
                                if (found) setSelectedDayData(found);
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaskView;
