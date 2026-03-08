import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BottomCTASection = () => (
    <section className="w-full bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[24px] bg-[#FAFBFF] border border-gray-100 p-8 md:p-16 lg:p-24 relative overflow-hidden group shadow-soft"
            >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--brand-accent)]/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-[var(--brand-accent)]/10"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px] -ml-40 -mb-40"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="text-3xl md:text-6xl lg:text-7xl font-display font-normal text-gray-900 leading-tight mb-8 tracking-tightest">
                            Ready to accelerate <br className="hidden md:block" /> your <span className="font-display italic text-[var(--brand-accent)]">business success?</span>
                        </h2>
                        <p className="text-gray-700 font-sans leading-relaxed text-lg max-w-lg mb-12">
                            Join thousands of entrepreneurs who've transformed their ideas into actionable plans with Capable.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/login" className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-8 py-4 rounded-md font-bold text-[15px] tracking-tight hover:shadow-float active:scale-[0.98] transition-all duration-300 text-center">
                                Start Building — It's Free
                            </Link>
                            <Link to="/features" className="bg-white text-gray-900 px-8 py-4 rounded-md font-bold text-[15px] tracking-tight border border-gray-200 hover:bg-gray-50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 text-center">
                                Learn more →
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-[24px] border border-gray-100 bg-white shadow-soft overflow-hidden group-hover:shadow-card transition-all duration-700"
                    >
                        <div className="w-full aspect-[4/3] relative">
                            <img src="/bauhaus_last_gen.webp" loading="lazy" alt="Strategy Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/25 backdrop-blur-md p-1 rounded-[14px] shadow-xl border border-white/30">
                                    <div className="bg-white rounded-[10px] py-3 px-6 text-center">
                                        <span className="text-[11px] font-bold text-gray-900 tracking-widest uppercase">Premium Strategy Preview</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 sm:p-8 bg-gray-900 text-white flex items-center justify-between group-hover:bg-black transition-colors duration-700">
                            <div>
                                <p className="text-xs sm:text-sm font-bold mb-1 tracking-tight">Access Premium Packages</p>
                                <p className="text-[9px] sm:text-[11px] text-white/70 uppercase tracking-widest font-bold">Scaling made simple</p>
                            </div>
                            <Link to="/pricing" className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] text-[10px] sm:text-xs font-bold hover:shadow-soft transition-all active:scale-95 text-center">
                                View Plans
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    </section>
);

export default BottomCTASection;
