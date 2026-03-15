import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, ArrowRight,
    Target, Shield, Zap, BarChart3,
    Cpu, Activity, AlertTriangle, Layers,
    Clock, Globe, TrendingUp, PieChart
} from 'lucide-react';
import { ExportService } from '../services/exportService';
import LogoIcon from '../assets/LOGO ICON.svg';

// --- Simplified Loading Skeleton for Sections ---
const SectionSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-slate-50 rounded-xl" />
            <div className="h-40 bg-slate-50 rounded-xl" />
            <div className="h-40 bg-slate-50 rounded-xl" />
        </div>
        <div className="h-24 bg-slate-50 rounded-xl w-full" />
        <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-slate-50 rounded-xl" />
            <div className="h-32 bg-slate-50 rounded-xl" />
        </div>
    </div>
);

// --- Polished Chart Components ---

const LineChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.value));
    const W = 400, H = 190;
    const padX = 28, padY = 28;
    const chartH = H - padY;  // bottom boundary for the chart area

    const pts = data.map((d, i) => ({
        x: padX + (i / (data.length - 1)) * (W - 2 * padX),
        y: padY + ((maxVal - d.value) / maxVal) * (chartH - padY),
        value: d.value,
        label: d.label
    }));

    const line = pts.reduce((acc, p, i, arr) => {
        if (i === 0) return `M${p.x},${p.y}`;
        const prev = arr[i - 1];
        const cx = (prev.x + p.x) / 2;
        return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
    }, '');

    const area = `${line} L${pts[pts.length - 1].x},${chartH} L${pts[0].x},${chartH} Z`;

    return (
        <div className="w-full rounded-xl bg-slate-900 overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal guides */}
                {[0.33, 0.66].map(t => {
                    const y = padY + t * (chartH - padY - padY);
                    return <line key={t} x1={padX} y1={y} x2={W - padX} y2={y}
                        stroke="white" strokeOpacity="0.04" strokeWidth="0.8" />;
                })}

                <motion.path d={area} fill="url(#lcg)"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />

                <motion.path d={line} fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }} />

                {pts.map((p, i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                        <circle cx={p.x} cy={p.y} r="3.5" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.4" />
                        <circle cx={p.x} cy={p.y} r="1.3" fill="#60a5fa" />
                        {/* % value above the dot */}
                        <text x={p.x} y={p.y - 8} textAnchor="middle"
                            fill="white" fontSize="9" fontWeight="700"
                            fontFamily="ui-monospace, monospace" opacity="0.9">
                            {p.value}%
                        </text>
                        {/* Month label at bottom */}
                        <text x={p.x} y={H - 8} textAnchor="middle"
                            fill="#64748b" fontSize="8" fontWeight="600"
                            fontFamily="system-ui, sans-serif">
                            {p.label}
                        </text>
                    </motion.g>
                ))}
            </svg>
        </div>
    );
};

const SimpleBarChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.value));

    return (
        <div className="space-y-4 mt-4">
            {data.map((d, i) => (
                <div key={i} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{d.label}</span>
                        <span className="text-[10px] font-bold text-slate-900 tabular-nums">{d.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(d.value / maxVal) * 100}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-slate-900"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const RadarChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const cx = 100, cy = 100;
    const radius = 65;
    const pointsCount = 5;

    const chartData = data.slice(0, pointsCount);

    const pts = chartData.map((d, i) => {
        const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
        const r = (d.value / 10) * radius;
        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
            lx: cx + (radius + 22) * Math.cos(angle),
            ly: cy + (radius + 22) * Math.sin(angle),
            value: d.value,
            label: d.label
        };
    });

    const path = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

    return (
        <div className="w-full h-full p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />

            <svg viewBox="0 0 200 200" className="w-full h-auto max-h-[380px] relative z-10">
                <defs>
                    <linearGradient id="rcg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Concentric pentagon grids */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => {
                    const gPts = Array.from({ length: pointsCount }).map((_, i) => {
                        const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
                        return `${cx + radius * scale * Math.cos(angle)},${cy + radius * scale * Math.sin(angle)}`;
                    }).join(' ');
                    return <polygon key={scale} points={gPts} fill="none" stroke="rgba(165, 180, 252, 0.25)" strokeWidth="1" />;
                })}

                {/* Radial axes */}
                {Array.from({ length: pointsCount }).map((_, i) => {
                    const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
                    return <line key={i} x1={cx} y1={cy}
                        x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)}
                        stroke="rgba(165, 180, 252, 0.25)" strokeWidth="1" />;
                })}

                {/* Data polygon */}
                <motion.path
                    d={path}
                    fill="url(#rcg)"
                    stroke="#60a5fa"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(96, 165, 250, 0.5))', transformOrigin: `${cx}px ${cy}px` }}
                />

                {/* Vertex dots + labels */}
                {pts.map((p, i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}>
                        <circle cx={p.x} cy={p.y} r="4.5" fill="#0f172a" stroke="#60a5fa" strokeWidth="2.5" />
                        <circle cx={p.x} cy={p.y} r="1.5" fill="#60a5fa" filter="url(#glow)" />
                        {/* Value */}
                        <text x={p.x} y={p.y - 12} textAnchor="middle"
                            fill="white" fontSize="9" fontWeight="900"
                            className="drop-shadow-sm"
                            fontFamily="ui-monospace, monospace">
                            {p.value}
                        </text>
                        {/* Label */}
                        <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
                            fill="#94a3b8" fontSize="8" fontWeight="700"
                            fontFamily="system-ui, sans-serif">
                            {p.label}
                        </text>
                    </motion.g>
                ))}
            </svg>
        </div>
    );
};


