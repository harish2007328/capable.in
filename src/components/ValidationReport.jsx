import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ShieldCheck } from 'lucide-react';

export const ValidationReport = ({ project, isValidating, validationSeconds, setActiveRightTab }) => {
    const rep = project?.data?.validationReport;

    if (rep) {
        return (
            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar text-left space-y-5 pb-6">
                {/* Section 1: Overview */}
                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Overview</span>
                    <h4 className="text-[13px] font-bold text-zinc-800 mt-1">{rep.overview?.elevator_pitch}</h4>
                    <div className="mt-3 space-y-2 text-[12px] leading-relaxed">
                        <p className="text-zinc-600"><strong className="text-zinc-800">Problem:</strong> {rep.overview?.problem}</p>
                        <p className="text-zinc-600"><strong className="text-zinc-800">Solution:</strong> {rep.overview?.solution}</p>
                        <p className="text-zinc-600"><strong className="text-zinc-800">Why Now:</strong> {rep.overview?.why_now}</p>
                    </div>
                </div>

                {/* Section 2: Market Analysis */}
                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Market & Competitors</span>
                    <p className="text-[12px] text-zinc-600 mt-1.5 leading-relaxed">{rep.market?.market_size}</p>
                    <div className="mt-3 space-y-2.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Key Competitors</span>
                        {rep.market?.competitors?.map((comp, idx) => (
                            <div key={idx} className="bg-white border border-zinc-200/60 rounded-xl p-3 text-[12px]">
                                <div className="flex justify-between items-center font-bold text-zinc-800">
                                    <span>{comp.name}</span>
                                </div>
                                <p className="text-zinc-500 mt-1 text-[11px] leading-relaxed">{comp.what_they_do}</p>
                                <p className="text-zinc-600 mt-1 text-[11px] leading-relaxed"><strong className="text-zinc-700">Weakness:</strong> {comp.weakness}</p>
                            </div>
                        ))}
                    </div>
                    {rep.market?.unique_edge && (
                        <div className="mt-3.5 pt-3 border-t border-zinc-200/60 text-[12px] leading-relaxed">
                            <strong className="text-zinc-800 block mb-0.5">Your Competitive Moat</strong>
                            <p className="text-zinc-600">{rep.market?.unique_edge}</p>
                        </div>
                    )}
                </div>

                {/* Section 3: Execution Engine */}
                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Execution</span>
                    <div className="mt-2.5 flex justify-between gap-3 text-center">
                        <div className="flex-1 bg-white border border-zinc-200/60 rounded-xl p-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Est. MVP Cost</span>
                            <p className="text-[13px] font-bold text-zinc-800 mt-0.5">{rep.execution?.est_mvp_cost}</p>
                        </div>
                        <div className="flex-1 bg-white border border-zinc-200/60 rounded-xl p-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Timeline</span>
                            <p className="text-[13px] font-bold text-zinc-800 mt-0.5">{rep.execution?.est_timeline}</p>
                        </div>
                    </div>
                    <div className="mt-3.5 text-[12px] leading-relaxed space-y-2">
                        <p className="text-zinc-600"><strong className="text-zinc-800">Business Model:</strong> {rep.execution?.business_model}</p>
                        {rep.execution?.feasibility && (
                            <p className="text-zinc-600"><strong className="text-zinc-800">Build Feasibility:</strong> {rep.execution?.feasibility}</p>
                        )}
                    </div>
                </div>

                {/* Section 4: Risks & Validation */}
                <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Reality Check</span>
                    <div className="mt-3 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Key Risks</span>
                        {rep.reality?.risks?.map((risk, idx) => (
                            <div key={idx} className="flex justify-between items-start text-[12px] border-b border-zinc-100 last:border-b-0 py-1.5">
                                <div className="pr-4">
                                    <span className="font-semibold text-zinc-800">{risk.category}: </span>
                                    <span className="text-zinc-500 leading-normal text-[11.5px]">{risk.description}</span>
                                </div>
                                <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${risk.severity === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>{risk.severity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isValidating) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center select-none">
                <Bot size={40} className="text-[#303030] animate-bounce mb-4" />
                <h4 className="text-[14.5px] font-bold text-zinc-800 font-sans">Structuring Validation Report...</h4>
                <p className="text-[12px] text-zinc-500 mt-2 leading-relaxed max-w-xs">
                    Capable is analyzing market signals, competitor weaknesses, and feasibility in the background.
                </p>
                <div className="w-full max-w-[200px] bg-zinc-200 h-1.5 rounded-full overflow-hidden mt-4 mb-2">
                    <div className="bg-zinc-800 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">Elapsed time: {validationSeconds}s</span>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center select-none">
            <ShieldCheck size={40} className="text-zinc-300 mb-4 animate-pulse" />
            <h4 className="text-[14.5px] font-bold text-zinc-700 font-sans">Validation Report Pending</h4>
            <p className="text-[12px] text-zinc-400 mt-2 leading-relaxed max-w-xs">
                Your custom validation report will generate automatically in the background once you complete the onboarding questionnaire in the **Capable** tab.
            </p>
            <button
                onClick={() => setActiveRightTab('chat')}
                className="mt-5 px-4 py-2 bg-zinc-800 text-white hover:bg-black rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
                Go to Onboarding Chat
            </button>
        </div>
    );
};
