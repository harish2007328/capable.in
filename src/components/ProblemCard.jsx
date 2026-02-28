import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const ProblemCard = ({ title, category, description, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`group bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-blue-100 relative overflow-hidden flex flex-col justify-between min-h-[320px] ${className}`}
        >
            <div className="space-y-6">
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-[var(--brand-accent)] text-xs font-bold uppercase tracking-widest rounded-full border border-blue-100">
                    {category}
                </span>

                <h3 className="text-3xl font-display font-normal text-brand-black leading-none group-hover:text-brand-blue transition-colors tracking-tight">
                    {title}
                </h3>

                {description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 font-medium">
                        {description}
                    </p>
                )}
            </div>

            <div className="mt-8 flex justify-end">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[var(--brand-accent)] group-hover:bg-gradient-to-br group-hover:from-[var(--brand-accent)] group-hover:to-[var(--brand-accent-hover)] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    <ArrowUpRight size={24} />
                </div>
            </div>
        </div>
    );
};

export default ProblemCard;
