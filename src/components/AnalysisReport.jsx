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
    const radius = 70;
    const pointsCount = 5;

    const chartData = data.slice(0, pointsCount);

    const pts = chartData.map((d, i) => {
        const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
        const r = (d.value / 10) * radius;
        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
            lx: cx + (radius + 18) * Math.cos(angle),
            ly: cy + (radius + 18) * Math.sin(angle),
            value: d.value,
            label: d.label
        };
    });

    const path = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

    return (
        <div className="w-full mt-4 rounded-2xl overflow-hidden bg-slate-900 p-4 shadow-lg">
            <svg viewBox="0 0 200 200" className="w-full" style={{ height: 260 }}>
                {/* Concentric pentagon grids */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => {
                    const gPts = Array.from({ length: pointsCount }).map((_, i) => {
                        const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
                        return `${cx + radius * scale * Math.cos(angle)},${cy + radius * scale * Math.sin(angle)}`;
                    }).join(' ');
                    return <polygon key={scale} points={gPts} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.8" />;
                })}

                {/* Radial axes */}
                {Array.from({ length: pointsCount }).map((_, i) => {
                    const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
                    return <line key={i} x1={cx} y1={cy}
                        x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)}
                        stroke="white" strokeOpacity="0.06" strokeWidth="0.8" />;
                })}

                {/* Data polygon */}
                <motion.path
                    d={path}
                    fill="rgba(96, 165, 250, 0.2)"
                    stroke="#60a5fa"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                />

                {/* Vertex dots + labels */}
                {pts.map((p, i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
                        <circle cx={p.x} cy={p.y} r="1.5" fill="#60a5fa" />
                        {/* Value */}
                        <text x={p.x} y={p.y - 8} textAnchor="middle"
                            fill="white" fontSize="7" fontWeight="700"
                            fontFamily="ui-monospace, monospace" opacity="0.9">
                            {p.value}
                        </text>
                        {/* Label */}
                        <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
                            fill="#94a3b8" fontSize="7" fontWeight="600"
                            fontFamily="system-ui, sans-serif">
                            {p.label}
                        </text>
                    </motion.g>
                ))}
            </svg>

            {/* Legend row */}
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 px-2 mt-1">
                {chartData.map((d, i) => (
                    <span key={i} className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                        {d.label}
                    </span>
                ))}
            </div>
        </div>
    );
};


// --- Container Components ---

