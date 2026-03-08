import React from 'react';
import { motion } from 'framer-motion';

const TestimonialStepsSection = () => (
    <section className="w-full bg-[#f9f9f9] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-start pt-16 border-t border-gray-100/50">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="flex gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                    </div>

                    <p className="text-2xl md:text-3xl font-display text-gray-900 leading-[1.3] mb-12 max-w-lg">
                        "The platform's deep research and actionable steps are incredible. It aligns perfectly with our specific startup goals."
                    </p>

                    <div className="mb-16 pl-6 border-l-2 border-blue-500">
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-display font-medium text-lg leading-tight">HARISH S.</span>
                            <span className="text-gray-700 font-sans text-xs tracking-widest font-bold uppercase mt-1">CO-FOUNDER, INNOVATEX</span>
                        </div>
                    </div>
                    <p className="text-gray-700 text-lg md:text-xl font-display font-normal leading-relaxed italic pr-4 mb-16">
                        "Capable goes beyond surface-level keywords. It captured the nuance of my vision and translated it into a tactical roadmap that we're executing on today."
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="w-full max-w-md aspect-[16/9] rounded-[14px] overflow-hidden bg-gray-100 relative shadow-soft group"
                    >
                        <img
                            src="/bauhaus_last_gen.webp"
                            srcSet="/mobile/bauhaus_last_gen.webp 640w, /bauhaus_last_gen.webp 1200w"
                            sizes="(max-width: 640px) 100vw, 400px"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Market Signal Analysis"
                        />
                        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none group-hover:opacity-0 transition-opacity"></div>
                        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] bg-white/25 backdrop-blur-md p-0.5 sm:p-1 rounded-[14px] shadow-xl border border-white/30">
                            <div className="bg-white rounded-[10px] p-4 sm:p-6">
                                <p className="text-[11px] sm:text-[13px] font-bold text-gray-900 mb-1 leading-tight">Thorough market signal analysis</p>
                                <p className="text-[10px] sm:text-[11px] text-gray-700 font-sans leading-relaxed">Goes beyond surface keywords to analyze every aspect of the market landscape.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div>
                    <motion.h3
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-5xl lg:text-7xl font-display font-normal text-gray-900 leading-tight mb-16 tracking-tightest"
                    >
                        Launch your venture in just three easy steps!
                    </motion.h3>

                    <div className="space-y-12">
                        {[
                            { title: 'Enter Your Idea', desc: 'Describe exactly what you envision, and our engine will begin the analysis process immediately.' },
                            { title: 'Analyze the Market', desc: 'Tell us precisely what you need, and our system will generate the data right away.' },
                            { title: 'Get Your Roadmap', desc: 'Give us your specific inputs, and our platform will start crafting it right away.' }
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-150px" }}
                                transition={{ duration: 0.5, delay: 0.15 * idx, ease: "easeOut" }}
                                className="space-y-2 md:space-y-3"
                            >
                                <h4 className="text-xl md:text-2xl font-bold text-gray-900">{step.title}</h4>
                                <div className="md:col-span-8 flex flex-col justify-center">
                                    <p className="text-gray-700 text-base md:text-lg font-sans leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default TestimonialStepsSection;
