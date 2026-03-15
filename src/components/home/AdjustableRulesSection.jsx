import React from 'react';
import { motion } from 'framer-motion';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
};

const AdjustableRulesSection = () => (
    <section className="w-full bg-[#FAFBFF] py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-100/50"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="rounded-[32px] bg-gradient-to-br from-[#0066CC] to-[#073B99] overflow-hidden shadow-2xl transition-all duration-500 flex flex-col relative"
                >
                    <div className="px-8 sm:px-10 pt-10 pb-8 relative z-10">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white uppercase tracking-widest mb-6">
                            Customisable
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display text-white mb-4 tracking-tight">Precise Logic</h3>
                        <p className="text-white/80 text-[16px] leading-relaxed max-w-sm mb-4">
                            Design paths that work for you, not the other way around.
                        </p>
                    </div>
                    <div className="w-full aspect-[16/10] pl-10 pt-10 pr-0 pb-0 mt-auto relative z-10">
                        <div className="w-full h-full rounded-tl-[32px] overflow-hidden bg-white/5 backdrop-blur-md relative transition-colors duration-500">
                            <img
                                src="/mobile/market_analysis_vector.webp"
                                className="w-full h-full object-cover"
                                alt="Market Analysis"
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="rounded-[32px] bg-gradient-to-br from-[#0066CC] to-[#073B99] overflow-hidden shadow-2xl transition-all duration-500 flex flex-col relative"
                >
                    <div className="px-8 sm:px-10 pt-10 pb-8 relative z-10">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white uppercase tracking-widest mb-6">
                            Workflows
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display text-white mb-4 tracking-tight">Insightful Coaching</h3>
                        <p className="text-white/80 text-[16px] leading-relaxed max-w-sm mb-4">
                            Simplify the complex work and focus on the results.
                        </p>
                    </div>
                    <div className="w-full aspect-[16/10] pl-10 pt-10 pr-0 pb-0 mt-auto relative z-10">
                        <div className="w-full h-full rounded-tl-[32px] overflow-hidden bg-white/5 backdrop-blur-md relative transition-colors duration-500">
                            <img
                                src="/mobile/action_roadmap_vector.webp"
                                className="w-full h-full object-cover"
                                alt="Action Roadmap"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

export default AdjustableRulesSection;
