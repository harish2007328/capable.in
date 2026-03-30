import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'capable_cookie_consent';

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const accept = (analytics = true) => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics, ts: Date.now() }));
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                    className="fixed bottom-4 left-4 z-[200] w-[280px]"
                >
                    <div className="bg-white border border-slate-200/80 rounded-xl shadow-lg shadow-slate-900/8 p-4">
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-3">
                            We use cookies for login and to improve your experience.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => accept(true)}
                                className="flex-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors active:scale-[0.97]"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => accept(false)}
                                className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