const InfoBox = ({ icon: Icon, title, content, className = "" }) => (
    <div className={`p-6 rounded-xl bg-slate-50 border border-slate-100 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center text-slate-900 border border-slate-100">
                <Icon size={14} />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</h4>
        </div>
        <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
            {content}
        </p>
    </div>
);

const MetricBox = ({ label, value, subtext, icon: Icon, isCompact = false }) => (
    <div className={`p-6 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between ${isCompact ? 'min-h-[120px]' : 'min-h-[150px]'}`}>
        <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
            <Icon size={14} className="text-slate-300" />
        </div>
        <div>
            <div className={`font-bold text-slate-900 mb-1 ${value?.length > 15 ? 'text-lg' : 'text-2xl'}`}>
                {value}
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{subtext}</div>
        </div>
    </div>
);

const AnalysisReport = ({ report, onAccept, planLoading = false }) => {
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
        const { id, content } = page;

        switch (id) {
            case 'executive':
                return (
                    <div className="space-y-3">

                        {/* Summary */}
                        <div className="p-5 rounded-xl bg-slate-900 text-white">
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2 block">Executive Summary</span>
                            <p className="text-sm font-medium leading-relaxed font-serif italic text-slate-200">{content.explanation}</p>
                        </div>

                        {/* Chart + Market Demand — same row */}
                        <div className="grid grid-cols-3 gap-3 items-stretch">
                            <div className="col-span-2 p-4 rounded-xl bg-white border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><TrendingUp size={10}/> Traction Projection</span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">12-Month</span>
                                </div>
                                <LineChart data={content.chart_data} />
                            </div>
                            <div className="p-5 rounded-xl bg-white border border-slate-100 flex flex-col justify-center gap-1.5">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Market Demand</div>
                                <div className="text-4xl font-bold text-slate-900 tabular-nums leading-none">
                                    {content.market_demand?.score}<span className="text-lg text-slate-300">/10</span>
                                </div>
                                <div className="text-[8px] text-slate-400 uppercase tracking-widest">Interest Score</div>
                            </div>
                        </div>

                        {/* Info row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1"><Globe size={9}/> Target Demographic</div>
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
                                    <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                            <Shield size={14} className="text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                                                <span className="text-[8px] font-black text-slate-300 uppercase">0{i + 1}</span>
                                            </div>
                                            <p className="text-[13px] text-slate-500 leading-relaxed mb-2">{comp.analysis}</p>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-rose-500 uppercase tracking-wide">
                                                <AlertTriangle size={10} />
                                                <span>Weakness: {comp.weakness_to_exploit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <PieChart size={12} /> Competitive Share
                                </h4>
                                <SimpleBarChart data={content.chart_data} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="space-y-2">
                                    {content.suggested_stack?.split(',').map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0 text-[13px] font-bold text-slate-700">
                                            <div className="w-1 h-1 bg-slate-100 rounded-full" />
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
                            <div className="p-8 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Exposure Profile</h4>
                                <div className="w-full max-w-[400px]">
                                    <RadarChart data={content.chart_data} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoBox icon={Shield} title="Strengths" content={content.mentor_advice?.appreciate} />
                            <InfoBox icon={AlertTriangle} title="Critique" content={content.mentor_advice?.criticize} />
                            <InfoBox icon={ArrowRight} title="Guidance" content={content.mentor_advice?.advice} />
                        </div>

                        <div className="p-8 rounded-xl bg-slate-900 text-white shadow-xl">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8">Success Roadmap</h3>
                            <div className="space-y-4">
                                {content.immediate_actions?.map((action, i) => (
                                    <div key={i} className="flex gap-4 items-center group">
                                        <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/30 border border-white/5 uppercase">
                                            Step 0{i + 1}
                                        </div>
                                        <p className="text-sm font-bold tracking-tight uppercase group-hover:text-white transition-colors">
                                            {action}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full bg-[#f1f5f9] overflow-y-auto custom-scrollbar pt-10 pb-32">
            <div className="mx-auto w-full px-6 flex justify-center">
                <div className="flex w-full gap-6 max-w-[1500px] items-start relative">

                    {/* LEFT SIDE: THE DOCUMENT PAGES */}
                    <div ref={reportRef} className="flex-1 space-y-6 min-w-0">
                        {/* Compact Header */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-slate-900 rounded-lg flex items-center justify-center p-2.5">
                                    <img src={LogoIcon} className="w-full h-full invert brightness-0" alt="Logo" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">
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
                                <header className="mb-10 flex justify-between items-center bg-slate-50/80 p-5 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">{page.title}</h2>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-4 ml-4">
                                        Mod {idx + 1}
                                    </span>
                                </header>

                                <main className="flex-1">
                                    {renderPageContent(page)}
                                </main>

                                <footer className="mt-14 pt-6 border-t border-slate-50 flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                    <span>Capable Intelligence • Internal Protocol</span>
                                    <span>{idx + 1} / {pages.length}</span>
                                </footer>
                            </motion.div>
                        ))}
                    </div>

                    {/* RIGHT SIDE: SIDEBAR */}
                    <div className="w-[200px] shrink-0 sticky top-0 h-screen flex flex-col">
                        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4 mb-10">

                            {/* Copy — top */}
                            <button onClick={handleCopy}
                                className={`flex items-center gap-3 w-full px-5 py-4 text-left transition-colors border-b border-slate-100
                                    ${copied ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-700'}`}>
                                <span className="text-base leading-none">⎘</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {copied ? 'Copied ✓' : 'Copy Report'}
                                </span>
                            </button>

                            {/* Export */}
                            <button onClick={handleExportPDF} disabled={exporting === 'pdf'}
                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 disabled:opacity-40">
                                <FileText size={12} className="text-slate-400 shrink-0" />
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                    {exporting === 'pdf' ? 'Generating…' : 'PDF'}
                                </span>
                            </button>

                            <button onClick={handleExportDocx} disabled={exporting === 'docx'}
                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 disabled:opacity-40">
                                <Download size={12} className="text-slate-400 shrink-0" />
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                    {exporting === 'docx' ? 'Generating…' : 'Word / DOCX'}
                                </span>
                            </button>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Initiate Plan — bottom */}
                            <div className="p-4 border-t border-slate-100">
                                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors
                                                ${planInitiated ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/25">
                                                {planInitiated ? 'Phase 2 Active' : 'Phase 1 Done'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-white leading-snug">
                                            {planInitiated ? 'Your plan is ready' : 'Build your roadmap'}
                                        </p>
                                        <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                                            {planInitiated ? 'Go to the task board.' : 'Generate a precision execution plan.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleInitiatePlan}
                                        disabled={planLoading}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50
                                            ${planInitiated ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-white hover:bg-slate-100 text-slate-900'}`}>
                                        <span>
                                            {planLoading ? 'Generating…' : planInitiated ? 'Go to Plan' : 'Initiate Plan'}
                                        </span>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all group-hover:translate-x-0.5
                                            ${planInitiated ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                                            {planLoading
                                                ? <div className="w-2 h-2 border border-current/30 border-t-current rounded-full animate-spin" />
                                                : <ArrowRight size={10} />}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default AnalysisReport;
