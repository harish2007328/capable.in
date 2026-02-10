import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Laptop, Users, Globe, Rocket, Briefcase } from 'lucide-react';
import Footer from '../components/Footer';

const UseCasesPage = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#073B99]/100 rounded-full blur-[220px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/100 rounded-full blur-[220px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#0066CC]/50 rounded-full blur-[180px] pointer-events-none"></div>

            {/* Hero Section */}
            <div className="relative z-30 flex flex-col items-center px-4 max-w-7xl mx-auto w-full pt-32 md:pt-40">
                <div className="usecase-hero text-center max-w-5xl">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                        </span>
                        <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">Real World Applications</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-[#000000] tracking-tight leading-tight mb-6">
                        Built for Every<br /><span className="text-[#0066CC]">Type of Founder</span>
                    </h1>

                    <p className="text-base md:text-lg text-[#333333] max-w-2xl mx-auto font-sans font-medium leading-relaxed mb-12 px-6">
                        From local businesses to global SaaS products, Capable adapts to your unique context and delivers actionable strategies.
                    </p>
                </div>

                {/* Use Case Grid */}
                <div className="w-full max-w-6xl mx-auto mt-16 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        <UseCaseCard
                            icon={<Store className="w-8 h-8 text-white" />}
                            gradient="from-[#073B99] via-[#0066CC] to-[#0BAAFF]"
                            title="Local Business"
                            description="Coffee shop, retail store, or service business"
                            features={["Location-specific market analysis", "Local competition mapping", "Foot traffic optimization", "Community engagement tactics"]}
                            example="A bakery in Austin gets hyperlocal customer insights, nearby competitor analysis, and a launch plan with local vendor recommendations."
                        />

                        <UseCaseCard
                            icon={<Laptop className="w-8 h-8 text-white" />}
                            gradient="from-[#0BAAFF] via-[#0066CC] to-[#073B99]"
                            title="SaaS Product"
                            description="B2B software or web application"
                            features={["Global market sizing", "Product-market fit validation", "Pricing strategy analysis", "Go-to-market roadmap"]}
                            example="A project management tool gets demand scoring, competitor differentiation strategies, and a 60-day launch plan with beta testing milestones."
                        />

                        <UseCaseCard
                            icon={<Globe className="w-8 h-8 text-white" />}
                            gradient="from-[#0066CC] to-[#0BAAFF]"
                            title="E-Commerce"
                            description="Online store or marketplace"
                            features={["Niche demand validation", "Platform selection guidance", "Supply chain considerations", "Digital marketing strategy"]}
                            example="An eco-friendly fashion brand gets sustainability market trends, supplier recommendations, and an Instagram-first marketing plan."
                        />

                        <UseCaseCard
                            icon={<Users className="w-8 h-8 text-white" />}
                            gradient="from-[#073B99] to-[#0066CC]"
                            title="Consulting Service"
                            description="Coaching, advisory, or professional services"
                            features={["Target audience profiling", "Service package design", "Pricing model analysis", "Authority building tactics"]}
                            example="A career coach gets LinkedIn positioning strategy, content calendar, and a consulting package structure with pricing tiers."
                        />

                        <UseCaseCard
                            icon={<Rocket className="w-8 h-8 text-white" />}
                            gradient="from-[#0BAAFF] to-[#073B99]"
                            title="Startup Idea"
                            description="New venture or innovation"
                            features={["Problem-solution fit assessment", "Investor readiness evaluation", "MVP definition and scope", "Fundraising timeline"]}
                            example="A fintech startup gets regulatory risk assessment, competitive moat analysis, and a technical MVP roadmap with milestone funding goals."
                        />

                        <UseCaseCard
                            icon={<Briefcase className="w-8 h-8 text-white" />}
                            gradient="from-[#0066CC] via-[#0BAAFF] to-[#073B99]"
                            title="Side Project"
                            description="Passion project or side hustle"
                            features={["Time-constrained planning", "Low-budget validation", "Scalability assessment", "Work-life balance tactics"]}
                            example="A newsletter creator gets audience research, monetization strategies, and a content plan that fits a 10hr/week schedule."
                        />
                    </div>

                    <SuccessStoriesSection />
                </div>

                {/* CTA Section */}
                <CTASection />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

