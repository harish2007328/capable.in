import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const ServicesSection = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['Validated', 'Analysis', 'Roadmaps', 'Chat'];

    useEffect(() => {
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-index');
                    if (id !== null) setActiveTab(parseInt(id));
                }
            });
        }, { threshold: 0.1, rootMargin: "-30% 0px -50% 0px" });

        const elements = document.querySelectorAll('.service-step-container');
        elements.forEach(el => stepObserver.observe(el));
        return () => stepObserver.disconnect();
    }, []);

    const scrollToStep = (idx) => {
        const el = document.getElementById(`service-step-${idx}`);
        if (el) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const offsetPosition = elementRect - bodyRect - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    return (
        <section className="w-full bg-white py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mb-16 sm:mb-24 items-start pt-12 border-t border-gray-300/50">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] font-display font-normal text-gray-900 leading-[1.05] tracking-tightest mb-0">
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
                        <p className="text-gray-700 text-base sm:text-lg font-sans leading-relaxed max-w-xl mb-0 pt-2 border-l-2 border-blue-500/10 pl-6 sm:pl-8">
                            Capable isn't just a research tool; it makes your venture journey way better. Use out-of-the-box logic for all business types and industries—or create, update and manage custom growth requirements with ease.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-24">

                    {/* Desktop: sticky side nav */}
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

                    {/* Content column */}
                    <div className="lg:col-span-8 relative">

                        <div className="flex flex-col gap-16 md:gap-20">
                            {[
                                {
                                    id: 0,
                                    imgSrc: "/mobile/feature_lightning.webp",
                                    imgSrcSet: "/mobile/feature_lightning.webp 640w, /feature_lightning.webp 1200w",
                                    alt: "Validated",
                                    step: "Step 01",
                                    title: <>Validate ideas with <span className="font-display italic text-[var(--brand-accent)]">real signals.</span></>,
                                    desc: "Skip the guesswork. Capable helps you rapidly test assumptions and validate your core venture hypotheses using concrete market data before you build."
                                },
                                {
                                    id: 1,
                                    imgSrc: "/mobile/feature_market.webp",
                                    imgSrcSet: "/mobile/feature_market.webp 640w, /feature_market.webp 1200w",
                                    alt: "Analysis",
                                    step: "Step 02",
                                    title: <>Deep analysis for <span className="font-display italic text-[var(--brand-accent)]">any sector.</span></>,
                                    desc: "Get comprehensive breakdowns of your competitive landscape, target audience, and market viability, powered by vast reserves of industry intelligence."
                                },
                                {
                                    id: 2,
                                    imgSrc: "/mobile/feature_roadmaps.webp",
                                    imgSrcSet: "/mobile/feature_roadmaps.webp 640w, /feature_roadmaps.webp 1200w",
                                    alt: "Roadmaps",
                                    step: "Step 03",
                                    title: <>Manage custom <span className="font-display italic text-[var(--brand-accent)]">growth requirements.</span></>,
                                    desc: "Easily create, update, and manage your own custom strategy requirements with ease. Our roadmaps adapt as your market signals evolve."
                                },
                                {
                                    id: 3,
                                    imgSrc: "/mobile/feature_ai.webp",
                                    imgSrcSet: "/mobile/feature_ai.webp 640w, /feature_ai.webp 1200w",
                                    alt: "Chat",
                                    step: "Step 04",
                                    title: <>Interactive support, <span className="font-display italic text-[var(--brand-accent)]">every step.</span></>,
                                    desc: "Capable isn't just a research tool; it makes your venture journey way better with real-time feedback and intelligent chat guidance."
                                }
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    id={`service-step-${item.id}`}
                                    data-index={item.id}
                                    className="service-step-container flex flex-col sm:flex-row gap-8 sm:gap-10 md:gap-16 items-start sm:items-center pb-16 md:pb-20 border-b border-gray-300/50"
                                >
                                    <div className="w-full sm:w-5/12 relative group shrink-0">
                                        <div className="overflow-hidden bg-gray-50 border border-gray-300/50 relative rounded-2xl aspect-square">
                                            <img
                                                src={item.imgSrc}
                                                srcSet={item.imgSrcSet}
                                                sizes="(max-width: 640px) 90vw, 40vw"
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                alt={item.alt}
                                            />
                                            <div className="absolute inset-0 bg-blue-600/5 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"></div>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-7/12 flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white shadow-sm mb-5 w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-gray-900 tracking-widest uppercase">{item.step}</span>
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display text-gray-900 mb-4 leading-tight tracking-tightest">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
