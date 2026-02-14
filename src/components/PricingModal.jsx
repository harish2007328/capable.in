import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Rocket, Crown, Check } from 'lucide-react';

const PricingModal = ({ isOpen, onClose }) => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    if (!isOpen) return null;

    const plans = [
        {
            name: "Starter",
            price: 0,
            icon: Zap,
            color: "text-[var(--brand-accent)]",
            features: ["1 project", "Basic market research", "30-day action plan", "AI mentor chat (limited)"]
        },
        {
            name: "Professional",
            price: billingCycle === 'monthly' ? 29 : 279,
            icon: Rocket,
            featured: true,
            features: ["Unlimited projects", "Advanced research", "Unlimited AI chat", "Export reports (PDF)", "Priority support"]
        },
        {
            name: "Enterprise",
            price: "Custom",
            icon: Crown,
            features: ["Everything in Pro", "White-label reports", "API access", "Team collaboration", "Dedicated manager"]
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 pb-0 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Choose Your Plan</h2>
                            <p className="text-slate-500 mt-2">Scale your vision with the right tools.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex justify-center mt-6">
                        <div className="bg-slate-100 p-1.5 rounded-full flex gap-1">
                            {['monthly', 'annual'].map((cycle) => (
                                <button
                                    key={cycle}
                                    onClick={() => setBillingCycle(cycle)}
                                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${billingCycle === cycle ? 'bg-white text-[var(--brand-accent)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {cycle === 'monthly' ? 'Monthly' : 'Annual (-20%)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 overflow-y-auto custom-scrollbar">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            return (
                                <div
                                    key={plan.name}
                                    className={`relative p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col ${plan.featured ? 'border-[var(--brand-accent)] bg-blue-50/30 ring-4 ring-blue-50' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
                                >
                                    {plan.featured && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--brand-accent)] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            Recommended
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.featured ? 'bg-[var(--brand-accent)] text-white' : 'bg-blue-50 text-[var(--brand-accent)]'}`}>
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-3xl font-bold text-slate-900">{typeof plan.price === 'number' ? `$${plan.price}` : plan.price}</span>
                                        {typeof plan.price === 'number' && <span className="text-slate-400 text-sm ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                <div className="w-5 h-5 rounded-full bg-blue-50 text-[var(--brand-accent)] flex items-center justify-center scale-90">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${plan.featured ? 'bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)] shadow-lg shadow-blue-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                        {plan.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PricingModal;
