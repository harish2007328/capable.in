import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User, Mail, Lock, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, signup, loginWithOAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signup(email, password);
                // If signup requires email confirmation, we might need to show a success message
                alert('Sign up successful! Please check your email for confirmation if required.');
            }
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden bg-white selection:bg-blue-100">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#073B99]/10 rounded-full blur-[250px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#0BAAFF]/10 rounded-full blur-[250px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-[#0066CC] transition-colors group">
                        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-2xl border border-blue-50 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-500/5"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl text-[#0066CC] mb-6 shadow-sm shadow-blue-100">
                            {mode === 'login' ? <User size={32} /> : <Sparkles size={32} />}
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-500 mt-3 font-medium">
                            {mode === 'login' ? "Scale your vision with the right tools." : "Join the elite cohort of venture founders."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode='wait'>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0066CC] px-1 opacity-60">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0066CC]" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="founder@example.com"
                                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0066CC] px-1 opacity-60">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0066CC]" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wider flex items-center justify-center gap-3 hover:bg-[#0066CC] shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Authenticating...' : 'Commence Journey'}
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-sm font-bold text-slate-400 hover:text-[#0066CC] transition-colors"
                        >
                            {mode === 'login' ? "Don't have an account? Start here." : "Already an initiate? Sign in."}
                        </button>
                    </div>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-white px-4 text-slate-400">Continue With</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => loginWithOAuth('google')}
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 active:scale-95 group"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => loginWithOAuth('github')}
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 active:scale-95 group"
                        >
                            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                            <div className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-[#0066CC] uppercase tracking-widest">Supabase Cloud Auth</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] text-center max-w-xs leading-loose">
                            Enterprise-grade security via high-performance decentralized identity.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
