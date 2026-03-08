import React, { useState } from 'react';
import {
    ChevronRight, Info, Users, Workflow, Cpu, Code2,
    FileText, ShieldCheck, HelpCircle, Clock, Zap, Target,
    Search, BarChart3, Database, Globe, Lock, Mail, ArrowRight,
    Eye, Layers, Share2, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DocsPage = () => {
    const [activePage, setActivePage] = useState('what-is-it');
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = [
        { id: 'what-is-it', title: 'What is Capable?', icon: <Info className="w-4 h-4" /> },
        { id: 'who-onboard', title: 'Who is it for?', icon: <Users className="w-4 h-4" /> },
        { id: 'how-it-works', title: 'The Workflow', icon: <Workflow className="w-4 h-4" /> },
        { id: 'intelligence', title: 'Intelligence Engine', icon: <Cpu className="w-4 h-4" /> },
        { id: 'tech-stack', title: 'System Architecture', icon: <Code2 className="w-4 h-4" /> },
        { id: 'deliverables', title: 'Venture Deliverables', icon: <FileText className="w-4 h-4" /> },
        { id: 'security', title: 'Security & Privacy', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'support', title: 'Support & FAQ', icon: <HelpCircle className="w-4 h-4" /> }
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'what-is-it':
                return (
                    <div className="space-y-16 text-gray-600">
                        {/* Section 1: Executive Summary */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">The Venture Synthesis Environment</h2>
                            <div className="prose prose-slate max-w-none space-y-6">
                                <p className="text-lg leading-relaxed text-gray-700">
                                    Capable is not a brainstorming tool; it is a **Venture Synthesis Environment (VSE)**. It is architected to solve the "Founder's Trap"—the critical period where optimism bias obscures structural business flaws.
                                </p>
                                <p className="leading-relaxed">
                                    By utilizing advanced semantic modeling and high-fidelity market data, Capable performs a **First Principles Reconstruction** of your business concept. We take a raw "spark" and pass it through a series of intelligence filters to determine if it has the structural integrity to scale into a professional-grade venture.
                                </p>
                            </div>
                        </section>

                        {/* Section 2: The Core Philosophy */}
                        <section className="pt-10 border-t border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-8">The Core Philosophy</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Radical Clarity</h4>
                                    <p className="text-sm leading-relaxed">We strip away the "feature-bloat" thinking and focus on the **Atomic Problem**. If the core problem isn't solved, the features won't matter.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white">
                                        <Compass className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Synthetic Reasoning</h4>
                                    <p className="text-sm leading-relaxed">Most AI generates templates. We generate **Logic**. Our engine builds an internal model of your business to test how variables interact.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Structural Audit</h4>
                                    <p className="text-sm leading-relaxed">We don't just say "it's a good idea." We audit the **Unit Economics** and **Distribution Channels** before you even build it.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Solving the Market Gap */}
                        <section className="bg-gray-900 rounded-2xl p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Search className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold mb-6 relative z-10">Bridging the Market Gap</h3>
                            <div className="space-y-6 relative z-10">
                                <p className="text-gray-300 leading-relaxed italic">
                                    "Most ventures fail not because the product is bad, but because the market signal was misread at the inception point."
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                    <div className="border-l border-blue-500/30 pl-6">
                                        <h5 className="font-bold text-sm mb-2 text-blue-400">Signal Detection</h5>
                                        <p className="text-xs text-gray-400">Our engine scans competitor clustering and search intent to find "Open Oxygen"—areas where demand is high but current solutions are structurally weak.</p>
                                    </div>
                                    <div className="border-l border-white/20 pl-6">
                                        <h5 className="font-bold text-sm mb-2 text-white">Execution Alignment</h5>
                                        <p className="text-xs text-gray-400">We map your personal/team capabilities against the business requirements to identify the specific hires or skills needed for Day 1.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: What Capable is NOT */}
                        <section className="pt-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">System Boundaries</h3>
                            <p className="text-sm text-gray-500 mb-8">To maintain the fidelity of our outputs, we define strict operational boundaries:</p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-5 border border-gray-100 rounded-xl">
                                    <div className="mt-1 text-red-500"><ShieldCheck className="w-4 h-4" /></div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Not a Content Generator</h5>
                                        <p className="text-xs text-gray-500 mt-1">Capable does not write marketing copy or social posts. It generates **Strategic Infrastructure** and **Decision Models**.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-5 border border-gray-100 rounded-xl">
                                    <div className="mt-1 text-red-500"><ShieldCheck className="w-4 h-4" /></div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Not a Pitch Deck Builder</h5>
                                        <p className="text-xs text-gray-500 mt-1">While the data can be used for decks, our focus is on **Truth Detection**—helping the founder know if they *should* build it, not how to sell it.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'who-onboard':
                return (
                    <div className="space-y-10 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Who is it for?</h2>
                            <p className="leading-relaxed mb-8">
                                Capable isn't for casual brainstorming; it’s built for founders, agencies, and investors who require surgical precision in their venture planning.
                            </p>

                            <div className="space-y-8">
                                <div className="p-6 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2">01. High-Conviction Solo Founders</h4>
                                    <p className="text-sm">For individuals moving from a "Spark" to an MVP. Capable provides the advisory oversight usually reserved for well-funded teams.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2">02. Venture Studios & Accelerators</h4>
                                    <p className="text-sm">Standardize the due diligence process for new batch companies. Use Capable to validate concepts at volume before significant capital allocation.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2">03. Digital Product Agencies</h4>
                                    <p className="text-sm">Enhance your discovery phase. Provide clients with a 60-day strategic roadmap and market audit as a premium deliverable.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'how-it-works':
                return (
                    <div className="space-y-12 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">The Workflow</h2>
                            <p className="leading-relaxed mb-10">The platform follows a linear 4-phase protocol to move from zero to execution-ready.</p>

                            <div className="space-y-12">
                                <div className="flex gap-8 group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">01</div>
                                    <div className="pt-2">
                                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Phase 1: Idea Enhancement</h4>
                                        <p className="text-sm leading-relaxed">Our **Semantic Expansion Engine** takes your raw input—no matter how vague—and refines it into a high-conviction mission statement. We identify the "who, what, and why" automatically.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">02</div>
                                    <div className="pt-2">
                                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Phase 2: Deep Discovery</h4>
                                        <p className="text-sm leading-relaxed">The engine generates 3-5 high-stakes strategic questions. Your answers act as raw materials for the analysis engine to probe for market friction.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">03</div>
                                    <div className="pt-2">
                                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Phase 3: Synthetic Audit</h4>
                                        <p className="text-sm leading-relaxed">We perform a multi-lens audit covering competitive positioning, revenue feasibility, and technical complexity. This is where the core business strategy is solidified.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">04</div>
                                    <div className="pt-2">
                                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Phase 4: Roadmap Generation</h4>
                                        <p className="text-sm leading-relaxed">The final output: a surgical 60-day action plan. Broken down weekly, it guides you from foundation setup to growth architecture.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'intelligence':
                return (
                    <div className="space-y-12 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Intelligence Engine</h2>
                            <p className="leading-relaxed mb-8">
                                Capable operates on balanced **LLM Orchestration**, utilizing multiple specialized AI agents to ensure diverse strategic perspectives.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl">
                                    <Search className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Market Signal Mapping</h5>
                                    <p className="text-xs leading-relaxed text-gray-500">Autonomous research agents scan current market structures to identify "Unmet Search Intent" and competitive clusters.</p>
                                </div>
                                <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl">
                                    <BarChart3 className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Unit Economic Projections</h5>
                                    <p className="text-xs leading-relaxed text-gray-500">Heuristic-based agents calculate initial CAC (Customer Acquisition Cost) and LTV (Lifetime Value) models for the venture.</p>
                                </div>
                                <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Assumption Stress-Testing</h5>
                                    <p className="text-xs leading-relaxed text-gray-500">"Red Team" agents specifically look for reasonings why the business might fail, forcing structural pivots early.</p>
                                </div>
                                <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl">
                                    <Zap className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Synthetic Reasoning</h5>
                                    <p className="text-xs leading-relaxed text-gray-500">Custom context-injection layers that allow the AI to think in "First Principles" rather than generic industry templates.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'tech-stack':
                return (
                    <div className="space-y-12 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Architecture</h2>
                            <p className="leading-relaxed mb-10">Capable is designed for low-latency, real-time data processing and enterprise-level stability.</p>

                            <div className="space-y-6">
                                <div className="flex gap-6 items-start pb-6 border-b border-gray-50">
                                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white flex-shrink-0 font-bold text-xs italic">FE</div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Frontend Framework</h5>
                                        <p className="text-sm">React 18 bundled with Vite. State management via custom hooks and Context API for zero-lag interactions.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start pb-6 border-b border-gray-50">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 font-bold text-xs italic">BE</div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Backend & Logic</h5>
                                        <p className="text-sm">Node.js / Express server orchestration. High-speed JSON streaming for real-time AI status updates.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start pb-6 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white flex-shrink-0 font-bold text-xs italic">DB</div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Persistence & Auth</h5>
                                        <p className="text-sm">Supabase (PostgreSQL) handling isolated project environments and secure user authentication via JWT.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white flex-shrink-0 font-bold text-xs italic">AI</div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Intelligence Providers</h5>
                                        <p className="text-sm">Integration with OpenAI GPT-4o and Groq LPU ecosystems for local-speed strategic reasoning.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'deliverables':
                return (
                    <div className="space-y-10 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Venture Deliverables</h2>
                            <p className="leading-relaxed mb-8">Every completed discovery session produces 4 high-value technical assets.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 border border-gray-100 rounded-xl bg-[#FAFBFF]">
                                    <FileText className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">The Venture Report</h5>
                                    <p className="text-xs text-gray-500 italic mb-2">Format: Digital Dashboard / PDF</p>
                                    <p className="text-xs leading-relaxed text-gray-500 tracking-tight">Comprehensive analysis covering executive summary, market validation, and structural risks.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-xl bg-[#FAFBFF]">
                                    <Workflow className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">60-Day Action Map</h5>
                                    <p className="text-xs text-gray-500 italic mb-2">Format: Interactive Task Board</p>
                                    <p className="text-xs leading-relaxed text-gray-500 tracking-tight">Week-by-week execution steps from brand foundation to initial customer acquisition.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-xl bg-[#FAFBFF]">
                                    <Users className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Org Architecture</h5>
                                    <p className="text-xs text-gray-500 italic mb-2">Format: Structured Data</p>
                                    <p className="text-xs leading-relaxed text-gray-500 tracking-tight">Hiring priorities, role definitions, and skill-gap analysis for your core founding team.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-xl bg-[#FAFBFF]">
                                    <Database className="w-5 h-5 text-blue-600 mb-4" />
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Tech Requirement Map</h5>
                                    <p className="text-xs text-gray-500 italic mb-2">Format: Technical Specification</p>
                                    <p className="text-xs leading-relaxed text-gray-500 tracking-tight">Standardized stack recommendations and cost estimates for the initial build.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-12 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Privacy</h2>
                            <p className="leading-relaxed mb-8">We treat venture data as proprietary IP. Our architecture is built with "Isolation by Default."</p>

                            <div className="space-y-6">
                                <div className="flex gap-4 p-5 rounded-xl border border-gray-100 items-start">
                                    <Lock className="w-5 h-5 text-gray-900 mt-1" />
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Isolated Project Scopes</h5>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Each venture is contained within its own encrypted database scope. There is no cross-project data leakage for AI training.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-5 rounded-xl border border-gray-100 items-start">
                                    <ShieldCheck className="w-5 h-5 text-gray-900 mt-1" />
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Enterprise Encryption</h5>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We utilize Supabase’s enterprise-tier security layers.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-5 rounded-xl border border-gray-100 items-start">
                                    <Globe className="w-5 h-5 text-gray-900 mt-1" />
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">Compliance Readiness</h5>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Designed with GDPR and SOC2 principles in mind. You maintain full ownership and can request total data erasure at any time.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'support':
                return (
                    <div className="space-y-12 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Support & FAQ</h2>

                            <div className="space-y-6 mb-12">
                                <div className="p-6 rounded-xl bg-gray-50">
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Can I export my roadmap?</h5>
                                    <p className="text-sm text-gray-500">Yes, finished ventures can be accessed via your dashboard at any time. PDF export for the full Venture Report is supported.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gray-50">
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">How long does discovery take?</h5>
                                    <p className="text-sm text-gray-500">A high-fidelity session typically takes 20-30 minutes of deep focus to produce a validated roadmap.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gray-50">
                                    <h5 className="font-bold text-gray-900 text-sm mb-2">Who owns the AI output?</h5>
                                    <p className="text-sm text-gray-500">You do. Capable acts as an assistant; all strategic maps and venture identities belong to the account holder.</p>
                                </div>
                            </div>

                            <section className="pt-10 border-t border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4">Direct Assistance</h4>
                                <div className="flex items-center gap-4 p-5 border border-blue-50 bg-[#FAFBFF] rounded-xl">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Contact the Architect</p>
                                        <p className="text-xs text-gray-400">Response time: &lt; 24 hours for technical inquiries.</p>
                                    </div>
                                </div>
                            </section>
                        </section>
                    </div>
                );
            default:
                return (
                    <div className="py-20 text-center text-gray-400 font-bold italic">
                        <p>Access Denied: Section Protocol Not Found.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-600 selection:text-white flex flex-col">
            {/* Sticky Secondary Header */}
            <div className="sticky top-[84px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 transition-all duration-300">
                <div className="max-w-[1240px] mx-auto px-8 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 uppercase tracking-widest font-bold shrink-0">
                        <Link to="/" className="hover:text-gray-900 transition-colors">Archive</Link>
                        <ChevronRight className="w-3 h-3 opacity-50" />
                        <span className="text-blue-600">Documentation</span>
                    </div>

                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search architecture..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1240px] mx-auto flex flex-1 w-full pt-20">
                {/* Minimal Sidebar */}
                <aside className="w-64 border-r border-gray-100 py-12 px-8 shrink-0 sticky top-[152px] h-[calc(100vh-152px)] overflow-y-auto custom-scrollbar">
                    <nav className="space-y-1">
                        {navigation.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActivePage(item.id);
                                    window.scrollTo({ top: 0, behavior: 'instant' });
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all group ${activePage === item.id
                                    ? 'bg-gray-900 text-white font-bold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className={`${activePage === item.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-600'} transition-colors`}>{item.icon}</span>
                                {item.title}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-20 pt-10 border-t border-gray-50">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs text-gray-600 font-medium">Nodes Operational</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 pt-20 pb-16 px-12 md:px-24">
                    <div className="max-w-3xl">
                        <header className="mb-12 border-b border-gray-100 pb-10">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tighter">
                                {navigation.find(n => n.id === activePage)?.title}
                            </h1>
                            <div className="flex items-center gap-4 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Reviewed Mar 2025</span>
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                <span className="text-blue-600">Verified Protocol</span>
                            </div>
                        </header>

                        <div className="content-container">
                            {renderContent()}
                        </div>

                        {/* Pagination Utility */}
                        <div className="mt-24 pt-10 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
                            <button className="text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px]">Prev Page</button>
                            <button
                                onClick={() => {
                                    const nextIndex = (navigation.findIndex(n => n.id === activePage) + 1) % navigation.length;
                                    setActivePage(navigation[nextIndex].id);
                                    window.scrollTo({ top: 0, behavior: 'instant' });
                                }}
                                className="text-blue-600 hover:text-blue-700 transition-all flex items-center gap-2 group uppercase tracking-widest text-[10px]"
                            >
                                Next Section <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DocsPage;
