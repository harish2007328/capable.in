import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Brain, Target, Sparkles, TrendingUp, ChevronRight, Check } from 'lucide-react';
import Footer from '../components/Footer';

const FeaturesPage = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#073B99]/100 rounded-full blur-[220px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/100 rounded-full blur-[220px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#0066CC]/50 rounded-full blur-[180px] pointer-events-none"></div>

            {/* Hero Section */}
            <div className="relative z-30 flex flex-col items-center px-4 max-w-7xl mx-auto w-full pt-32 md:pt-40">
                <div className="feature-hero text-center max-w-5xl">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                        </span>
                        <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">Platform Features</span>
                    </div>

                    {/* Hero Headings */}
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-[#000000] tracking-tight leading-tight mb-6">
                        Everything You Need to
                        <br />
                        <span className="text-[#0066CC]">Launch Fast</span>
                    </h1>

                    <p className="text-base md:text-lg text-[#333333] max-w-2xl mx-auto font-sans font-medium leading-relaxed mb-12 px-6">
                        From market research to execution planning, Capable provides all the tools founders need to validate ideas and move fast with confidence.
                    </p>
                </div>

                {/* Featured Capabilities Grid */}
                <div className="w-full max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                    <FeatureCard
                        icon={<Brain className="w-8 h-8 text-white" />}
                        gradient="from-[#073B99] via-[#0066CC] to-[#0BAAFF]"
                        title="Adaptive AI Wizard"
                        description="Context-aware interview that adapts to your idea—no generic templates. Location detection and smart follow-ups included."
                        highlights={[
                            "5-7 dynamic questions",
                            "Detects local vs. global ideas",
                            "No duplicate questions"
                        ]}
                    />

                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-white" />}
                        gradient="from-[#0BAAFF] via-[#0066CC] to-[#073B99]"
                        title="Real-Time Market Signals"
                        description="Live web scraping of search results and social discussions. Get instant insights into market demand and competition."
                        highlights={[
                            "DuckDuckGo search analysis",
                            "Reddit social signals",
                            "Competitive landscape mapping"
                        ]}
                    />

                    <FeatureCard
                        icon={<Target className="w-8 h-8 text-white" />}
                        gradient="from-[#0066CC] to-[#0BAAFF]"
                        title="Strategic Scoring"
                        description="1-10 demand scoring with detailed feasibility analysis, differentiation tactics, and comprehensive risk assessment."
                        highlights={[
                            "Market demand rating",
                            "Feasibility breakdown",
                            "Risk identification"
                        ]}
                    />

                    <FeatureCard
                        icon={<Sparkles className="w-8 h-8 text-white" />}
                        gradient="from-[#073B99] to-[#0066CC]"
                        title="60-Day Action Plan"
                        description="Every single day has unique, specific tasks—not generic advice. Phased by objective with measurable deliverables."
                        highlights={[
                            "60 unique daily tasks",
                            "Strategic phase grouping",
                            "Location-aware recommendations"
                        ]}
                    />

                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-white" />}
                        gradient="from-[#0BAAFF] to-[#073B99]"
                        title="Privacy First"
                        description="Enterprise-grade encryption with no external servers. Your ideas, data, and plans stay completely private."
                        highlights={[
                            "End-to-end encryption",
                            "Local data storage",
                            "Zero data sharing"
                        ]}
                    />

                    <FeatureCard
                        icon={<TrendingUp className="w-8 h-8 text-white" />}
                        gradient="from-[#0066CC] via-[#0BAAFF] to-[#073B99]"
                        title="Contextual AI Mentor"
                        description="AI chat that understands your idea, plan, progress, and current task. Get execution guidance, not generic advice."
                        highlights={[
                            "Full context awareness",
                            "Task-specific guidance",
                            "Progress tracking"
                        ]}
                    />
                </div>

                {/* Deep Dive Features */}
                <DeepFeatureSection />

                {/* CTA Section */}
                <section className="w-full relative overflow-hidden mb-24">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                        <div className="relative bg-gradient-to-br from-[#073B99] via-[#0066CC] to-[#0BAAFF] rounded-2xl p-10 md:p-16 overflow-hidden">
                            <div className="absolute inset-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0BAAFF]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
                            </div>

                            <div className="relative z-10 text-center max-w-3xl mx-auto">
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight tracking-tight mb-6">
                                    Ready to Build?
                                </h2>

                                <p className="text-base md:text-lg text-white/80 font-sans font-medium leading-relaxed max-w-xl mx-auto mb-10">
                                    Join thousands of founders using Capable to validate ideas and launch faster than ever.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Link to="/dashboard" className="bg-white text-[#0066CC] px-8 py-3 rounded-md font-bold text-sm tracking-wide transition-all duration-300 hover:bg-white/80 active:scale-95 shadow-lg shadow-black/20 border border-white/20">
                                        Start Free Today
                                    </Link>
                                    <Link to="/pricing" className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide border border-white/20 transition-all duration-300 hover:bg-white/20 active:scale-95">
                                        View Pricing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

const FeatureCard = ({ icon, gradient, title, description, highlights }) => (
    <div className="feature-card group relative">
        {/* Animated Gradient Border */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#0066CC] via-[#0BAAFF] to-[#0066CC] opacity-50 pointer-events-none"></div>

        {/* Glow Effect */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#0066CC] to-[#0BAAFF] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30"></div>

        {/* Glass Card Content */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 m-[1px] h-full flex flex-col shadow-lg transition-all duration-500 group-hover:bg-white/90 group-hover:shadow-2xl">
            {/* Gradient Overlay - Subtle */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-60 pointer-events-none"></div>

            {/* Icon with enhanced glass effect */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl`}>
                <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10">{icon}</div>
            </div>

            {/* Content */}
            <h3 className="relative text-xl md:text-2xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
            <p className="relative text-sm text-gray-600 leading-relaxed mb-6 flex-grow">{description}</p>

            {/* Highlights with glass effect */}
            <ul className="relative space-y-2.5">
                {highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-700">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#0066CC] to-[#0BAAFF] flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium">{highlight}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const DeepFeatureSection = () => {
    const features = [
        {
            title: "Lightning-Fast Performance",
            description: "Advanced language model optimized for speed with built-in retry logic. Get comprehensive analysis in under 60 seconds.",
            image: "/feature_lightning.png"
        },
        {
            title: "Smart Question Detection",
            description: "Detects whether your idea is location-specific and adapts questions accordingly. Avoids redundant queries.",
            image: "/feature_validation.png"
        },
        {
            title: "Non-Repetitive Tasks",
            description: "Every day in your 60-day plan has unique activities. No generic advice or duplicate recommendations.",
            image: "/feature_roadmaps.png"
        },
        {
            title: "Full Context AI Chat",
            description: "AI mentor that knows your entire journey—idea, plan, progress, and current task.",
            image: "/feature_ai.png"
        }
    ];

    return (
        <section className="w-full bg-white py-24 overflow-hidden mb-24">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                        </span>
                        <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">Deep Dive</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-5">
                        Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]">Speed</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-500 font-sans font-medium leading-relaxed max-w-2xl mx-auto">
                        Every feature designed to help you move faster without sacrificing quality.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="feature-card group relative">
                            {/* Border */}
                            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-[#0066CC]/30 via-[#0BAAFF]/30 to-transparent opacity-50 pointer-events-none"></div>

                            {/* Glow */}
                            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#0066CC] to-[#0BAAFF] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20"></div>

                            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border-[1px] m-[1px] overflow-hidden transition-all duration-500 group-hover:bg-white/90 shadow-lg group-hover:shadow-2xl">
                                {feature.image && (
                                    <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent z-10"></div>
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="relative p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed font-sans">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesPage;
