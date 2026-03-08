import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap,
    BarChart3,
    Route,
    MessageSquare,
    ShieldCheck,
    Globe
} from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description, delay, borderClasses }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className={`flex flex-col items-start p-10 md:p-14 hover:bg-slate-50/50 transition-colors duration-500 group ${borderClasses}`}
    >
        <div className="relative mb-8">
            {/* Soft Ambient Glow (Naked Icon) */}
            <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <Icon className="w-8 h-8 text-[var(--brand-accent)] relative z-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-display font-normal text-gray-900 leading-tight">
                {title}
            </h3>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-sm font-sans opacity-80">
                {description}
            </p>
        </div>
    </motion.div>
);

const FeaturesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: Zap,
            title: "Market Validation",
            description: "Test assumptions and validate core hypotheses using concrete market signals before you build.",
            borderClasses: "border-b border-r border-gray-100"
        },
        {
            icon: BarChart3,
            title: "Strategic Analysis",
            description: "Deep-dive into competitive landscapes and audience viability with industry-leading intelligence.",
            borderClasses: "border-b md:border-r border-gray-100"
        },
        {
            icon: Route,
            title: "Adaptive Roadmaps",
            description: "Personalized 60-day execution plans that adapt in real-time as your market signals evolve.",
            borderClasses: "border-b border-gray-100"
        },
        {
            icon: MessageSquare,
            title: "Intelligent Coaching",
            description: "Interactive support providing real-time feedback and strategic guidance across every step.",
            borderClasses: "border-r border-gray-100 border-t md:border-t-0"
        },
        {
            icon: ShieldCheck,
            title: "Local Privacy",
            description: "Your sensitive business logic stays with you. We use browser-based storage for maximum security.",
            borderClasses: "md:border-r border-gray-100 border-t md:border-t-0"
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Analyze market opportunities across 150+ countries with automated local nuance detection.",
            borderClasses: "border-t md:border-t-0 border-gray-100"
        }
    ];

    return (
        <div className="relative w-full bg-white min-h-screen font-sans">
            {/* Soft Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-radial from-blue-50/30 to-transparent pointer-events-none -z-10"></div>

            {/* --- HEADER SECTION --- */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Platform Capabilities</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-display font-normal text-gray-900 leading-[0.95] tracking-tightest mb-8">
                            Everything you need to <br />
                            <span className="font-display italic text-blue-500">build with confidence.</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-600 max-w-2xl font-sans font-medium leading-relaxed opacity-70">
                            We've combined deep market research, strategic planning, and AI guidance into a single, cohesive workflow for founders.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- CORE FEATURES GRID (Border Separated) --- */}
            <section className="px-6 md:px-0 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, idx) => (
                            <FeatureItem
                                key={idx}
                                {...feature}
                                delay={idx * 0.05}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MODERN INFRASTRUCTURE --- */}
            <section className="py-24 md:py-48 px-6 bg-[#FAFBFF] border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-10"
                        >
                            <h2 className="text-4xl md:text-6xl font-display font-normal text-gray-900 leading-[1.05] tracking-tightest">
                                Built for the <br />
                                <span className="font-display italic text-blue-500">privacy-first founder.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 font-sans leading-relaxed opacity-70 max-w-xl">
                                Capable isn't just about speed; it's about control. We've architected everything to ensure your sensitive venture data remains yours.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                {[
                                    { title: "Zero Data Persistence", desc: "No central database storage for your trade secrets." },
                                    { title: "Browser-Level Encryption", desc: "Sensitive signals are encrypted at the edge." },
                                    { title: "Instant Export", desc: "Download your roadmap as a clean structured PDF or CSV." },
                                    { title: "Signal Integrity", desc: "Verified 3rd-party data sources with high-trust ratings." }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-sm text-gray-700 font-sans font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="rounded-[32px] overflow-hidden aspect-[4/3] bg-white border border-gray-100 shadow-2xl relative group">
                                <img
                                    src="/mobile/2.webp"
                                    srcSet="/mobile/2.webp 640w, /2.webp 1200w"
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                    loading="lazy"
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                    alt="Secure Infrastructure"
                                />
                                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition-colors duration-1000"></div>
                            </div>
                            {/* Decorative floating badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 tracking-tight">Enterprise-Grade <br />Security Standards</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- THE 60-DAY ROADMAP --- */}
            <section className="py-24 md:py-40 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto mb-20 space-y-6"
                    >
                        <h2 className="text-4xl md:text-7xl font-display font-normal text-gray-900 leading-tight tracking-tightest">
                            From concept to <br />
                            <span className="font-display italic text-blue-500">market-ready in 60 days.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 font-sans leading-relaxed opacity-70">
                            Our roadmaps aren't just lists; they are comprehensive strategic plans that guide you through every critical milestone.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {[
                            { step: "01", title: "Market Alignment", desc: "Sync your vision with real-world demand and competitor gaps identified by our engine." },
                            { step: "02", title: "Strategic Build", desc: "Follow a prioritized backlog of features and technical requirements tailored to your stack." },
                            { step: "03", title: "Global Launch", desc: "Execute a pre-vetted marketing and distribution plan across target regions automatically." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-6 p-8 rounded-3xl border border-gray-50 hover:border-blue-100 transition-colors bg-slate-50/30"
                            >
                                <span className="text-4xl font-display italic text-blue-500/30">{item.step}</span>
                                <h4 className="text-2xl font-bold text-gray-900">{item.title}</h4>
                                <p className="text-gray-600 font-sans leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA SECTION (Homepage Style) --- */}
            <section className="py-24 md:py-40 px-6">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="rounded-[32px] bg-[#FAFBFF] border border-gray-100 p-8 md:p-16 lg:p-24 relative overflow-hidden group shadow-soft">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-blue-500/10"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px] -ml-40 -mb-40"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-normal text-gray-900 leading-[1.1] mb-8 tracking-tightest">
                                    Ready to <span className="font-display italic text-blue-500">start building</span> <br className="hidden md:block" /> with confidence?
                                </h2>
                                <p className="text-gray-600 font-sans leading-relaxed text-lg md:text-xl max-w-lg mb-12 opacity-80 font-medium">
                                    Join founders who've turned uncertainty into actionable market strategies in under 60 days.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <Link to="/login" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-5 rounded-xl font-bold text-[16px] tracking-tight hover:shadow-xl active:scale-[0.98] transition-all duration-300 text-center shadow-lg shadow-blue-500/10">
                                        Analyze My Idea
                                    </Link>
                                    <Link to="/pricing" className="bg-white text-gray-900 px-10 py-5 rounded-xl font-bold text-[16px] tracking-tight border border-gray-200 hover:bg-gray-50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 text-center">
                                        Review Plans
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="rounded-[28px] border border-gray-100 bg-white shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-700"
                            >
                                <div className="w-full aspect-[4/3] relative">
                                    <img
                                        src="/mobile/hero-poster.webp"
                                        srcSet="/mobile/hero-poster.webp 640w, /hero-poster.webp 1200w"
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                        loading="lazy"
                                        alt="Platform Preview"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-blue-900/10 transition-colors group-hover:bg-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-[18px] shadow-2xl border border-white/30">
                                            <div className="bg-white rounded-[12px] py-4 px-8 text-center">
                                                <span className="text-[12px] font-bold text-gray-900 tracking-widest uppercase">Intelligent Idea Architect</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-gray-900 text-white flex items-center justify-between group-hover:bg-black transition-colors duration-700">
                                    <div className="space-y-1">
                                        <p className="text-base font-bold tracking-tight">Access Pro Features</p>
                                        <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Priority Validation Engine</p>
                                    </div>
                                    <button className="bg-white text-gray-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-md">
                                        Get Started
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="w-full bg-white py-12 border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                        <div className="order-3 md:order-1">
                            <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                © 2025 Capable Labs. All rights reserved.
                            </p>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-8 order-1 md:order-2">
                            {[
                                { icon: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z', url: 'https://x.com/capable' },
                                { icon: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', url: 'https://linkedin.com/company/capable' },
                                { icon: 'GitHub', path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12', url: 'https://github.com/capable' }
                            ].map((item, i) => (
                                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${item.icon}`} className="text-gray-500 hover:text-gray-900 transition-all duration-300">
                                    <svg className="w-4 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d={item.path} /></svg>
                                </a>
                            ))}
                        </div>

                        {/* Made with Tagline */}
                        <div className="flex items-center gap-2 order-2 md:order-3">
                            <p className="text-[12px] text-gray-700 font-sans tracking-tight">
                                Build by <span className="font-bold text-gray-900 tracking-tight">Harish 💙</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
