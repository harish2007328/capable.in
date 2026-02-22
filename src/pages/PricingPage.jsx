import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Zap, Crown, Rocket } from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const PricingPage = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#073B99]/100 rounded-full blur-[220px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/100 rounded-full blur-[220px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[var(--brand-accent)]/50 rounded-full blur-[180px] pointer-events-none"></div>

            {/* Hero Section */}
            <div className="relative z-30 flex flex-col items-center px-4 max-w-7xl mx-auto w-full pt-32 md:pt-40">
                <div className="pricing-hero text-center max-w-5xl">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-accent)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-accent)]"></span>
                        </span>
                        <span className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider">Transparent Pricing</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-[#000000] tracking-tight leading-tight mb-6">
                        Plans That Scale<br /><span className="text-[var(--brand-accent)]">With Your Vision</span>
                    </h1>

                    <p className="text-base md:text-lg text-[#333333] max-w-2xl mx-auto font-sans font-medium leading-relaxed mb-12 px-6">
                        Start free, upgrade when you need more. No hidden fees, no surprises. Cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1.5 mb-16">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${billingCycle === 'monthly'
                                ? 'bg-white text-[var(--brand-accent)] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${billingCycle === 'annual'
                                ? 'bg-white text-[var(--brand-accent)] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Annual <span className="text-xs text-green-600 ml-1">(Save 20%)</span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <PricingCard
                        icon={<Zap className="w-6 h-6 text-[var(--brand-accent)]" />}
                        name="Starter"
                        description="Perfect for testing your first idea"
                        price={billingCycle === 'monthly' ? 0 : 0}
                        period={billingCycle === 'monthly' ? '/month' : '/year'}
                        features={[
                            { text: '1 project', included: true },
                            { text: 'Basic market research', included: true },
                            { text: '30-day action plan', included: true },
                            { text: 'AI mentor chat (limited)', included: true },
                            { text: 'Community support', included: true },
                            { text: 'Advanced analytics', included: false },
                            { text: 'Priority support', included: false },
                            { text: 'Export reports', included: false }
                        ]}
                        cta="Start Free"
                        gradient="from-gray-50 to-white"
                        borderColor="border-gray-200"
                        popular={false}
                    />

                    <PricingCard
                        icon={<Rocket className="w-6 h-6 text-white" />}
                        name="Professional"
                        description="For serious founders ready to launch"
                        price={billingCycle === 'monthly' ? 29 : 279}
                        period={billingCycle === 'monthly' ? '/month' : '/year'}
                        features={[
                            { text: 'Unlimited projects', included: true },
                            { text: 'Advanced market research', included: true },
                            { text: '60-day action plan', included: true },
                            { text: 'Unlimited AI mentor chat', included: true },
                            { text: 'Priority support', included: true },
                            { text: 'Advanced analytics', included: true },
                            { text: 'Export reports (PDF)', included: true },
                            { text: 'Team collaboration', included: false }
                        ]}
                        cta="Get Started"
                        gradient="from-[#073B99] via-[var(--brand-accent)] to-[#0BAAFF]"
                        borderColor=""
                        popular={true}
                    />

                    <PricingCard
                        icon={<Crown className="w-6 h-6 text-[var(--brand-accent)]" />}
                        name="Enterprise"
                        description="Custom solutions for teams"
                        price="Custom"
                        period=""
                        features={[
                            { text: 'Everything in Professional', included: true },
                            { text: 'Team collaboration', included: true },
                            { text: 'White-label reports', included: true },
                            { text: 'API access', included: true },
                            { text: 'Dedicated account manager', included: true },
                            { text: 'Custom integrations', included: true },
                            { text: 'SLA guarantee', included: true },
                            { text: 'Training & onboarding', included: true }
                        ]}
                        cta="Contact Sales"
                        gradient="from-gray-50 to-white"
                        borderColor="border-gray-200"
                        popular={false}
                    />
                </div>

                {/* FAQ Section */}
                <PricingFAQSection />

                {/* CTA Section */}
                <CTASection />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