const UseCaseCard = ({ icon, gradient, title, description, features, example }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="usecase-card group relative">
            {/* Animated Border */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#0066CC] via-[#0BAAFF] to-[#0066CC] opacity-50 pointer-events-none"></div>

            {/* Glow Effect */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#0066CC] to-[#0BAAFF] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30"></div>

            {/* Glass Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 m-[1px] h-full flex flex-col shadow-lg transition-all duration-500 group-hover:bg-white/90 group-hover:shadow-2xl">
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-60 pointer-events-none"></div>

                {/* Icon with glass effect */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl`}>
                    <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative z-10">{icon}</div>
                </div>

                <h3 className="relative text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
                <p className="relative text-sm text-gray-500 mb-6 font-medium">{description}</p>

                <ul className="relative space-y-2.5 mb-6 flex-grow">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#0066CC] to-[#0BAAFF] flex items-center justify-center mt-0.5 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                            <span className="font-medium leading-relaxed">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button onClick={() => setIsExpanded(!isExpanded)} className="relative text-[#0066CC] text-sm font-bold hover:text-[#0052a3] text-left transition-all duration-300 flex items-center gap-1.5">
                    {isExpanded ? 'Hide Example' : 'See Example'}
                    <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>→</span>
                </button>

                {isExpanded && (
                    <div className="relative mt-4 p-5 bg-gradient-to-br from-blue-50/80 to-blue-50/40 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-inner">
                        <p className="text-xs text-gray-700 leading-relaxed italic">{example}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SuccessStoriesSection = () => {
    const stories = [
        { quote: "Capable helped me validate my coffee shop idea in Austin and gave me a hyperlocal launch plan with actual vendor recommendations.", author: "Sarah M.", role: "Local Business Owner", gradient: "from-[#073B99] to-[#0066CC]" },
        { quote: "The 60-day plan for my SaaS product was incredibly specific. Every task was unique and actionable—no generic advice.", author: "James K.", role: "SaaS Founder", gradient: "from-[#0066CC] to-[#0BAAFF]" },
        { quote: "As a side-project creator, the time-constrained planning was perfect. I launched my newsletter in 8 weeks while working full-time.", author: "Maya R.", role: "Content Creator", gradient: "from-[#0BAAFF] to-[#073B99]" }
    ];

    return (
        <section className="w-full py-20">
            <div className="text-center max-w-4xl mx-auto mb-16">
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">Success Stories</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight tracking-tight mb-5">
                    Real Founders, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]">Real Results</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stories.map((story, idx) => (
                    <div key={idx} className="usecase-card group relative">
                        {/* Glow Effect */}
                        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-white/40 to-white/20 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-40"></div>

                        <div className={`relative bg-gradient-to-br ${story.gradient} rounded-3xl p-8 h-full flex flex-col shadow-xl transition-all duration-500 group-hover:shadow-2xl overflow-hidden`}>
                            {/* Glass overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                            <p className="relative text-white/95 font-sans leading-relaxed mb-6 flex-grow italic text-base">"{story.quote}"</p>
                            <div className="relative">
                                <p className="text-white font-bold text-lg">{story.author}</p>
                                <p className="text-white/80 text-sm mt-1">{story.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CTASection = () => (
    <section className="w-full relative overflow-hidden mb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="relative bg-gradient-to-br from-[#073B99] via-[#0066CC] to-[#0BAAFF] rounded-2xl p-10 md:p-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0BAAFF]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight tracking-tight mb-6">
                        Your Idea Can Be Next
                    </h2>

                    <p className="text-base md:text-lg text-white/80 font-sans font-medium leading-relaxed max-w-xl mx-auto mb-10">
                        No matter what you're building, Capable gives you the insights and roadmap to launch with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/dashboard" className="bg-white text-[#0066CC] px-8 py-3 rounded-md font-bold text-sm tracking-wide transition-all duration-300 hover:bg-white/80 active:scale-95 shadow-lg shadow-black/20 border border-white/20">
                            Validate Your Idea Now
                        </Link>
                        <Link to="/pricing" className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide border border-white/20 transition-all duration-300 hover:bg-white/20 active:scale-95">
                            See Pricing
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default UseCasesPage;
