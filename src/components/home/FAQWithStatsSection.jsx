import React, { useState } from 'react';

const FAQWithStatsSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "What data sources does Capable actually use?",
            answer: "We scrape search engine results for market validation and pull community discussions for social signals. Then our AI model analyzes everything to generate your strategic report and 60-day plan."
        },
        {
            question: "Where is my data stored?",
            answer: "Your data is secured with enterprise-grade encryption. There's no backend database or external servers. Your project data, reports, and action plans are kept private."
        },
        {
            question: "How does the adaptive question wizard work?",
            answer: "After scraping signals, our AI generates 5-7 questions tailored to your specific idea. It detects if you're local or global, and adapts based on your business model."
        },
        {
            question: "Can the AI mentor help during execution?",
            answer: "Yes. The mentor chat knows your original idea, your full action plan, and your progress. It provides context-aware guidance, not generic advice."
        }
    ];

    return (
        <section className="w-full py-20 bg-[#FAFBFF]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 md:mb-20 pt-16 border-t border-gray-100/50">
                    <h2 className="text-4xl md:text-[84px] font-display font-normal text-gray-900 leading-[1] tracking-tightest">
                        Got questions? <br className="md:hidden" /> We've got <span className="font-display italic text-[var(--brand-accent)]">clarity</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    <div className="divide-y divide-gray-100">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="group overflow-hidden">
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className={`w-full py-8 flex items-center gap-6 text-left transition-all duration-500 ${openIndex === idx ? 'pb-4' : ''}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <span className={`font-display text-lg md:text-2xl transition-colors duration-500 leading-none ${openIndex === idx ? 'text-[var(--brand-accent)]' : 'text-gray-900 group-hover:text-gray-600'}`}>
                                            {faq.question}
                                        </span>
                                    </div>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border ${openIndex === idx
                                        ? 'bg-[var(--brand-accent)] border-transparent rotate-180 shadow-soft'
                                        : 'bg-white border-gray-100 group-hover:border-gray-200 group-hover:scale-110'
                                        }`}>
                                        <svg
                                            className={`w-4 h-4 transition-colors duration-500 ${openIndex === idx ? 'text-white' : 'text-gray-400'}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-64 opacity-100 pb-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                    <p className="text-gray-400 leading-relaxed font-sans text-lg pr-16">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-[14px] bg-[var(--brand-accent)] p-8 text-center shadow-soft hover:shadow-card transition-all duration-500 cursor-default group">
                                <p className="text-5xl md:text-6xl font-display font-normal text-white mb-3 leading-none group-hover:rotate-3 transition-transform duration-500">75%</p>
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">Faster Decisions</p>
                            </div>
                            <div className="rounded-[14px] bg-gray-900 p-8 text-center shadow-soft hover:shadow-card transition-all duration-500 cursor-default group">
                                <p className="text-5xl md:text-6xl font-display font-normal text-white mb-3 leading-none group-hover:-rotate-3 transition-transform duration-500">50%</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Cost Reduction</p>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-soft group hover:shadow-card transition-all duration-700">
                            <div className="w-full aspect-[16/10] bg-gray-50 relative">
                                <img src="/feature_ai.png" loading="lazy" alt="AI Analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-105 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQWithStatsSection;
