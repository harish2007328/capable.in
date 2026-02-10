import React from 'react';
import { ArrowRight } from 'lucide-react';

const ActionStep = ({ action, onRestart }) => {
    return (
        <div className="w-full max-w-3xl flex flex-col items-center space-y-12 animate-fade-in-up">
            <div className="text-center space-y-4">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    Recommended Strategy
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-medium text-slate-900 leading-tight">
                    {action}
                </h2>
            </div>

            <button
                onClick={onRestart}
                className="px-8 py-3.5 rounded-full bg-slate-900 text-white font-medium hover:bg-brand-blue transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
                Start New Session <ArrowRight size={18} />
            </button>
        </div>
    );
};

export default ActionStep;
