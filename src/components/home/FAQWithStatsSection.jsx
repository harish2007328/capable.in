import React, { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
};

const FAQWithStatsSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "What data sources does Capable actually use?",
            answer: "We scrape search engine results for market validation and pull community discussions for social signals. Our AI model then analyzes everything to generate your strategic report."
        },
        {
            question: "Where is my data stored?",
            answer: "Your data is secured with enterprise-grade encryption. There's no backend database or external servers. Your project data, reports, and action plans are kept entirely private."
        },
        {
            question: "How does the adaptive wizard work?",
            answer: "After scraping signals, our AI generates 5-7 questions tailored to your specific idea. It detects if you're local or global, and adapts dynamically based on your business model."
        },
        {
            question: "Can the AI mentor help during execution?",
            answer: "Yes. The mentor chat knows your original idea, your full action plan, and your progress. It provides context-aware, highly specific guidance instead of generic advice."
        }
    ];

    return (
        <section className="w-full bg-white py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-6">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start pt-12 border-t border-gray-300/50 mb-10 sm:mb-16"
                >
                    {/* LEFT COLUMN: Sticky Header & Stats */}
                    <motion.div variants={fadeUp} className="w-full lg:w-5/12 lg:sticky lg:top-32">
                        <h2 className="text-4xl md:text-5xl lg:text-[64px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-6">
                            Got questions? <br/> We've got <span className="font-display italic text-[var(--brand-accent)]">clarity</span>
                        </h2>
                        <p className="text-gray-600 text-lg font-sans leading-relaxed mb-12">
                            Everything you need to know about how Capable handles your data, validates ideas, and generates roadmaps.
                        </p>

                        <div className="flex gap-4">
                            <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#073B99] p-6 sm:p-8 flex flex-col justify-center items-start">
                                <p className="text-4xl sm:text-5xl font-display font-normal text-white mb-2 tracking-tight">75%</p>
                                <p className="text-[11px] font-bold text-white uppercase tracking-widest opacity-90">Faster Decisions</p>
                            </div>
                            <div className="flex-1 rounded-2xl bg-white border border-gray-300 p-6 sm:p-8 flex flex-col justify-center items-start">
                                <p className="text-4xl sm:text-5xl font-display font-normal text-gray-900 mb-2 tracking-tight">50%</p>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Cost Reduction</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Accordion */}
                    <motion.div variants={fadeUp} className="w-full lg:w-7/12 flex flex-col pt-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border-b border-gray-300 group">
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full py-8 flex items-center justify-between text-left focus:outline-none"
                                >
                                    <span className={`font-display text-xl sm:text-2xl tracking-tight transition-colors duration-300 pr-8 ${openIndex === idx ? 'text-[var(--brand-accent)]' : 'text-gray-900 group-hover:text-[var(--brand-accent)]'}`}>
                                        {faq.question}
                                    </span>
                                    <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${openIndex === idx ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-[var(--brand-accent)]'}`}>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-300 ${openIndex === idx ? 'rotate-45' : 'rotate-0'}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-64 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
                                >
                                    <p className="text-gray-500 text-base sm:text-lg leading-relaxed font-sans pr-8 sm:pr-16">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
};

export default FAQWithStatsSection;
