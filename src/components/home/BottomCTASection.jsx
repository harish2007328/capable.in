import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const BottomCTASection = () => (
    <section className="w-full bg-white py-16 md:py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0057C2] via-[#0066CC] to-[#073B99] p-10 sm:p-16 lg:p-20"
            >
                {/* Background texture */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-[#073B99]/60 blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">

                    {/* Left: Headline */}
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                            <Sparkles className="w-3 h-3 text-blue-200" strokeWidth={2} />
                            <span className="text-blue-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">AI-Powered</span>
                        </div>

                        <h2 className="font-display font-normal text-white leading-[1.05] tracking-tightest mb-5 text-4xl sm:text-5xl lg:text-[60px]">
                            Ready to accelerate your{' '}
                            <span className="font-instrument-serif italic text-blue-200 block sm:inline">business success?</span>
                        </h2>
                        <p className="text-blue-100/60 font-sans leading-relaxed text-base max-w-lg">
                            Join thousands of entrepreneurs who've transformed their ideas into actionable plans with Capable.
                        </p>
                    </div>

                    {/* Right: Buttons + social proof */}
                    <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
                        <Link
                            to="/"
                            onClick={(e) => {
                                if (window.location.pathname === '/') {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className="inline-flex items-center justify-center gap-2 bg-white text-[var(--brand-accent)] px-8 py-4 rounded-xl font-bold text-[14px] tracking-tight hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 whitespace-nowrap shadow-lg shadow-black/10"
                        >
                            Start Building — It's Free
                            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-[14px] tracking-tight hover:bg-white/20 active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
                        >
                            View Plans
                        </Link>
                        <p className="text-blue-200/40 text-[11px] font-sans text-center mt-1">No credit card required</p>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

export default BottomCTASection;
