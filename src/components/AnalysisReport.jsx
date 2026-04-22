import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, ArrowRight,
    Target, Shield, Zap, BarChart3,
    Cpu, Activity, AlertTriangle, Layers,
    Clock, Globe, TrendingUp, PieChart,
    Lock
} from 'lucide-react';
import { ExportService } from '../services/exportService';
import { useAuth } from '../context/AuthContext';
import { getUserLimits } from '../config/planConfig';
import PricingModal from './PricingModal';
import LogoIcon from '../assets/LOGO ICON.svg';

// --- Premium Page-Based Skeleton ---
const PageSkeleton = () => (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-1000">
        <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-12 w-full bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-50 rounded-full animate-pulse" />
        </div>
        
        <div className="flex-1 space-y-8">
            <div className="h-40 w-full bg-slate-50 rounded-[32px] border border-slate-100/50 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="h-32 bg-slate-50 rounded-2xl animate-pulse" />
                <div className="h-32 bg-slate-50 rounded-2xl animate-pulse" />
            </div>
            <div className="h-48 w-full bg-slate-50 rounded-[32px] animate-pulse" />
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

const DonutChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const safeData = data.map(d => ({ ...d, value: Number(d.value) || 0 }));
    const total = safeData.reduce((acc, d) => acc + d.value, 0) || 100;
    
    const radius = 64;
    const circum = 2 * Math.PI * radius; 
    
    // Nice gradient-like colors starting from primary indigo
    const colors = ["#4f46e5", "#14b8a6", "#f59e0b", "#3b82f6", "#ec4899"];
    
    let currentOffset = 0;
    const slices = safeData.map((d, i) => {
        const percent = d.value / total;
        const strokeLen = percent * circum;
        
        const g = {
             label: d.label,
             value: d.value,
             color: colors[i % colors.length],
             strokeLen,
             cumulativeOffset: currentOffset,
        };
        currentOffset += strokeLen;
        return g;
    });

    return (
        <div className="flex flex-col items-center gap-6 w-full mt-2">
            <div className="relative w-48 h-48 shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                    {/* Background Track */}
                    <circle cx="100" cy="100" r={radius} stroke="#f1f5f9" strokeWidth="18" fill="transparent" />
                    
                    {/* Animated Slices */}
                    {slices.map((s, i) => (
                        <motion.circle 
                            key={i}
                            cx="100" cy="100" r={radius} fill="transparent"
                            stroke={s.color} strokeWidth="18"
                            initial={{ strokeDasharray: `0 ${circum}` }}
                            animate={{ strokeDasharray: `${Math.max(0, s.strokeLen - 3)} ${circum}` }} 
                            strokeDashoffset={-s.cumulativeOffset}
                            transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
                        />
                    ))}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                    <PieChart size={18} className="text-slate-300 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Share</span>
                </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3 w-full border-t border-slate-100 pt-5">
                {slices.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1.5 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: s.color }} />
                                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{s.label}</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-900 tabular-nums">{Math.round((s.value/total)*100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${(s.value/total)*100}%` }} 
                                transition={{ duration: 1.2, delay: 0.3 + (i * 0.1) }} 
                                className="h-full rounded-full" 
                                style={{ backgroundColor: s.color }} 
                            />
                        </div>
                    </div>
                ))}
            </div>
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
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { user } = useAuth();
    const limits = getUserLimits(user);

    if (!report) return null;

    const pages = report.pages || [];

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.95
        })
    };

    const [[page, direction], setPage] = useState([0, 0]);

    const paginate = (newDirection) => {
        const nextIdx = activePageIndex + newDirection;
        if (nextIdx >= 0 && nextIdx < pages.length) {
            setActivePageIndex(nextIdx);
            setPage([nextIdx, newDirection]);
        }
    };

    const handleExportPDF = async () => {
        if (!limits.canExportPDF) {
            setShowUpgradeModal(true);
            return;
        }
        setExporting('pdf');
        await ExportService.exportReportToPDF(report, `${report.project_name || 'Venture'}_Report.pdf`);
        setExporting(null);
    };

    const handleExportDocx = async () => {
        if (!limits.canExportDocx) {
            setShowUpgradeModal(true);
            return;
        }
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
            return <PageSkeleton />;
        }

        switch (id) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-lg overflow-hidden relative">
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-3 block flex items-center gap-2">
                                <Zap size={12} className="text-amber-300" /> The Spark
                            </span>
                            <p className="text-2xl font-display font-medium leading-tight">"{content.elevator_pitch}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={40} /></div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-500 mb-3 block">The Pain</h4>
                                <p className="text-slate-700 leading-relaxed font-medium relative z-10">{content.problem}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={40} /></div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-3 block">The Solution</h4>
                                <p className="text-slate-700 leading-relaxed font-medium relative z-10">{content.solution}</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                                <Target size={14} /> Target Audience
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {content.target_users?.map((user, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">{user.segment}</div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{user.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {content.why_now && (
                            <InfoBox icon={Clock} title="Why Now?" content={content.why_now} className="bg-gradient-to-br from-white to-slate-50" />
                        )}
                        
                        {content.chart_data && content.chart_data.length > 0 && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                                    <TrendingUp size={14} /> Demand Projection
                                </h4>
                                <LineChart data={content.chart_data} />
                            </div>
                        )}
                    </div>
                );
            case 'market':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm h-full flex flex-col justify-center">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 block flex items-center gap-2">
                                    <Globe size={14} /> Market Sizing
                                </h4>
                                <p className="text-slate-700 leading-relaxed font-medium">{content.market_size}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm h-full">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-4 block flex items-center gap-2">
                                    <Activity size={14} /> Growth Signals
                                </h4>
                                <ul className="space-y-3">
                                    {content.growth_signals?.map((signal, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-indigo-900 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            {signal}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Competitive Landscape</h4>
                            {content.competitors?.map((comp, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row gap-4 items-start shadow-sm hover:border-slate-300 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 font-black text-xs">
                                        C{i+1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-slate-900 mb-1">{comp.name}</h3>
                                        <p className="text-sm text-slate-500 mb-3">{comp.what_they_do}</p>
                                        <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm">
                                            <span className="font-bold text-rose-600 text-xs uppercase mr-2 tracking-wide block mb-1">Weakness to Exploit</span>
                                            <span className="text-rose-900 font-medium">{comp.weakness}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoBox icon={Zap} title="Unique Edge (Why You)" content={content.unique_edge} className="border-indigo-100 bg-indigo-50/30 h-full" />
                            <InfoBox icon={Shield} title="The Moat" content={content.differentiation} className="border-emerald-100 bg-emerald-50/30 h-full" />
                        </div>
                        
                        {content.chart_data && content.chart_data.length > 0 && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                    <PieChart size={14} /> Market Share Potential
                                </h4>
                                <DonutChart data={content.chart_data} />
                            </div>
                        )}
                    </div>
                );
            case 'execution':
                return (
                    <div className="space-y-6">
                        <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2 relative z-10">
                                <Layers size={14} className="text-indigo-400" /> How It Works
                            </h4>
                            <div className="space-y-6 relative z-10">
                                {content.how_it_works?.map((step, i) => (
                                    <div key={i} className="flex gap-6 items-start">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                                                {step.step || i + 1}
                                            </div>
                                            {i < (content.how_it_works.length - 1) && <div className="w-0.5 h-6 bg-slate-800 my-1.5" />}
                                        </div>
                                        <p className="pt-1.5 text-slate-200 font-medium">{step.action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoBox icon={Target} title="Business Model" content={content.business_model} className="h-full" />
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm h-full">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 block flex items-center gap-2">
                                    <BarChart3 size={14} /> Revenue Streams
                                </h4>
                                <ul className="space-y-3">
                                    {content.revenue_streams?.map((stream, i) => (
                                        <li key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3 text-sm font-medium text-emerald-900">
                                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center transform shrink-0 shadow-sm font-bold text-xs">$</div>
                                            {stream}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <InfoBox icon={Cpu} title="Feasibility & Reality Check" content={content.feasibility} className="h-full" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <MetricBox label="MVP Cost" value={content.est_mvp_cost} subtext="Estimated setup" icon={Layers} isCompact />
                                <MetricBox label="Timeline" value={content.est_timeline} subtext="Time to MVP" icon={Clock} isCompact />
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Cpu size={14} /> Key Tech Needs
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {content.tech_needs?.map((tech, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wide border border-slate-200">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            
                            {content.chart_data && content.chart_data.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Resource Allocation</h4>
                                    <SimpleBarChart data={content.chart_data} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'reality':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm h-full flex flex-col">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-rose-400" /> Key Risks
                                </h4>
                                <div className="space-y-4 flex-1">
                                    {content.risks?.map((risk, i) => (
                                        <div key={i} className="border-l-2 border-rose-200 pl-4 py-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">{risk.category}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                    String(risk.severity).toLowerCase() === 'high' ? 'bg-rose-100 text-rose-700' :
                                                    String(risk.severity).toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {risk.severity || 'Medium'} Risk
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{risk.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {content.chart_data && content.chart_data.length > 0 && (
                                <div className="p-6 rounded-2xl bg-slate-900 shadow-sm flex flex-col items-center justify-center overflow-hidden border border-slate-800 h-full min-h-[300px]">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2 z-10">
                                        <Activity size={14} className="text-slate-500" /> Risk Profile
                                    </h4>
                                    <div className="w-full flex-1 flex items-center justify-center -my-6">
                                        <RadarChart data={content.chart_data} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 rounded-2xl bg-amber-50 border border-amber-100 relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-[0.03] w-64 h-64 translate-x-12 translate-y-12">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-3 block relative z-10 flex items-center gap-2">
                                Critical Open Questions
                            </h4>
                            <p className="text-amber-900/60 text-sm mb-6 relative z-10 font-medium">Unanswered questions that determine if this idea survives:</p>
                            <ul className="space-y-4 relative z-10">
                                {content.open_questions?.map((q, i) => (
                                    <li key={i} className="flex gap-4 text-amber-900 items-start">
                                        <div className="w-6 h-6 rounded-full bg-amber-200/50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-[-2px] border border-amber-200 shadow-sm">?</div>
                                        <span className="font-medium text-[15px] leading-snug">{q}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 text-white rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg h-full">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-200 mb-6 flex items-center gap-2">
                                    <ArrowRight size={14} /> Validation Plan
                                </h4>
                                <div className="space-y-5">
                                    {content.validation_plan?.map((plan, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px] shrink-0 border border-white/20 shadow-sm">{plan.step || i+1}</div>
                                            <p className="text-sm pt-1 text-indigo-50 font-medium leading-relaxed">{plan.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm h-full">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <Target size={14} /> Future Vision
                                </h4>
                                <ul className="space-y-5">
                                    {content.future_scope?.map((scope, i) => (
                                        <li key={i} className="flex gap-3 text-slate-600 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                            <span className="leading-relaxed font-medium">{scope}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            default:
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
        <div className="w-full h-screen bg-[#f1f5f9] overflow-hidden flex flex-col pt-4">
            <div className="px-6 flex items-center justify-between h-16 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center p-2">
                        <img src={LogoIcon} className="w-full h-full invert brightness-0" alt="Logo" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900 tracking-tight leading-none mb-1">
                            {report.project_name || "Venture Strategy"}
                        </h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Strategic Audit • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleCopy}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleExportPDF}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                        {exporting === 'pdf' ? '...' : 'PDF'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex w-full max-w-[1600px] mx-auto px-6 gap-6 overflow-hidden pb-8">
                <div className="w-72 shrink-0 flex flex-col gap-4 py-4">
                    <div className="bg-white/50 rounded-2xl p-2 border border-slate-200/50">
                        {pages.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => { setPage([idx, idx > activePageIndex ? 1 : -1]); setActivePageIndex(idx); }}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${activePageIndex === idx ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-white/40'}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activePageIndex === idx ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                    {p.isPlaceholder ? <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                </div>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider truncate w-full ${activePageIndex === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {p.title}
                                    </span>
                                    <span className="text-[9px] font-medium text-slate-400">
                                        {p.isPlaceholder ? 'Analyzing...' : 'Strategic Module'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center py-4">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={activePageIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = Math.abs(offset.x) * velocity.x;
                                if (swipe < -10000) paginate(1);
                                else if (swipe > 10000) paginate(-1);
                            }}
                            onClick={() => setIsFullScreen(true)}
                            className="w-full h-full max-w-4xl bg-white rounded-[40px] border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-12 overflow-y-auto custom-scrollbar cursor-zoom-in relative"
                        >
                            {pages[activePageIndex]?.isPlaceholder && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-[40px]">
                                    <div className="flex items-center gap-2 mb-4">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synthesizing Intelligence</span>
                                </div>
                            )}

                            <header className="mb-12 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 bg-slate-900 rounded-full" />
                                    <h2 className="text-4xl font-semibold text-slate-900 uppercase tracking-tighter leading-none">
                                        {pages[activePageIndex].title}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Module ID</div>
                                    <div className="text-[11px] font-black text-slate-900 tabular-nums">00{activePageIndex + 1}_STR</div>
                                </div>
                            </header>

                            <main className="pb-12">
                                {renderPageContent(pages[activePageIndex])}
                            </main>

                            <footer className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center opacity-30 pointer-events-none">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Capable Intelligence Report</span>
                                <span className="text-[9px] font-bold tabular-nums">Page {activePageIndex + 1} of {pages.length}</span>
                            </footer>
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                        <button 
                            disabled={activePageIndex === 0}
                            onClick={() => paginate(-1)}
                            className="w-12 h-12 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all pointer-events-auto disabled:opacity-0 active:scale-90"
                        >
                            <ArrowRight size={20} className="rotate-180" />
                        </button>
                        <button 
                            disabled={activePageIndex === pages.length - 1}
                            onClick={() => paginate(1)}
                            className="w-12 h-12 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all pointer-events-auto disabled:opacity-0 active:scale-90"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-24 bg-white/80 backdrop-blur-md border-t border-slate-200/60 shrink-0 flex items-center justify-center px-8 z-40">
                <div className="flex items-center gap-3 max-w-full overflow-x-auto no-scrollbar py-2">
                    {pages.map((p, idx) => (
                        <button
                            key={p.id}
                            onClick={() => { setPage([idx, idx > activePageIndex ? 1 : -1]); setActivePageIndex(idx); }}
                            className={`h-14 w-20 rounded-lg shrink-0 transition-all relative overflow-hidden group ${activePageIndex === idx ? 'ring-2 ring-slate-900 ring-offset-2' : 'ring-1 ring-slate-200 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-1">
                                <div className="w-full h-full bg-white rounded border border-slate-200/50 flex flex-col p-1 gap-1">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-[1px]" />
                                    <div className="flex-1 w-full bg-slate-50/50 rounded-[1px] flex items-center justify-center">
                                         {p.isPlaceholder ? <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" /> : <span className="text-[8px] font-bold text-slate-300">{idx+1}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={`absolute bottom-0 inset-x-0 h-1 transition-all ${activePageIndex === idx ? 'bg-slate-900' : 'bg-transparent group-hover:bg-slate-200'}`} />
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="px-8 flex items-center justify-between h-20 shrink-0 border-b border-white/5">
                             <div className="flex items-center gap-4 text-white">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{pages[activePageIndex].title}</span>
                             </div>
                             <button 
                                onClick={() => setIsFullScreen(false)}
                                className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                             >
                                <span className="text-xl">×</span>
                             </button>
                        </div>

                        <div className="flex-1 overflow-hidden relative flex items-center justify-center px-4 md:px-20">
                             <motion.div 
                                className="w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-[40px] shadow-2xl p-12 overflow-y-auto custom-scrollbar-dark"
                             >
                                <header className="mb-12 flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">IMMERSED VIEW</div>
                                        <h2 className="text-5xl font-semibold text-slate-900 tracking-tight">{pages[activePageIndex].title}</h2>
                                    </div>
                                </header>
                                <main>
                                    {renderPageContent(pages[activePageIndex])}
                                </main>
                             </motion.div>

                             {/* Fullscreen Navigation */}
                             <div className="absolute inset-y-0 inset-x-4 md:inset-x-8 flex justify-between items-center pointer-events-none">
                                <button 
                                    disabled={activePageIndex === 0}
                                    onClick={() => paginate(-1)}
                                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all pointer-events-auto disabled:opacity-0 active:scale-90"
                                >
                                    <ArrowRight size={24} className="rotate-180" />
                                </button>
                                <button 
                                    disabled={activePageIndex === pages.length - 1}
                                    onClick={() => paginate(1)}
                                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all pointer-events-auto disabled:opacity-0 active:scale-90"
                                >
                                    <ArrowRight size={24} />
                                </button>
                             </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="h-16 shrink-0 border-t border-white/5 flex items-center justify-between px-8 text-white/40">
                             <span className="text-[10px] font-bold uppercase tracking-widest">Navigation: Page {activePageIndex + 1} of {pages.length}</span>
                             
                             {!hasPlan && activePageIndex === pages.length - 1 && (
                                 <button
                                     onClick={handleInitiatePlan}
                                     disabled={planLoading}
                                     className="px-6 py-2 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 pointer-events-auto"
                                 >
                                     {planLoading ? 'Compiling...' : 'Generate Roadmap'}
                                 </button>
                             )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            {showUpgradeModal && (
                <PricingModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    highlightedFeature={exporting === 'pdf' ? "PDF Exports" : "Advanced Reports"}
                />
            )}
        </div>
    );
};

export default AnalysisReport;