const PricingCard = ({ icon, name, description, price, period, features, cta, gradient, borderColor, popular }) => {
    const isGradient = gradient.includes('via');
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className={`pricing-card group relative ${popular ? 'md:-mt-8' : ''}`}>
            {/* Popular Badge */}
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-[var(--brand-accent)] to-[#0BAAFF] text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-sm">
                        Most Popular
                    </div>
                </div>
            )}

            {/* Border Effect */}
            {popular ? (
                <>
                    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[var(--brand-accent)] via-[#0BAAFF] to-[var(--brand-accent)] opacity-60 pointer-events-none"></div>
                    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[var(--brand-accent)] to-[#0BAAFF] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40"></div>
                </>
            ) : (
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-gray-200/50 to-gray-100/30 pointer-events-none"></div>
            )}

            {/* Card Content */}
            <div className={`relative ${isGradient ? 'bg-gradient-to-br ' + gradient : 'bg-white/80 backdrop-blur-xl'} rounded-3xl p-8 m-[1px] h-full flex flex-col shadow-lg transition-all duration-500 ${popular ? 'md:py-12 shadow-2xl' : 'group-hover:shadow-xl group-hover:bg-white/90'} overflow-hidden`}>
                {/* Gradient Overlay for non-gradient cards */}
                {!isGradient && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>
                )}

                {/* Glass overlay for gradient cards */}
                {isGradient && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                )}

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-2xl ${isGradient ? 'bg-white/20 backdrop-blur-md border border-white/30' : 'bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm'} flex items-center justify-center mb-6 shadow-lg transition-all duration-500 group-hover:scale-105`}>
                    {icon}
                </div>

                {/* Plan Name */}
                <h3 className={`relative text-2xl font-bold mb-2 tracking-tight ${isGradient ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <p className={`relative text-sm mb-6 font-medium ${isGradient ? 'text-white/80' : 'text-gray-600'}`}>{description}</p>

                {/* Price */}
                <div className="relative mb-8">
                    {typeof price === 'number' ? (
                        <div className={`${isGradient ? 'text-white' : 'text-gray-900'}`}>
                            <span className="text-5xl font-bold">${price}</span>
                            <span className={`text-lg ml-1 ${isGradient ? 'text-white/70' : 'text-gray-500'}`}>{period}</span>
                        </div>
                    ) : (
                        <div className={`text-5xl font-bold ${isGradient ? 'text-white' : 'text-gray-900'}`}>{price}</div>
                    )}
                </div>

                {/* CTA Button */}
                {name === 'Professional' ? (
                    <button
                        onClick={() => {
                            if (!user) {
                                navigate('/login', { state: { from: '/pricing' } });
                                return;
                            }
                            const handleCheckout = async () => {
                                try {
                                    const response = await fetch('/api/checkout', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            productId: import.meta.env.VITE_DODO_PRODUCT_ID || 'PRO_PLAN_ID',
                                            userEmail: user.email,
                                            userId: user.id,
                                            metadata: {
                                                plan: 'professional'
                                            }
                                        }),
                                    });
                                    const data = await response.json();
                                    if (data.checkout_url) {
                                        window.location.href = data.checkout_url;
                                    } else {
                                        alert('Failed to initiate checkout. Please check if your API keys are configured.');
                                    }
                                } catch (err) {
                                    console.error('Checkout error:', err);
                                    alert('An error occurred during checkout.');
                                }
                            };
                            handleCheckout();
                        }}
                        className={`relative w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:shadow-xl active:scale-[0.98] mb-8 text-center ${isGradient
                            ? 'bg-white text-[var(--brand-accent)] shadow-lg shadow-black/25 hover:bg-white/95'
                            : 'bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white shadow-lg shadow-[var(--brand-accent)]/30 hover:shadow-[var(--brand-accent)]/40'
                            }`}
                    >
                        {cta}
                    </button>
                ) : (
                    <Link
                        to="/dashboard"
                        className={`relative w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:shadow-xl active:scale-[0.98] mb-8 text-center ${isGradient
                            ? 'bg-white text-[var(--brand-accent)] shadow-lg shadow-black/25 hover:bg-white/95'
                            : 'bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white shadow-lg shadow-[var(--brand-accent)]/30 hover:shadow-[var(--brand-accent)]/40'
                            }`}
                    >
                        {cta}
                    </Link>
                )}

                {/* Features List */}
                <ul className="relative space-y-3.5 flex-grow">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            {feature.included ? (
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full ${isGradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-[var(--brand-accent)] to-[#0BAAFF]'} flex items-center justify-center shadow-sm`}>
                                    <Check className={`w-3 h-3 ${isGradient ? 'text-white' : 'text-white'}`} />
                                </div>
                            ) : (
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full ${isGradient ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                                    <X className={`w-3 h-3 ${isGradient ? 'text-white/40' : 'text-gray-400'}`} />
                                </div>
                            )}
                            <span className={`text-sm leading-relaxed ${feature.included ? (isGradient ? 'text-white/95 font-medium' : 'text-gray-700 font-medium') : (isGradient ? 'text-white/40' : 'text-gray-400')}`}>
                                {feature.text}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const PricingFAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { question: "Can I change plans later?", answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences." },
        { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Enterprise customers can also pay via wire transfer or invoice." },
        { question: "Is there a free trial?", answer: "The Starter plan is completely free forever with no credit card required. You can test the platform before upgrading to Professional or Enterprise." },
        { question: "What happens if I cancel?", answer: "You can cancel anytime. You'll retain access until the end of your billing period, and your data will be available for export for 30 days after cancellation." },
        { question: "Do you offer refunds?", answer: "Yes! We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund." }
    ];

    return (
        <section className="w-full max-w-4xl mx-auto py-20 mb-16">
            <div className="text-center mb-16">
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm cursor-default">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-accent)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-accent)]"></span>
                    </span>
                    <span className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider">FAQ</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight tracking-tight">
                    Common <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-accent)] to-[#0BAAFF]">Questions</span>
                </h2>
            </div>

            <div className="divide-y divide-gray-100">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="group">
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className={`w-full py-6 flex items-center gap-5 text-left transition-all duration-300 ${openIndex === idx ? 'pb-4' : ''}`}
                        >
                            <div className="flex-1 min-w-0">
                                <span className={`font-semibold text-lg block transition-colors duration-300 ${openIndex === idx ? 'text-[var(--brand-accent)]' : 'text-gray-900 group-hover:text-gray-700'}`}>
                                    {faq.question}
                                </span>
                            </div>

                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === idx ? 'bg-[var(--brand-accent)] rotate-180' : 'bg-gray-100 group-hover:bg-blue-50'
                                }`}>
                                <svg className={`w-5 h-5 transition-colors duration-300 ${openIndex === idx ? 'text-white' : 'text-gray-500 group-hover:text-[var(--brand-accent)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-out ${openIndex === idx ? 'max-h-64 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-0 pr-14">
                                <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-5 border-l-4 border-[var(--brand-accent)]">
                                    <p className="text-gray-600 leading-relaxed font-sans">{faq.answer}</p>
                                </div>
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
            <div className="relative bg-gradient-to-br from-[#073B99] via-[var(--brand-accent)] to-[#0BAAFF] rounded-2xl p-10 md:p-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0BAAFF]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight tracking-tight mb-6">
                        Start Building Today
                    </h2>

                    <p className="text-base md:text-lg text-white/80 font-sans font-medium leading-relaxed max-w-xl mx-auto mb-10">
                        Join thousands of founders who've validated their ideas and launched successfully with Capable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/dashboard" className="bg-white text-[var(--brand-accent)] px-8 py-3 rounded-md font-bold text-sm tracking-wide transition-all duration-300 hover:bg-white/80 active:scale-95 shadow-lg shadow-black/20 border border-white/20">
                            Start Free — No Credit Card
                        </Link>
                        <Link to="/features" className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide border border-white/20 transition-all duration-300 hover:bg-white/20 active:scale-95">
                            Explore Features
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default PricingPage;
