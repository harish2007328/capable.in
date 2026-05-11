import React from 'react';
import { motion } from 'framer-motion';
import { Check, Globe2, Sparkles, Target, LineChart, PieChart } from 'lucide-react';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const AdjustableRulesSection = () => (
    <section className="w-full bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-300/50"
            >
                <motion.div variants={fadeUp}>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                        Adjustable steps to fit <span className="font-display italic text-[var(--brand-accent)]">your goal</span>
                    </h2>
                </motion.div>
                <motion.div variants={fadeUp} className="flex flex-col">
                    <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-lg mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                        Customize precisely how your venture evolves. Set milestones, tasks, and objectives that match your specific industry standards.
                    </p>
                </motion.div>
            </motion.div>

            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {/* Card 1 */}
                <motion.div 
                    variants={fadeUp}
                    className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col"
                >
                    <h3 className="text-2xl sm:text-3xl font-display text-gray-900 mb-4 tracking-tight">Precise Logic</h3>
                    <p className="text-gray-500 text-[15px] sm:text-[16px] leading-relaxed mb-10">
                        Design paths that work for you, not the other way around. Customize how your venture evolves with fine-tuned control.
                    </p>
                    <ul className="space-y-5 mt-auto">
                        {[
                            'Define custom business variables',
                            'Advanced workflow branching',
                            'Industry-specific frameworks',
                            'Real-time logic validation'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="w-[22px] h-[22px] shrink-0 mt-0.5 rounded-full bg-[var(--brand-accent)] flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                </div>
                                <span className="text-[15px] text-gray-700 font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Card 2 */}
                <motion.div 
                    variants={fadeUp}
                    className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col"
                >
                    <h3 className="text-2xl sm:text-3xl font-display text-gray-900 mb-4 tracking-tight">Insightful Coaching</h3>
                    <p className="text-gray-500 text-[15px] sm:text-[16px] leading-relaxed mb-10">
                        Simplify the complex work and focus on the results. Get tailored strategic guidance at every critical milestone.
                    </p>
                    <ul className="space-y-5 mt-auto">
                        {[
                            'Automated strategic guidance',
                            'Step-by-step milestone tracking',
                            'Continuous growth optimizations',
                            'Direct access to AI models'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="w-[22px] h-[22px] shrink-0 mt-0.5 rounded-full bg-[var(--brand-accent)] flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                </div>
                                <span className="text-[15px] text-gray-700 font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Card 3 (Full Width) */}
                <motion.div 
                    variants={fadeUp}
                    className="md:col-span-2 rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col lg:flex-row gap-10 items-center justify-between"
                >
                    <div className="w-full lg:w-5/12">
                        <h3 className="text-2xl sm:text-3xl font-display text-gray-900 mb-4 tracking-tight">Real-time market intelligence</h3>
                        <p className="text-gray-500 text-[15px] sm:text-[16px] leading-relaxed">
                            Every analysis is powered by live data and advanced reasoning models. We synthesize current market trends, competitor movements, and actionable frameworks specifically for your industry.
                        </p>
                    </div>
                    <div className="w-full lg:w-7/12 flex flex-wrap gap-3 sm:gap-4 justify-start lg:justify-end">
                        {[
                            { label: 'Live Web Searching', icon: Globe2 },
                            { label: 'Deep Market Synthesis', icon: Sparkles },
                            { label: 'Competitor Tracking', icon: Target },
                            { label: 'Trend Analysis', icon: LineChart },
                            { label: 'Financial Modeling', icon: PieChart }
                        ].map((pill, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-50/70 border border-blue-100 rounded-xl hover:bg-blue-100/70 transition-colors cursor-default">
                                <pill.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--brand-accent)]" />
                                <span className="text-[13px] sm:text-[14px] font-bold text-blue-900">{pill.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    </section>
);

export default AdjustableRulesSection;
