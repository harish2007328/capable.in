import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        
        <div className="flex-1 space-y-6">
            <div className="h-32 w-full bg-slate-50 rounded-md border border-slate-100/50 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="h-24 bg-slate-50 rounded-md animate-pulse" />
                <div className="h-24 bg-slate-50 rounded-md animate-pulse" />
            </div>
            <div className="h-40 w-full bg-slate-50 rounded-md animate-pulse" />
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
    <div className={`p-6 rounded-md bg-white border border-slate-200 shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-3">
            <div className="text-slate-700">
                <Icon size={16} />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{title}</h4>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
            {content}
        </p>
    </div>
);

const MetricBox = ({ label, value, subtext, icon: Icon, isCompact = false }) => (
    <div className={`p-5 rounded-md bg-white border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon size={32} />
        </div>
        <div className="relative z-10">
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">{label}</div>
            <div className="text-xl font-bold text-slate-900 leading-none mb-1">{value}</div>
            <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{subtext}</div>
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
                    <div className="space-y-12">
                        <div className="relative py-12 px-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 shadow-[inset_0_0_20px_rgba(255,255,255,1)]">
                            <div className="absolute top-0 left-10 -translate-y-1/2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap size={14} /> The Spark
                            </div>
                            <p className="text-3xl font-serif text-slate-900 leading-snug font-medium">"{content.elevator_pitch}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3"><AlertTriangle size={16} className="text-rose-400"/> The Pain</h4>
                                <p className="text-lg text-slate-600 leading-relaxed font-light">{content.problem}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3"><Shield size={16} className="text-emerald-400"/> The Solution</h4>
                                <p className="text-lg text-slate-600 leading-relaxed font-light">{content.solution}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Target size={16} className="text-blue-400"/> Target Audience
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {content.target_users?.map((user, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3">{user.segment}</div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{user.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {content.why_now && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3"><Clock size={16} className="text-amber-400"/> Why Now?</h4>
                                <p className="text-lg text-slate-600 leading-relaxed font-light">{content.why_now}</p>
                            </div>
                        )}
                        
                        {content.chart_data && content.chart_data.length > 0 && (
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-8">
                                    <TrendingUp size={16} className="text-indigo-400"/> Demand Projection
                                </h4>
                                <div className="h-64 w-full">
                                    <LineChart data={content.chart_data} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'market':
                return (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Globe size={100} />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2 relative z-10">
                                    Market Sizing
                                </h4>
                                <p className="text-3xl font-serif leading-snug relative z-10">{content.market_size}</p>
                            </div>
                            
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                    <Activity size={16} className="text-emerald-500"/> Growth Signals
                                </h4>
                                <ul className="space-y-4">
                                    {content.growth_signals?.map((signal, i) => (
                                        <li key={i} className="flex gap-4 text-sm text-slate-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                            {signal}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">Competitive Landscape</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {content.competitors?.map((comp, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 text-slate-400 font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                            C{i+1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-bold text-slate-900">{comp.name}</h3>
                                            <p className="text-sm text-slate-500">{comp.what_they_do}</p>
                                        </div>
                                        <div className="w-full md:w-1/3 p-4 rounded-xl bg-rose-50/50 border border-rose-100/50">
                                            <span className="font-black text-rose-500 text-[10px] uppercase tracking-widest block mb-1">Vulnerability</span>
                                            <span className="text-slate-700 text-sm">{comp.weakness}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3"><Zap size={16} className="text-amber-400"/> Unique Edge</h4>
                                <p className="text-base text-slate-600 leading-relaxed">{content.unique_edge}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3"><Shield size={16} className="text-indigo-400"/> The Moat</h4>
                                <p className="text-base text-slate-600 leading-relaxed">{content.differentiation}</p>
                            </div>
                        </div>
                        
                        {content.chart_data && content.chart_data.length > 0 && (
                            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center gap-12">
                                <div className="w-64 h-64 shrink-0">
                                    <DonutChart data={content.chart_data} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-serif text-slate-900 mb-2">Market Share Potential</h4>
                                    <p className="text-slate-500 text-sm">Estimated addressable segments based on initial rollout capabilities.</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'execution':
                return (
                    <div className="space-y-12">
                        <div className="space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Layers size={16} className="text-indigo-500"/> Sequence of Operations
                            </h4>
                            <div className="relative">
                                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-100" />
                                <div className="space-y-6">
                                    {content.how_it_works?.map((step, i) => (
                                        <div key={i} className="flex gap-8 items-start relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 flex items-center justify-center font-black text-sm border-2 border-slate-100 shadow-sm shrink-0">
                                                {step.step || i + 1}
                                            </div>
                                            <div className="pt-4">
                                                <p className="text-lg text-slate-700">{step.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                    <Target size={16} className="text-rose-400"/> Business Model
                                </h4>
                                <p className="text-base text-slate-700 leading-relaxed">{content.business_model}</p>
                            </div>
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-emerald-500"/> Revenue Streams
                                </h4>
                                <ul className="space-y-3">
                                    {content.revenue_streams?.map((stream, i) => (
                                        <li key={i} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4 text-sm text-slate-700 shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center font-black text-xs shrink-0">$</div>
                                            {stream}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                            <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                    <Cpu size={16} className="text-blue-400"/> Feasibility Check
                                </h4>
                                <p className="text-lg leading-relaxed text-slate-200">{content.feasibility}</p>
                            </div>
                            <div className="grid grid-rows-2 gap-4">
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">MVP Setup Cost</span>
                                        <span className="text-2xl font-serif text-slate-900">{content.est_mvp_cost}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300"><Layers size={20}/></div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time to Market</span>
                                        <span className="text-2xl font-serif text-slate-900">{content.est_timeline}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300"><Clock size={20}/></div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <Cpu size={16} /> Tech Stack Needs
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {content.tech_needs?.map((tech, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            
                            {content.chart_data && content.chart_data.length > 0 && (
                                <div className="mt-6 pt-5 border-t border-slate-100">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4">Resource Allocation</h4>
                                    <SimpleBarChart data={content.chart_data} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'reality':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-sm h-full flex flex-col">
                                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                                    <AlertTriangle size={12} className="text-slate-400" /> Key Risks
                                </h4>
                                <div className="space-y-3 flex-1">
                                    {content.risks?.map((risk, i) => (
                                        <div key={i} className="border-l-2 border-slate-200 pl-3 py-0.5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">{risk.category}</span>
                                                <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600">
                                                    {risk.severity || 'Medium'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600">{risk.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {content.chart_data && content.chart_data.length > 0 && (
                                <div className="p-5 rounded-md bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center overflow-hidden h-full min-h-[260px]">
                                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-1.5 z-10 w-full text-left">
                                        <Activity size={12} /> Risk Profile
                                    </h4>
                                    <div className="w-full flex-1 flex items-center justify-center -my-4">
                                        <RadarChart data={content.chart_data} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 rounded-md bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                            <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 block relative z-10 flex items-center gap-1.5">
                                Critical Open Questions
                            </h4>
                            <p className="text-slate-500 text-xs mb-4 relative z-10">Unanswered questions determining viability:</p>
                            <ul className="space-y-3 relative z-10">
                                {content.open_questions?.map((q, i) => (
                                    <li key={i} className="flex gap-3 text-slate-700 items-start">
                                        <div className="w-5 h-5 rounded bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200">?</div>
                                        <span className="text-sm leading-snug">{q}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-sm h-full">
                                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                                    <ArrowRight size={12} /> Validation Plan
                                </h4>
                                <div className="space-y-4">
                                    {content.validation_plan?.map((plan, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center font-bold text-[10px] text-slate-500 shrink-0 border border-slate-200">{plan.step || i+1}</div>
                                            <p className="text-xs text-slate-700 leading-relaxed">{plan.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-sm h-full">
                                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                                    <Target size={12} /> Future Vision
                                </h4>
                                <ul className="space-y-3">
                                    {content.future_scope?.map((scope, i) => (
                                        <li key={i} className="flex gap-2 text-slate-700 items-start">
                                            <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                            <span className="text-xs leading-relaxed">{scope}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <div className="p-5 rounded-md bg-white border border-slate-200 italic text-slate-500 text-xs">
                            Extended Strategic Module: {id.replace(/_/g, ' ')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(content).map(([key, val], i) => {
                                if (['chart_data', 'radar_data', 'isPlaceholder'].includes(key)) return null;
                                return (
                                    <div key={i} className="p-4 rounded-md bg-white border border-slate-200 shadow-sm">
                                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{key.replace(/_/g, ' ')}</h4>
                                        <div className="text-xs text-slate-600 leading-relaxed">
                                            {Array.isArray(val) ? (
                                                <ul className="space-y-1">
                                                    {val.map((item, j) => <li key={j}>• {typeof item === 'object' ? JSON.stringify(item) : item}</li>)}
                                                </ul>
                                            ) : typeof val === 'object' ? (
                                                <pre className="text-[9px] whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
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
        <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col font-sans min-h-0">
            <div className="flex-1 flex overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col bg-white border-r border-slate-200 overflow-hidden min-h-0">
                    <div className="flex-1 relative flex items-center overflow-hidden min-h-0">
                        <motion.div 
                            className="absolute inset-y-8 left-12 flex gap-12"
                            animate={{ x: -(activePageIndex * (900 + 48)) }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {pages.map((p, idx) => (
                                <div key={p.id} style={{ width: 900 }} className="shrink-0 h-full bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-12 overflow-y-auto custom-scrollbar relative flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => setIsFullScreen(true)} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                        </button>
                                    </div>
                                    
                                    {p.isPlaceholder && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                {[0, 1, 2].map(i => (
                                                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                ))}
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Synthesizing Module</span>
                                        </div>
                                    )}

                                    <header className="mb-10 pb-8 border-b border-slate-100 flex justify-between items-end shrink-0">
                                        <div>
                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                Module 0{idx + 1}
                                            </div>
                                            <h2 className="text-4xl font-serif text-slate-900 tracking-tight leading-none">
                                                {p.title}
                                            </h2>
                                        </div>
                                    </header>

                                    <main className="flex-1">
                                        {renderPageContent(p)}
                                    </main>
                                </div>
                            ))}
                        </motion.div>

                        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

                        <button 
                            disabled={activePageIndex === 0}
                            onClick={() => paginate(-1)}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all pointer-events-auto disabled:opacity-0"
                        >
                            <ArrowRight size={20} className="rotate-180" />
                        </button>
                        <button 
                            disabled={activePageIndex === pages.length - 1}
                            onClick={() => paginate(1)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all pointer-events-auto disabled:opacity-0"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="h-28 bg-slate-100 flex items-center px-8 z-20 shrink-0 border-t border-slate-200">
                        <span className="text-xl font-medium text-slate-800 mr-8 tracking-tight">Navigation</span>
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                            {pages.map((p, idx) => (
                                <button
                                    key={p.id}
                                    onClick={() => { setPage([idx, idx > activePageIndex ? 1 : -1]); setActivePageIndex(idx); }}
                                    className={`h-16 px-6 bg-white flex flex-col justify-center transition-all relative overflow-hidden border ${activePageIndex === idx ? 'border-slate-400 shadow-sm opacity-100' : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                                >
                                    <span className="text-xs text-slate-600 text-left leading-tight">Thumbnail<br/>of page {idx+1}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-80 shrink-0 bg-slate-50 flex flex-col p-8 gap-6 z-30 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center p-2.5 shrink-0">
                            <img src={LogoIcon} className="w-full h-full invert brightness-0" alt="Logo" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1 line-clamp-1">
                                {report.project_name || "Venture Strategy"}
                            </h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Strategic Audit
                            </p>
                        </div>
                    </div>

                    {!hasPlan && (
                        <button
                            onClick={handleInitiatePlan}
                            disabled={planLoading}
                            className="w-full py-4 px-4 bg-indigo-600 text-white text-sm font-bold tracking-wide hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-between rounded-md mt-2"
                        >
                            {planLoading ? 'Compiling...' : 'Move on to the next phase'} <ArrowRight size={16} />
                        </button>
                    )}

                    <div className="flex flex-col gap-3 mt-4">
                        <button onClick={handleCopy}
                            className={`w-full py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between border rounded-md ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
                            {copied ? 'Copied' : 'Copy Report'} <FileText size={16} />
                        </button>
                        
                        <button onClick={handleExportPDF}
                            className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 shadow-sm rounded-md transition-all flex items-center justify-between group">
                            {exporting === 'pdf' ? 'Preparing PDF...' : 'Download as PDF'} 
                            {limits.canExportPDF ? <Download size={16} className="group-hover:-translate-y-0.5 transition-transform"/> : <Lock size={16} className="text-slate-400" />}
                        </button>
                        
                        <button onClick={handleExportDocx}
                            className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 shadow-sm rounded-md transition-all flex items-center justify-between group">
                            {exporting === 'docx' ? 'Preparing Docx...' : 'Download as Docx'} 
                            {limits.canExportDocx ? <Download size={16} className="group-hover:-translate-y-0.5 transition-transform"/> : <Lock size={16} className="text-slate-400" />}
                        </button>
                    </div>
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
