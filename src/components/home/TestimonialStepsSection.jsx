import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
};

const TestimonialStepsSection = () => (
    <section className="w-full bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">

            {/* Section header */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-10 sm:mb-16 items-start pt-12 border-t border-gray-300/50"
            >
                <motion.div variants={fadeUp}>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                        Launch your venture in <span className="font-display italic text-[var(--brand-accent)]">three steps</span>
                    </h2>
                </motion.div>
                <motion.div variants={fadeUp} className="flex flex-col">
                    <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-lg mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                        Our intelligent engine handles the heavy lifting. Go from a raw concept to a fully validated business roadmap instantly.
                    </p>
                </motion.div>
            </motion.div>

            {/* 3 STEPS BENTO GRID */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
            >
                {[
                    { step: '01', title: 'Enter Your Idea', desc: 'Describe exactly what you envision. Our engine will ingest your concept and begin the analysis process immediately.' },
                    { step: '02', title: 'Analyze the Market', desc: 'Our system processes live data, identifies competitors, and uncovers unique structural growth opportunities.' },
                    { step: '03', title: 'Get Your Roadmap', desc: 'Receive a comprehensive, actionable execution plan tailored exactly to your specific business inputs.' }
                ].map((item, idx) => (
                    <motion.div key={idx} variants={fadeUp} className="rounded-2xl bg-white border border-gray-300 p-8 sm:p-10 flex flex-col">
                        <div className="w-[32px] h-[32px] shrink-0 mb-6 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center font-bold text-[14px]">
                            {item.step}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-display text-gray-900 mb-4 tracking-tight">{item.title}</h3>
                        <p className="text-gray-500 text-[15px] sm:text-[16px] leading-relaxed mt-auto">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* TESTIMONIAL BLOCK */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                className="rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#073B99] p-8 sm:p-10 flex flex-col lg:flex-row gap-10 items-center justify-between"
            >
                <div className="w-full lg:w-7/12">
                    <p className="text-xl sm:text-2xl font-display text-white leading-[1.5] tracking-tight">
                        "Capable goes beyond surface-level keywords. It captured the nuance of my vision and translated it into a tactical roadmap that we're executing on today."
                    </p>
                </div>
                <div className="w-full lg:w-4/12 flex flex-col items-start lg:items-end border-t lg:border-t-0 lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-10">
                    <span className="text-white font-bold text-[16px]">ALEX M.</span>
                    <span className="text-white/80 font-sans text-[13px] font-bold tracking-widest uppercase mt-1">Founder, TechCorp</span>
                </div>
            </motion.div>

        </div>
    </section>
);

export default TestimonialStepsSection;
