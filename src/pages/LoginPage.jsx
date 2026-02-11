import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

const LoginPage = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, signup, loginWithOAuth, user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    // Handle initial mode from navigation state
    React.useEffect(() => {
        if (location.state?.mode) {
            setMode(location.state.mode);
        }
    }, [location.state]);

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    setIsLoading(false);
                    return;
                }
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
        <div className="w-full h-screen flex overflow-hidden bg-white selection:bg-blue-100 font-sans">
            {/* Left Panel - Auth Form (55%) */}
            <div className="w-full lg:w-[55%] h-full flex flex-col relative bg-white overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] pointer-events-none -z-10 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>

                {/* Fixed Header */}
                <div className="p-8 md:p-12 flex items-center justify-between shrink-0 font-display">
                    <Link to="/" className="group flex items-center gap-2">
                        <Logo color="dark" showText={true} className="scale-110" />
                    </Link>

                    <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0066CC] transition-colors group">
                        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>

                {/* Main Form Content - Perfectly Centered in Viewport */}
                <div className="flex-1 flex items-center justify-center px-8 md:px-24 overflow-y-auto custom-scrollbar">
                    <div className="w-full max-w-md py-8">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Title Section */}
                            <div className="mb-10 text-center md:text-left">
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase mb-4 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    {mode === 'login' ? 'Welcome back' : 'Create an account'}
                                </h1>
                                <p className="text-slate-400 text-sm font-medium">
                                    {mode === 'login' ? "Sign in to continue to your dashboard." : "Join our community of builders today."}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AnimatePresence mode='wait'>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-xl text-xs font-bold"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Email Input */}
                                    <div className="bg-slate-50 border-2 border-slate-50 rounded-xl p-4 flex flex-col gap-1 focus-within:bg-white focus-within:border-[#0066CC] focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300 group">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#0066CC]">Email</span>
                                            <Mail size={12} className="text-slate-300 group-focus-within:text-[#0066CC] transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-200 w-full"
                                            required
                                        />
                                    </div>

                                    {/* Password Input */}
                                    <div className="bg-slate-50 border-2 border-slate-50 rounded-xl p-4 flex flex-col gap-1 focus-within:bg-white focus-within:border-[#0066CC] focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300 group relative">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#0066CC]">Password</span>
                                            <Lock size={12} className="text-slate-300 group-focus-within:text-[#0066CC] transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-200 w-full"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-slate-400 hover:text-[#0066CC] transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password (Signup only) */}
                                    {mode === 'signup' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-slate-50 border-2 border-slate-50 rounded-xl p-4 flex flex-col gap-1 focus-within:bg-white focus-within:border-[#0066CC] focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300 group relative"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#0066CC]">Confirm Password</span>
                                                <Lock size={12} className="text-slate-300 group-focus-within:text-[#0066CC] transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-200 w-full"
                                                    required={mode === 'signup'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="text-slate-400 hover:text-[#0066CC] transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-[#0066CC] to-[#0052a3] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Sign in' : 'Create account'}
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]">
                                    <span className="bg-white px-4 text-slate-300 text-center">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => loginWithOAuth('google')}
                                    className="flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all font-black text-[9px] uppercase tracking-widest text-slate-600 active:scale-95 group shadow-sm"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </button>
                                <button
                                    onClick={() => loginWithOAuth('github')}
                                    className="flex items-center justify-center gap-3 py-3.5 bg-slate-900 border border-slate-900 rounded-xl hover:bg-black transition-all font-black text-[9px] uppercase tracking-widest text-white active:scale-95 group shadow-lg shadow-black/5"
                                >
                                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                    GitHub
                                </button>
                            </div>

                            <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {mode === 'login' ? "New here?" : "Already have an account?"}{' '}
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                    className="text-[#0066CC] hover:underline"
                                >
                                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Visual Branding (45%) */}
            <div className="hidden lg:flex lg:w-[45%] h-full bg-[#FAFBFF] items-center justify-center p-0 overflow-hidden relative border-l border-slate-50">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0066CC_1px,transparent_1px)] [background-size:24px_24px]"></div>

                <div className="relative z-10 w-full h-full">
                    <img
                        src="/bauhaus_last_gen.png"
                        alt="Join us"
                        className="w-full h-full object-cover grayscale-[20%] contrast-[1.05]"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=2070&auto=format&fit=crop';
                        }}
                    />
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0066CC]/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
                </div>

                {/* Vertical Text Overlays for Brand Name */}
                <div className="absolute inset-0 p-12 flex flex-col justify-end pointer-events-none z-20">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Capable</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase leading-[0.85]" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Build your <br />next big idea
                        </h3>
                        <p className="text-white/70 text-xs font-semibold max-w-xs leading-relaxed drop-shadow-sm uppercase tracking-wider">
                            Create and track your projects with ease.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
