import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ServicesSection = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['Validated', 'Analysis', 'Roadmaps', 'Chat'];

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-index');
                    if (id !== null) setActiveTab(parseInt(id));
                }
            });
        }, { threshold: 0.1, rootMargin: "-30% 0px -50% 0px" });

        const elements = document.querySelectorAll('.service-step-container');
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const scrollToStep = (idx) => {
        const el = document.getElementById(`service-step-${idx}`);
        if (el) {
            const offset = 180;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="w-full bg-white pt-24 pb-48 md:pt-32 md:pb-64 border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 sm:mb-24 items-start pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                            Design a startup journey <span className="font-display italic text-[var(--brand-accent)]">that actually works.</span>
                        </h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <p className="text-gray-700 text-base sm:text-lg md:text-xl font-sans leading-relaxed max-w-xl mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                            Capable isn't just a research tool; it makes your venture journey way better. Use out-of-the-box logic for all business types and industries—or create, update and manage custom growth requirements with ease.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    <div className="hidden lg:block lg:col-span-4 relative">
                        <div className="sticky top-40 h-fit space-y-16">
                            <nav className="flex flex-col gap-6">
                                {tabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToStep(idx)}
                                        className="text-left group flex items-center gap-6"
                                    >
                                        <div className={`h-[2px] transition-all duration-700 ease-out ${activeTab === idx ? 'bg-[var(--brand-accent)] w-16' : 'bg-gray-200 group-hover:bg-gray-300 w-8'}`}></div>
                                        <span className={`text-2xl font-display transition-all duration-500 ${activeTab === idx ? 'text-gray-900 translate-x-2' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                            {tab}
                                        </span>
                                    </button>
                                ))}
                            </nav>

                            <div className="pt-16 border-t border-gray-100 space-y-12">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Global Impact</p>
                                    <p className="text-gray-900 font-sans text-sm italic pr-12 leading-relaxed">"120+ Ideas Analyzed through custom frameworks and standard business models."</p>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {[
                                        { number: '98+', label: 'STRATEGIES BUILT', desc: 'Custom growth paths' },
                                        { number: '2M+', label: 'SIGNALS HANDLED', desc: 'Real-time market data' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-end justify-between group cursor-default">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-1 uppercase">{stat.label}</p>
                                                <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors uppercase tracking-widest">{stat.desc}</p>
                                            </div>
                                            <p className="text-4xl md:text-5xl font-display text-gray-900 group-hover:text-[var(--brand-accent)] transition-all duration-500">{stat.number}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 relative">
                        <div className="lg:hidden sticky top-[84px] z-30 bg-white/90 backdrop-blur-xl py-4 -mx-6 px-6 border-b border-gray-100 mb-12 shadow-sm">
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-hide border border-gray-100/50">
                                {tabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToStep(idx)}
                                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${activeTab === idx ? 'bg-white text-gray-900 shadow-md scale-[1.02]' : 'text-gray-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-32 md:space-y-48">
                            <div id="service-step-0" data-index="0" className="service-step-container space-y-8">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img
                                            src="/mobile/feature_lightning.webp"
                                            srcSet="/mobile/feature_lightning.webp 640w, /feature_lightning.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover scale-110 translate-y-[2%] transition-transform duration-1000 group-hover:scale-[1.15]"
                                            alt="Validated"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Validate ideas with <span className="font-display italic">real signals</span>
                                    </h3>
                                    <div className="space-y-6">
                                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                                            Skip the guesswork. Capable helps you rapidly test assumptions and validate your core venture hypotheses using concrete market data before you build.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div id="service-step-1" data-index="1" className="service-step-container space-y-10">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img
                                            src="/mobile/feature_market.webp"
                                            srcSet="/mobile/feature_market.webp 640w, /feature_market.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover scale-110 translate-y-[5%] transition-transform duration-1000 group-hover:scale-[1.15]"
                                            alt="Analysis"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Deep analysis for <span className="font-display italic">any sector</span>
                                    </h3>
                                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                                        Get comprehensive breakdowns of your competitive landscape, target audience, and market viability, powered by vast reserves of industry intelligence.
                                    </p>
                                </div>
                            </div>

                            <div id="service-step-2" data-index="2" className="service-step-container space-y-10">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img
                                            src="/mobile/feature_roadmaps.webp"
                                            srcSet="/mobile/feature_roadmaps.webp 640w, /feature_roadmaps.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover scale-110 translate-y-[3%] transition-transform duration-1000 group-hover:scale-[1.15]"
                                            alt="Roadmaps"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Manage custom growth requirements
                                    </h3>
                                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                                        Easily create, update, and manage your own custom strategy requirements with ease. Our roadmaps adapt as your market signals evolve.
                                    </p>
                                </div>
                            </div>

                            <div id="service-step-3" data-index="3" className="service-step-container space-y-10">
                                <div className="relative group">
                                    <div className="rounded-[24px] overflow-hidden aspect-[16/10] sm:aspect-[21/11] bg-gray-50 border border-gray-100/50 shadow-2xl relative">
                                        <img
                                            src="/mobile/feature_ai.webp"
                                            srcSet="/mobile/feature_ai.webp 640w, /feature_ai.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover scale-110 translate-y-[3%] transition-transform duration-1000 group-hover:scale-[1.15]"
                                            alt="Chat"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-all duration-1000 group-hover:opacity-0 group-hover:scale-[1.15] pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="max-w-3xl">
                                    <h3 className="text-3xl md:text-5xl font-display text-gray-900 mb-8 leading-tight tracking-tightest">
                                        Interactive support, <span className="font-display italic">every step</span>
                                    </h3>
                                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                                        Capable isn't just a research tool; it makes your venture journey way better with real-time feedback and intelligent chat guidance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
