import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    LayoutGrid,
    List,
    ChevronRight,
    Layers,
    Activity,
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

const TaskView = ({ plan, report, projectId }) => {
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [completionStatuses, setCompletionStatuses] = useState({});
    const [stepProgress, setStepProgress] = useState({}); // { [dayId]: { [stepIdx]: boolean } }
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Helper to get phases safely
    const displayPhases = (plan?.phases && plan.phases.length > 0) ? plan.phases : DEFAULT_PHASES;

    useEffect(() => {
        if (!plan || !plan.days || !projectId) return;

        const load = async () => {
            const project = await ProjectStorage.getById(projectId);
            const savedProgress = project?.data?.progress || {};
            const savedSteps = project?.data?.stepProgress || {};
            
            setCompletionStatuses(savedProgress);
            setStepProgress(savedSteps);

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

    const toggleCompletion = async (dayId, forceValue = null) => {
        const isCurrentlyDone = !!completionStatuses[dayId];
        const shouldBeDone = forceValue !== null ? forceValue : !isCurrentlyDone;
        
        // Optimistic Update
        const next = { ...completionStatuses, [dayId]: shouldBeDone ? new Date().toISOString() : false };
        setCompletionStatuses(next);
        
        // Background Save
        ProjectStorage.updateData(projectId, { progress: next });

        // Auto-advance to next task if marking as complete
        if (shouldBeDone) {
            const currentIndex = plan.days.findIndex(d => d.id === dayId);
            if (currentIndex !== -1 && currentIndex < plan.days.length - 1) {
                // Slightly faster transition
                setTimeout(() => {
                    setSelectedDayData(plan.days[currentIndex + 1]);
                }, 200);
            }
        }
    };

    const toggleStep = async (dayId, stepIdx) => {
        const currentSteps = stepProgress[dayId] || {};
        const isDayAlreadyDone = !!completionStatuses[dayId];
        
        const nextSteps = {
            ...stepProgress,
            [dayId]: {
                ...currentSteps,
                [stepIdx]: !currentSteps[stepIdx]
            }
        };

        setStepProgress(nextSteps);
        ProjectStorage.updateData(projectId, { stepProgress: nextSteps });

        // Check if all steps are now completed for this specific day
        const dayData = plan.days.find(d => d.id === dayId);
        if (dayData && dayData.details) {
            const allChecked = dayData.details.every((_, idx) => nextSteps[dayId]?.[idx]);
            if (allChecked && !isDayAlreadyDone) {
                toggleCompletion(dayId, true);
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
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
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
                                        <Layers size={14} className="text-slate-400" /> Task Details
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
                                    {selectedDayData.isPlaceholder ? (
                                        <div className="space-y-6 animate-pulse">
                                            <div className="h-8 bg-slate-100 rounded-md w-3/4"></div>
                                            <section>
                                                <div className="h-3 bg-slate-50 rounded w-20 mb-3"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-slate-50 rounded w-full"></div>
                                                    <div className="h-4 bg-slate-50 rounded w-5/6"></div>
                                                </div>
                                            </section>
                                            <section>
                                                <div className="h-3 bg-slate-50 rounded w-24 mb-3"></div>
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex gap-3 mb-3">
                                                        <div className="w-5 h-5 rounded-full bg-slate-50 shrink-0"></div>
                                                        <div className="h-4 bg-slate-50 rounded w-full mt-0.5"></div>
                                                    </div>
                                                ))}
                                            </section>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-xl font-normal text-slate-900 leading-snug font-display">
                                                {selectedDayData.title}
                                            </h2>

                                            <div className="flex items-center gap-6 py-1">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Impact</span>
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">{selectedDayData.impact}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Commitment</span>
                                                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 border border-slate-100 px-2 py-0.5 rounded-full"><Clock size={12} /> {selectedDayData.est_time}</span>
                                                </div>
                                            </div>

                                            <section>
                                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Objective
                                                </h3>
                                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                    {selectedDayData.task}
                                                </p>
                                            </section>

                                            <section>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Steps</h3>
                                                    {selectedDayData.details?.length > 0 && (
                                                        <span className="text-[10px] font-medium text-slate-400">
                                                            {Object.values(stepProgress[selectedDayData.id] || {}).filter(Boolean).length} / {selectedDayData.details.length} Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    {selectedDayData.details?.map((detail, idx) => {
                                                        const isChecked = !!stepProgress[selectedDayData.id]?.[idx];
                                                        return (
                                                            <div 
                                                                key={idx} 
                                                                onClick={() => toggleStep(selectedDayData.id, idx)}
                                                                className={`flex items-start gap-3 text-sm leading-relaxed group cursor-pointer p-2 rounded-lg transition-colors relative ${isChecked ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}
                                                            >
                                                                <div className={`mt-0.5 flex-none w-5 h-5 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-400 group-hover:border-indigo-200'}`}>
                                                                    {isChecked && <CheckCircle2 size={12} />}
                                                                    {!isChecked && <div className="text-[10px] font-bold">{idx + 1}</div>}
                                                                </div>
                                                                <div className="flex-1 min-w-0 pr-16">
                                                                    <span className={`text-xs font-medium transition-colors ${isChecked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>
                                                                        {detail}
                                                                    </span>
                                                                </div>

                                                                {/* Ask AI Button - Visible on Hover */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.dispatchEvent(new CustomEvent('add-task-mention', {
                                                                            detail: { 
                                                                                id: selectedDayData.day, 
                                                                                title: selectedDayData.title,
                                                                                stepIdx: idx + 1,
                                                                                stepText: detail
                                                                            }
                                                                        }));
                                                                    }}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md hover:bg-indigo-100 active:scale-95"
                                                                >
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">Ask AI</span>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </section>

                                            {selectedDayData.deliverable && (
                                                <section className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
                                                    <h3 className="text-[10px] font-bold text-[var(--brand-accent)]/70 uppercase tracking-wider mb-1 flex items-center gap-2">
                                                        <Activity size={12} /> Key Deliverable
                                                    </h3>
                                                    <p className="text-sm font-bold text-[var(--brand-accent)]">
                                                        {selectedDayData.deliverable}
                                                    </p>
                                                </section>
                                            )}
                                        </>
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
                                <Layers size={40} className="text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-400 tracking-tight">Select a task from the roadmap</p>
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
                                    const phaseIdx = plan.phases.findIndex(p => String(p.id) === String(day.phase_id));
                                    const pColor = phaseIdx >= 0 ? PHASE_COLORS[phaseIdx % PHASE_COLORS.length] : '#6366F1';

                                    if (viewMode === 'grid') {
                                        let bg = 'transparent';
                                        let border = 'transparent';
                                        let text = '';
                                        let shadow = 'none';

                                        if (isDone) {
                                            bg = pColor;
                                            border = `1px solid ${pColor}`;
                                            text = 'white';
                                        } else if (isSelected) {
                                            bg = 'white';
                                            border = `2px solid ${pColor}`;
                                            text = pColor;
                                            shadow = `0 4px 12px ${pColor}40`;
                                        } else {
                                            bg = `${pColor}08`;
                                            border = `1px solid ${pColor}30`;
                                            text = `${pColor}80`;
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
                                                    boxShadow: shadow,
                                                    filter: day.isPlaceholder ? 'blur(1px)' : 'none',
                                                    opacity: day.isPlaceholder ? 0.4 : 1
                                                }}
                                                className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-105 ${day.isPlaceholder ? 'cursor-wait animate-pulse' : ''}`}
                                                title={day.isPlaceholder ? `Day ${day.day_number}: Content generating...` : `Day ${day.day_number}: ${day.title}`}
                                            >
                                                {isDone ? <CheckCircle2 size={14} /> : day.day_number}
                                            </button>
                                        );
                                    }

                                    /* List View Item - Colored by Phase */
                                    const listBg = isSelected ? 'white' : 'white';
                                    const listBorder = isSelected ? `1px solid ${pColor}` : '1px solid transparent';
                                    const listShadow = isSelected ? `0 2px 8px ${pColor}20` : 'none';

                                    const mutedBg = `${pColor}20`;
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
                                                boxShadow: listShadow,
                                                filter: day.isPlaceholder ? 'blur(1.5px)' : 'none',
                                                opacity: day.isPlaceholder ? 0.5 : 1
                                            }}
                                            className={`w-full px-4 py-3 rounded-lg flex items-center gap-4 text-left group transition-all ${day.isPlaceholder ? 'cursor-wait' : ''}`}
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
                                                    ${day.isPlaceholder ? 'italic' : ''}
                                                `}>
                                                    {day.title}
                                                </p>
                                            </div>
                                            {isSelected && !day.isPlaceholder && <ChevronRight size={14} style={{ color: pColor }} />}
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
                                    const phaseDays = plan?.days?.filter(d => String(d.phase_id) === String(phase.id)) || [];
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
        </div>
    );
};

export default TaskView;