// --- Container Components ---

const InfoBox = ({ icon: Icon, title, content, className = "" }) => (
    <div className={`p-8 rounded-2xl bg-white border border-slate-100 shadow-sm ${className}`}>
        <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                <Icon size={16} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h4>
        </div>
        <p className="text-base text-slate-700 leading-relaxed font-medium">
            {content}
        </p>
    </div>
);

const MetricBox = ({ label, value, subtext, icon: Icon, isCompact = false }) => (
    <div className={`p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon size={40} />
        </div>
        <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</div>
            <div className="text-2xl font-black text-slate-900 leading-none mb-2">{value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtext}</div>
        </div>
    </div>
);


const AnalysisReport = ({ report, onAccept, planLoading = false, reportLoading = false, hasPlan = false, onRestart }) => {
    const reportRef = React.useRef(null);
    const [exporting, setExporting] = useState(null);
    const [copied, setCopied] = useState(false);
    const [planInitiated, setPlanInitiated] = useState(false);

    if (!report) return null;

    const pages = report.pages || [];

    const handleExportPDF = async () => {
        setExporting('pdf');
        await ExportService.exportReportToPDF(report, `${report.project_name || 'Venture'}_Report.pdf`);
        setExporting(null);
    };

    const handleExportDocx = async () => {
        setExporting('docx');
        await ExportService.exportToDocx(report, `${report.project_name || 'Venture'}_Report.docx`);
        setExporting(null);
    };

    const handleCopy = async () => {
        const ok = await ExportService.copyToClipboard(report);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleInitiatePlan = () => {
        setPlanInitiated(true);
        onAccept();
    };

    const renderPageContent = (page) => {
        const { id, content, isPlaceholder } = page;

        if (isPlaceholder || !content) {
            return <SectionSkeleton />;
        }

        switch (id) {
            case 'executive':
                return (
                    <div className="space-y-3">

                        {/* Summary */}
                        <div className="p-5 rounded-xl bg-slate-900 text-white">
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2 block">Executive Summary</span>
                            <p className="text-xl leading-relaxed font-serif italic text-slate-100">{content.explanation}</p>
                        </div>

                        {/* Chart + Market Demand — same row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><TrendingUp size={12} /> Traction Projection</span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">12-Month</span>
                                </div>
                                <LineChart data={content.chart_data} />
                            </div>
                            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors" />
                                <div className="relative z-10 w-full">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Market Demand</div>
                                    <div className="relative w-32 h-32 mx-auto mb-6">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                                            <motion.circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4"
                                                initial={{ strokeDashoffset: 364.4 }} animate={{ strokeDashoffset: 364.4 * (1 - content.market_demand?.score / 10) }} transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="text-indigo-600" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900 leading-none">{content.market_demand?.score}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Score</span>
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-full inline-block uppercase tracking-wider">
                                        High Potential
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1"><Globe size={9} /> Target Demographic</div>
                                <p className="text-sm text-slate-600 leading-relaxed">{content.target_user}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-slate-100">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Strategic Impact</div>
                                <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-3">"{content.market_demand?.analysis}"</p>
                            </div>
                        </div>
                    </div>
                );
            case 'market':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-4">
                                {content.competitors?.map((comp, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex gap-6 items-start hover:bg-white hover:shadow-md transition-all duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                                            <Shield size={18} className="text-slate-900" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-base font-bold text-slate-900 tracking-tight">{comp.name}</h3>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Comp_0{i + 1}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-4">{comp.analysis}</p>
                                            <div className="flex items-center gap-3 px-3 py-2 bg-rose-50 rounded-lg border border-rose-100 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                                                <AlertTriangle size={12} />
                                                <span>Exploit: {comp.weakness_to_exploit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <PieChart size={14} /> Competitive Share
                                </h4>
                                <div className="flex-1 flex flex-col justify-center">
                                    <SimpleBarChart data={content.chart_data} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoBox icon={Activity} title="Market Gap" content={content.the_gap} />
                            <InfoBox icon={Target} title="Defensibility" content={content.differentiation} />
                        </div>
                    </div>
                );
            case 'technical':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-4">
                                <MetricBox label="Viability" value={`${content.viability_score}/10`} subtext="Build feasibility" icon={Cpu} isCompact />
                                <MetricBox label="Capital" value={content.est_mvp_cost} subtext="Projected launch" icon={Layers} isCompact />
                            </div>
                            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Layers size={12} /> Capital Allocation
                                </h4>
                                <SimpleBarChart data={content.chart_data} />
                            </div>
                            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Clock size={12} /> Dev Timeline
                                </h4>
                                <div className="h-full flex flex-col justify-center items-center py-6">
                                    <div className="relative">
                                        <svg className="w-20 h-20 transform -rotate-90">
                                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50" />
                                            <motion.circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="213.6"
                                                initial={{ strokeDashoffset: 213.6 }} animate={{ strokeDashoffset: 213.6 * 0.4 }} transition={{ duration: 1.5 }}
                                                className="text-slate-900" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-slate-900">6</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Mo.</span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">Target Launch</span>
                                </div>
                            </div>
                        </div>

                        <InfoBox icon={Layers} title="Feasibility Thesis" content={content.complexity} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                                    <Cpu size={12} /> Tech Stack
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {content.suggested_stack?.split(',').map((item, i) => (
                                        <div key={i} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                                            {item.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                                    <Layers size={12} /> System Schematic
                                </h4>
                                <div className="text-[10px] font-mono p-4 bg-slate-50 rounded text-slate-500 uppercase leading-relaxed border border-slate-100">
                                    {content.architecture}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'risk':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                {Object.entries(content.risks || {}).map(([key, val], i) => (
                                    <div key={i} className="flex items-center justify-between p-4 px-6 rounded-xl bg-white border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 w-20">{key}</span>
                                            <p className="text-[13px] font-medium text-slate-600 italic">"{val}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-sm flex flex-col items-center min-h-[450px]">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                                    <Activity size={14} className="text-slate-500" /> Risk Profile Analysis
                                </h4>
                                <div className="w-full flex-1 flex items-center justify-center">
                                    <RadarChart data={content.chart_data} darkTheme gridLines visibleValues />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoBox icon={Shield} title="Strengths" content={content.mentor_advice?.appreciate} />
                            <InfoBox icon={AlertTriangle} title="Critique" content={content.mentor_advice?.criticize} />
                            <InfoBox icon={ArrowRight} title="Guidance" content={content.mentor_advice?.advice} />
                        </div>
                        <div className="p-10 rounded-2xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-10 relative z-10 flex items-center gap-3">
                                <Zap size={14} className="text-amber-400" /> Success Roadmap
                            </h3>
                            <div className="space-y-6 relative z-10">
                                {content.immediate_actions?.map((action, i) => (
                                    <div key={i} className="flex gap-6 items-start group">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[12px] font-black text-white border border-white/10 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-300">
                                                0{i + 1}
                                            </div>
                                            {i < content.immediate_actions.length - 1 && (
                                                <div className="w-0.5 h-10 bg-white/5 group-hover:bg-indigo-500/30 transition-colors" />
                                            )}
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 mb-1 block">Phase 0{i + 1}</span>
                                            <p className="text-base font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                                                {action}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                // Generic Fallback: Render any available text/lists if ID doesn't match
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-500 text-sm">
                            Extended Strategic Module: {id.replace(/_/g, ' ')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(content).map(([key, val], i) => {
                                if (['chart_data', 'radar_data', 'isPlaceholder'].includes(key)) return null;
                                return (
                                    <div key={i} className="p-5 rounded-xl bg-white border border-slate-100">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{key.replace(/_/g, ' ')}</h4>
                                        <div className="text-sm text-slate-600 leading-relaxed">
                                            {Array.isArray(val) ? (
                                                <ul className="space-y-1">
                                                    {val.map((item, j) => <li key={j}>• {typeof item === 'object' ? JSON.stringify(item) : item}</li>)}
                                                </ul>
                                            ) : typeof val === 'object' ? (
                                                <pre className="text-[10px] whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                                            ) : (
                                                val
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-[#f8fafc] overflow-y-auto custom-scrollbar pt-10 pb-20">
            <div className="mx-auto w-full px-6 flex justify-center pb-10">
                <div className="flex w-full gap-8 max-w-[1500px] items-start relative min-h-screen">

                    {/* LEFT SIDE: THE DOCUMENT PAGES */}
                    <div ref={reportRef} className="flex-1 space-y-6 min-w-0 relative">
                        {/* Compact Header */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-slate-900 rounded-lg flex items-center justify-center p-2.5">
                                    <img src={LogoIcon} className="w-full h-full invert brightness-0" alt="Logo" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight leading-none mb-1">
                                        {report.project_name || "Venture Strategy"}
                                    </h1>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        System-Generated Analysis • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Protocol Audit</span>
                                    <span className="text-[10px] font-bold text-slate-900 uppercase tabular-nums">VERIFIED_3.02</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>

                        {/* Analysis Modules */}
                        {pages.map((page, idx) => (
                            <motion.div
                                key={page.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-xl border border-slate-200 p-10 relative flex flex-col shadow-sm"
                            >
                                <header className="mb-12 flex justify-between items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-8 bg-slate-900 rounded-full" />
                                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 uppercase tracking-tight">{page.title}</h2>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l border-slate-200 pl-6 ml-6">
                                        Module {idx + 1}
                                    </span>
                                </header>

                                <main className="flex-1">
                                    {renderPageContent(page)}
                                </main>
                            </motion.div>
                        ))}
                    </div>

                    {/* RIGHT SIDE: SIDEBAR — Fixed Implementation */}
                    <div className="w-[340px] shrink-0 lg:block hidden">
                        <div className="fixed top-28 w-[340px] flex flex-col gap-6" 
                             style={{ 
                                 right: 'calc(max(24px, (100vw - 1600px) / 2 + 24px))'
                             }}>

                            {/* Action Card */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
                                {/* Copy — top */}
                                <button onClick={handleCopy}
                                    className={`flex items-center gap-3 w-full px-5 py-4 text-left transition-all active:scale-[0.98] border-b border-slate-100
                                        ${copied ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-700'}`}>
                                    <span className="text-sm font-bold">⎘</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                                        {copied ? 'Copied ✓' : 'Copy Report'}
                                    </span>
                                </button>

                                {/* Export Group */}
                                <div className="p-2 space-y-1">
                                    <button onClick={handleExportPDF} disabled={exporting === 'pdf'}
                                        className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-slate-50 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 group">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <FileText size={14} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                            {exporting === 'pdf' ? 'Generating…' : 'Export Report as PDF'}
                                        </span>
                                    </button>

                                    <button onClick={handleExportDocx} disabled={exporting === 'docx'}
                                        className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-slate-50 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Download size={14} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                            {exporting === 'docx' ? 'Generating…' : 'Export Report as Word'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Generation Progress Indicator */}
                            {reportLoading && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-pulse">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">System Generating</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-400 leading-relaxed font-medium">
                                        Assembling strategic sections in real-time. Do not close this session.
                                    </p>
                                </div>
                            )}
                            {/* Next Phase Navigation Bridge — Streamlined */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#073B99] overflow-hidden shadow-xl relative group"
                            >
                                <div className="p-8 relative z-10">
                                    <div className="flex flex-col gap-2 mb-6">
                                        <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Next Phase</span>
                                        <h4 className="text-white text-2xl font-display tracking-tight leading-none">
                                            Roadmap Engine
                                        </h4>
                                    </div>

                                    <p className="text-white/80 text-[14px] leading-relaxed mb-8">
                                        Transform this analysis into an actionable, 60-day strategic roadmap.
                                    </p>

                                    <button
                                        onClick={handleInitiatePlan}
                                        disabled={planLoading}
                                        className="w-full group relative flex items-center justify-between p-1 bg-white hover:bg-slate-50 text-slate-900 rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] pl-6 py-3.5">
                                            {planLoading ? 'Compiling...' : planInitiated ? 'Open Roadmap' : 'Initialize'}
                                        </span>
                                        <div className="w-11 h-11 bg-slate-900 rounded-lg flex items-center justify-center text-white mr-1 shadow-sm">
                                            {planLoading ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisReport;
