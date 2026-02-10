import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User } from 'lucide-react';

const LoginPage = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('Founder');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        login({ name, role, joinedAt: new Date().toISOString() });
        navigate(from, { replace: true });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 relative overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#073B99]/20 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/15 rounded-full blur-[200px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-blue-100 p-8 md:p-10 rounded-2xl shadow-lg animate-fade-in-up relative z-10">

                <div className="text-center mb-10 space-y-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full text-brand-blue mb-2">
                        <User size={24} />
                    </span>
                    <h1 className="text-3xl font-display font-bold text-brand-black tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 text-sm">Sign in to access your venture dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alex"
                            className="input-primary"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">
                            Role
                        </label>
                        <div className="relative">
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="input-primary appearance-none"
                            >
                                <option value="Founder">Founder</option>
                                <option value="Visionary">Visionary</option>
                                <option value="Builder">Builder</option>
                                <option value="Strategist">Strategist</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full rounded-md"
                    >
                        Enter Portal <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-xs text-slate-400">
                        Secure Local Authentication
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
