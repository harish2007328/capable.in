import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Globe2 } from 'lucide-react';

const LocationForm = ({ onSubmit }) => {
    const [location, setLocation] = useState({
        country: '',
        state: '',
        city: ''
    });

    const isValid = location.country && location.city;

    const handleSubmit = () => {
        if (isValid) {
            onSubmit(location);
        }
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-900/5 rounded-3xl p-8 md:p-12 relative overflow-hidden ring-1 ring-white/60"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="text-center mb-10 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                        <Globe2 size={14} className="text-[#0066CC]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0066CC]">
                            Context Layer
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                        Where are you launching?
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Markets differ by geography. We'll tailor the strategy to your specific location.
                    </p>
                </div>

                {/* Form Inputs */}
                <div className="space-y-5 relative z-10">
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Country</label>
                        <input
                            type="text"
                            value={location.country}
                            onChange={(e) => setLocation({ ...location, country: e.target.value })}
                            placeholder="e.g. United States"
                            className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all hover:bg-white/80"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">State / Province</label>
                            <input
                                type="text"
                                value={location.state}
                                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                placeholder="e.g. California"
                                className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all hover:bg-white/80"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">City</label>
                            <input
                                type="text"
                                value={location.city}
                                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                placeholder="e.g. San Francisco"
                                className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all hover:bg-white/80"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-10 relative z-10">
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`
                            w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all duration-300
                            ${isValid
                                ? 'bg-[#0066CC] text-white shadow-xl shadow-blue-500/20 hover:bg-[#0052a3] hover:shadow-blue-500/30 hover:-translate-y-0.5'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }
                        `}
                    >
                        Initialize Analysis <ArrowRight size={16} />
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">
                        Step 1 of 2: Context Setup
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LocationForm;
