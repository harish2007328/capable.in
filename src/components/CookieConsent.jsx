import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X } from 'lucide-react';

const CONSENT_KEY = 'capable_cookie_consent';

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Small delay so the banner doesn't flash on page load
        const timer = setTimeout(() => {
            const consent = localStorage.getItem(CONSENT_KEY);
            if (!consent) {
                setVisible(true);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            accepted: true,
            essential: true,
            analytics: true,
            timestamp: new Date().toISOString()
        }));
        setVisible(false);
    };

    const handleEssentialOnly = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            accepted: true,
            essential: true,
            analytics: false,
            timestamp: new Date().toISOString()
        }));
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6"
                >
                    <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-5 md:p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Cookie size={18} className="text-[var(--brand-accent)]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">We value your privacy</h3>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cookie preferences</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEssentialOnly}
                                className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors rounded-lg hover:bg-slate-50"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <p className="text-xs text-slate-500 leading-relaxed mb-5 font-medium">
                            We use cookies to keep you signed in, remember your preferences, and improve your experience. 
                            Essential cookies are required for authentication and core functionality.
                        </p>

                        {/* Cookie Types */}
                        <div className="flex flex-wrap gap-3 mb-5">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                                <Shield size={11} className="text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Essential</span>
                                <span className="text-[9px] text-emerald-500 font-medium">· Always on</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full">
                                <Cookie size={11} className="text-blue-600" />
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Analytics</span>
                                <span className="text-[9px] text-blue-500 font-medium">· Optional</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <button
                                onClick={handleAccept}
                                className="flex-1 px-5 py-2.5 bg-[var(--brand-accent)] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[var(--brand-accent-hover)] transition-all active:scale-[0.98] shadow-sm shadow-blue-200"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleEssentialOnly}
                                className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-[0.98]"
                            >
                                Essential Only
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
