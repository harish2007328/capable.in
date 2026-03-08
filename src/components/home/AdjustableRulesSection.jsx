import React from 'react';

const AdjustableRulesSection = () => (
    <section className="w-full bg-[#FAFBFF] py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-100/50">
                <div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                        Adjustable steps to fit <span className="font-display italic text-[var(--brand-accent)]">your goal</span>
                    </h2>
                </div>
                <div className="flex flex-col">
                    <p className="text-gray-400 text-base sm:text-lg font-sans leading-relaxed max-w-lg mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                        Customize precisely how your venture evolves. Set milestones, tasks, and objectives that match your specific industry standards.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-700 group flex flex-col">
                    <div className="px-8 sm:px-10 pt-10 pb-8">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-[14px] bg-[var(--brand-accent)]/5 border border-[var(--brand-accent)]/10 text-[11px] font-bold text-[var(--brand-accent)] uppercase tracking-widest mb-6">
                            Customisable
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display text-gray-900 mb-4 tracking-tight">Precise Logic</h3>
                        <p className="text-gray-500 text-[16px] leading-relaxed max-w-sm mb-4">
                            Design paths that work for you, not the other way around.
                        </p>
                    </div>
                    <div className="w-full aspect-[16/10] pl-10 pt-10 pr-0 pb-0 mt-auto">
                        <div className="w-full h-full rounded-tl-[24px] overflow-hidden border-t border-l border-gray-100 relative group-hover:border-blue-500/20 transition-colors duration-700">
                            <img src="/market_analysis_vector.png" loading="lazy" alt="Market Analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-blue-500/5 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105 pointer-events-none"></div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-700 group flex flex-col">
                    <div className="px-8 sm:px-10 pt-10 pb-8">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-[14px] bg-[var(--brand-accent)]/5 border border-[var(--brand-accent)]/10 text-[11px] font-bold text-[var(--brand-accent)] uppercase tracking-widest mb-6">
                            Workflows
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display text-gray-900 mb-4 tracking-tight">Insightful Coaching</h3>
                        <p className="text-gray-400 text-[16px] leading-relaxed max-w-sm mb-4">
                            Simplify the complex work and focus on the results.
                        </p>
                    </div>
                    <div className="w-full aspect-[16/10] pl-10 pt-10 pr-0 pb-0 mt-auto">
                        <div className="w-full h-full rounded-tl-[24px] overflow-hidden border-t border-l border-gray-100 relative group-hover:border-blue-500/20 transition-colors duration-700">
                            <img src="/action_roadmap_vector.png" loading="lazy" alt="Market Analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-blue-500/5 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default AdjustableRulesSection;
