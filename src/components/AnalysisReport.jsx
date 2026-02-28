import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, ShieldAlert, Target, Award,
    CheckCircle2, Zap, AlertTriangle, Users, BarChart3,
    Globe, Calendar, Sparkles, ChevronRight, FileText,
    ArrowRight, Rocket, ShieldCheck, RotateCcw
} from 'lucide-react';

const MetricCard = ({ score, label, color, icon: Icon, gradientFrom, gradientTo }) => {
    const radius = 30;
    const stroke = 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - ((score / 10) * circumference);
    const uniqueId = `grad-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-between text-center hover:shadow-lg hover:border-blue-100 transition-all duration-300 group shrink-0 relative overflow-hidden aspect-square">

            {/* Top Label & Icon */}
            <div className="flex items-center gap-1.5 mb-1 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                <Icon size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{label}</span>
            </div>

            {/* Centered Circular Progress */}
            <div className="relative flex items-center justify-center flex-1 w-full">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90 origin-center overflow-visible"
                >
                    <defs>
                        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradientFrom || color} />
                            <stop offset="100%" stopColor={gradientTo || color} />
                        </linearGradient>
                    </defs>

                    {/* Track */}
                    <circle
                        stroke="#f1f5f9"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />

                    {/* Progress */}
                    <circle
                        stroke={`url(#${uniqueId})`}
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>

                {/* Centered Score */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-slate-800 tracking-tighter leading-none">{score}</span>
                </div>
            </div>
        </div>
    );
};

const AnalysisReport = ({ report, onRestart, onAccept, hasPlan = false, planLoading = false }) => {
    if (!report) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="w-full h-full bg-[#FAFAFA] overflow-y-auto custom-scrollbar">
            <div className="max-w-[1600px] mx-auto px-6 py-6 pb-32">

                {/* Header - Compact */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 border-b border-slate-200 pb-5 flex items-center justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 px-1.5 bg-blue-50 rounded text-[9px] font-black text-[var(--brand-accent)] uppercase tracking-[0.2em] border border-blue-100">
                                Intelligence Hub
                            </div>
                        </div>
                        <h2 className="text-2xl font-normal text-slate-900 tracking-tight">
                            {report.project_name || "Venture Blueprint"}
                        </h2>
                    </div>

                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* ROW 1: Manifesto (Left) + Metrics (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Executive Summary */}
                        <motion.section variants={itemVariants} className="lg:col-span-8 bg-white border border-slate-100 rounded-xl p-8 shadow-sm relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform pointer-events-none">
                                <Target size={120} />
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Executive Manifesto</span>
                            </div>
                            <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                                "{report.explanation}"
                            </p>
                        </motion.section>

                        {/* Metrics Grid - REDESIGNED: Centered & Inline Icons */}
                        <motion.section variants={itemVariants} className="lg:col-span-4 flex flex-col justify-center">
                            <div className="grid grid-cols-3 gap-3 h-full">
                                <MetricCard
                                    score={report.market_demand?.score || 0}
                                    label="Demand"
                                    color="var(--brand-accent)"
                                    gradientFrom="var(--brand-accent)"
                                    gradientTo="#06b6d4"
                                    icon={TrendingUp}
                                />
                                <MetricCard
                                    score={report.feasibility?.score || 0}
                                    label="Viability"
                                    color="#8b5cf6"
                                    gradientFrom="#8b5cf6"
                                    gradientTo="#d946ef"
                                    icon={Rocket}
                                />
                                <MetricCard
                                    score={report.competitiveness_score || 0}
                                    label="Moat"
                                    color="#db2777"
                                    gradientFrom="#db2777"
                                    gradientTo="#f43f5e"
                                    icon={ShieldCheck}
                                />
                            </div>
                        </motion.section>
                    </div>

                    {/* ROW 2: Competitive Landscape (Left) + Expert Advice (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Competitive Radar - RENAMED */}
                        <motion.section variants={itemVariants} className="lg:col-span-8 space-y-4">
                            <div className="flex items-center gap-3 px-1">
                                <div className="p-1 px-2.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest">
                                    Competitive Landscape
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.competitors?.map((comp, idx) => (
                                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 hover:border-blue-100 transition-all hover:shadow-md group flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-base font-normal text-slate-900 tracking-tight">{comp.name}</h4>
                                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest border border-slate-100">Rival</span>
                                        </div>
                                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed italic line-clamp-3 mb-6 flex-1">
                                            "{comp.what_they_do}"
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-slate-50">
                                            <div className="p-4 bg-blue-50/40 rounded-lg border border-blue-50/50 group-hover:border-blue-100">
                                                <span className="text-[9px] font-black text-[var(--brand-accent)] uppercase tracking-widest block mb-2">Gap Opportunity</span>
                                                <p className="text-[12px] text-blue-800 font-bold leading-relaxed">{comp.weaknesses}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Expert Advice - REDESIGNED */}
                        <motion.section variants={itemVariants} className="lg:col-span-4 flex flex-col h-full">
                            <div className="flex-1 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white relative overflow-hidden group flex flex-col shadow-lg border border-slate-700/50">
                                {/* Abstract Geometric Pattern */}
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                                    <Sparkles size={120} strokeWidth={1} />
                                </div>

                                <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-white/10 pb-4">
                                    <h4 className="text-sm font-normal text-blue-200 uppercase tracking-widest">Strategic Insight</h4>
                                </div>

                                <div className="relative z-10 flex-1 flex flex-col justify-center">
                                    <div className="text-4xl text-blue-500/20 absolute -top-4 -left-2 font-serif">"</div>
                                    <p className="text-[16px] font-medium leading-relaxed text-slate-200 relative pl-4 border-l-2 border-blue-500/50">
                                        {report.mentor_perspective?.advice}
                                    </p>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* ROW 3: Risks (Left) + Directives (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Risks - 4 Grid Layout */}
                        <motion.section variants={itemVariants} className="lg:col-span-6 space-y-4">
                            <div className="flex items-center gap-3 px-1">
                                <div className="p-1 px-2.5 bg-rose-100 text-rose-600 rounded text-[10px] font-black uppercase tracking-widest">
                                    Risk Guardrails
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(report.risks || {}).slice(0, 4).map(([key, value], idx) => (
                                    <div key={idx} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-100 hover:border-rose-100 transition-all h-full group">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400 shrink-0 border border-rose-100 group-hover:bg-rose-100 transition-colors">
                                            <AlertTriangle size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{key}</span>
                                            <p className="text-[12px] text-slate-600 font-medium leading-relaxed line-clamp-3">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Execution Directives - 3 Step Layout */}
                        <motion.section variants={itemVariants} className="lg:col-span-6 space-y-4">
                            <div className="flex items-center gap-3 px-1">
                                <div className="p-1 px-2.5 bg-blue-50 text-[var(--brand-accent)] rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    Directives
                                </div>
                            </div>
                            <div className="relative pl-6 border-l-2 border-slate-200/50 space-y-4">
                                {report.next_steps?.immediate.slice(0, 3).map((step, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="absolute -left-[31px] top-[14px] w-4 h-4 rounded-full bg-white border-[3px] border-slate-200 group-hover:border-[var(--brand-accent)] transition-all z-10 shadow-sm" />
                                        <div className="bg-white p-5 rounded-xl border border-slate-100 group-hover:shadow-md transition-all hover:border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[9px] font-black text-slate-300">STEP 0{idx + 1}</span>
                                            </div>
                                            <p className="text-[13px] text-slate-800 font-bold leading-relaxed">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                </motion.div>

                {/* Footer Branding */}
                <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center gap-3 text-slate-300">
                    <div className="flex items-center gap-2">
                        <div className="p-1 px-1.5 border border-slate-200 rounded text-[10px] font-black">AI</div>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Capable Discovery System v2.2 Grid Edition</span>
                    </div>
                </div>


                {/* Floating Action Dock */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
                >
                    <div className="pointer-events-auto flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50 rounded-2xl ring-1 ring-slate-900/5 text-center">
                        <button
                            onClick={onRestart}
                            className="group flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-500 hover:text-slate-900 bg-transparent hover:bg-white/50 rounded-xl uppercase tracking-widest transition-all"
                        >
                            <span className="group-hover:-rotate-180 transition-transform duration-500">
                                <RotateCcw size={14} className="text-slate-400 group-hover:text-slate-600" />
                            </span>
                            Refine
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <button
                            onClick={onAccept}
                            disabled={planLoading}
                            className="group flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-accent)] text-white rounded-xl font-bold hover:bg-[var(--brand-accent-hover)] transition-all active:scale-95 disabled:opacity-70 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                        >
                            {planLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    EXECUTE PROTOCOL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export default AnalysisReport;
