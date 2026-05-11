import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
        <section className="w-full bg-white py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-16 sm:mb-24 items-start pt-12 border-t border-gray-300/50">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
                            Design a startup journey <span className="font-display italic text-[var(--brand-accent)]">that actually works.</span>
                        </h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col"
                    >
                        <p className="text-gray-700 text-base sm:text-lg md:text-xl font-sans leading-relaxed max-w-xl mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                            Capable isn't just a research tool; it makes your venture journey way better. Use out-of-the-box logic for all business types and industries—or create, update and manage custom growth requirements with ease.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    <div className="hidden lg:block lg:col-span-4 relative">
                        <div className="sticky top-48 xl:top-[30vh] h-fit pt-4">
                            <nav className="flex flex-col gap-8">
                                {tabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToStep(idx)}
                                        className="text-left group flex items-center gap-6"
                                    >
                                        <span className={`text-sm font-bold tracking-widest transition-all duration-500 ${activeTab === idx ? 'text-[var(--brand-accent)]' : 'text-gray-300'}`}>
                                            0{idx + 1}
                                        </span>
                                        <span className={`text-3xl lg:text-5xl font-display transition-all duration-500 ${activeTab === idx ? 'text-gray-900 translate-x-4' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                            {tab}
                                        </span>
                                    </button>
                                ))}
                            </nav>


                        </div>
                    </div>

                    <div className="lg:col-span-8 relative">
                        <div className="lg:hidden sticky top-[84px] z-30 bg-white/90 backdrop-blur-xl py-4 -mx-6 px-6 border-b border-gray-300 mb-12 shadow-sm">
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-hide border border-gray-300/50">
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

                        <div className="flex flex-col gap-16 md:gap-20">
                            <div id="service-step-0" data-index="0" className="service-step-container flex flex-col md:flex-row gap-10 md:gap-16 items-center pb-16 md:pb-20 border-b border-gray-300/50">
                                <div className="w-full md:w-5/12 relative group">
                                    <div className="overflow-hidden bg-gray-50 border border-gray-300/50 relative rounded-2xl aspect-square">
                                        <img
                                            src="/mobile/feature_lightning.webp"
                                            srcSet="/mobile/feature_lightning.webp 640w, /feature_lightning.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            alt="Validated"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="w-full md:w-7/12 flex flex-col justify-center lg:pl-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-gray-900 tracking-widest uppercase">Step 01</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-gray-900 mb-6 leading-tight tracking-tightest">
                                        Validate ideas with <span className="font-display italic text-[var(--brand-accent)]">real signals.</span>
                                    </h3>
                                    <div>
                                        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                            Skip the guesswork. Capable helps you rapidly test assumptions and validate your core venture hypotheses using concrete market data before you build.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div id="service-step-1" data-index="1" className="service-step-container flex flex-col md:flex-row gap-10 md:gap-16 items-center pb-16 md:pb-20 border-b border-gray-300/50">
                                <div className="w-full md:w-5/12 relative group">
                                    <div className="overflow-hidden bg-gray-50 border border-gray-300/50 relative rounded-2xl aspect-square">
                                        <img
                                            src="/mobile/feature_market.webp"
                                            srcSet="/mobile/feature_market.webp 640w, /feature_market.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            alt="Analysis"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="w-full md:w-7/12 flex flex-col justify-center lg:pl-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-gray-900 tracking-widest uppercase">Step 02</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-gray-900 mb-6 leading-tight tracking-tightest">
                                        Deep analysis for <span className="font-display italic text-[var(--brand-accent)]">any sector.</span>
                                    </h3>
                                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                        Get comprehensive breakdowns of your competitive landscape, target audience, and market viability, powered by vast reserves of industry intelligence.
                                    </p>
                                </div>
                            </div>

                            <div id="service-step-2" data-index="2" className="service-step-container flex flex-col md:flex-row gap-10 md:gap-16 items-center pb-16 md:pb-20 border-b border-gray-300/50">
                                <div className="w-full md:w-5/12 relative group">
                                    <div className="overflow-hidden bg-gray-50 border border-gray-300/50 relative rounded-2xl aspect-square">
                                        <img
                                            src="/mobile/feature_roadmaps.webp"
                                            srcSet="/mobile/feature_roadmaps.webp 640w, /feature_roadmaps.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            alt="Roadmaps"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="w-full md:w-7/12 flex flex-col justify-center lg:pl-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-gray-900 tracking-widest uppercase">Step 03</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-gray-900 mb-6 leading-tight tracking-tightest">
                                        Manage custom <span className="font-display italic text-[var(--brand-accent)]">growth requirements.</span>
                                    </h3>
                                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                        Easily create, update, and manage your own custom strategy requirements with ease. Our roadmaps adapt as your market signals evolve.
                                    </p>
                                </div>
                            </div>

                            <div id="service-step-3" data-index="3" className="service-step-container flex flex-col md:flex-row gap-10 md:gap-16 items-center pb-16 md:pb-20 border-b border-gray-300/50">
                                <div className="w-full md:w-5/12 relative group">
                                    <div className="overflow-hidden bg-gray-50 border border-gray-300/50 relative rounded-2xl aspect-square">
                                        <img
                                            src="/mobile/feature_ai.webp"
                                            srcSet="/mobile/feature_ai.webp 640w, /feature_ai.webp 1200w"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            alt="Chat"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="w-full md:w-7/12 flex flex-col justify-center lg:pl-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-gray-900 tracking-widest uppercase">Step 04</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-gray-900 mb-6 leading-tight tracking-tightest">
                                        Interactive support, <span className="font-display italic text-[var(--brand-accent)]">every step.</span>
                                    </h3>
                                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
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
