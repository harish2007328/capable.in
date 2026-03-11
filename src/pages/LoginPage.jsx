import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ChevronLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import FullScreenLoader from '../components/FullScreenLoader';
import ParticleBackground from '../components/ParticleBackground';
import { ProjectStorage } from '../services/projectStorage';

const LoginPage = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, signup, loginWithOAuth, verifyEmail, user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-redirect if already logged in
    React.useEffect(() => {
        let isMounted = true;
        const checkAndRedirect = async () => {
            if (!loading && user) {
                try {
                    await ProjectStorage.init();
                    const projects = await ProjectStorage.getAll();
                    if (!isMounted) return;
                    
                    if (projects && projects.length > 0) {
                        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } catch (err) {
                    if (isMounted) navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
                }
            }
        };
        checkAndRedirect();
        return () => { isMounted = false; };
    }, [user, loading, navigate, location.state]);

    // Handle initial mode from navigation state
    React.useEffect(() => {
        if (location.state?.mode) {
            setMode(location.state.mode);
        }
    }, [location.state]);

    const from = location.state?.from?.pathname || '/dashboard';

    const [verificationMode, setVerificationMode] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleSuccessfulLogin = async () => {
        try {
            await ProjectStorage.init();
            const projects = await ProjectStorage.getAll();
            if (projects && projects.length > 0) {
                navigate(from, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            navigate(from, { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                await handleSuccessfulLogin();
            } else if (verificationMode) {
                await verifyEmail(email, verificationCode);
                await handleSuccessfulLogin();
            } else {
                if (password !== confirmPassword) {
                    setError('Your passwords do not match. Please re-enter them.');
                    setIsLoading(false);
                    return;
                }
                await signup(email, password);
                setVerificationMode(true);
            }
        } catch (err) {
            console.error("Auth error detail:", err);
            let message = 'Something went wrong. Please check your connection.';

            if (err.message) {
                // Map cryptic backend errors to friendly user messages
                if (err.message.includes('Invalid login credentials')) {
                    message = 'The email or password you entered is incorrect.';
                } else if (err.message.includes('User already registered')) {
                    message = 'This email is already in use. Try signing in instead.';
                } else if (err.message.includes('Password should be at least')) {
                    message = 'To keep your account secure, use at least 6 characters.';
                } else if (err.message.includes('rate limit')) {
                    message = 'Too many attempts! Please wait a moment before trying again.';
                } else if (err.message.includes('Email not confirmed')) {
                    message = 'Please check your email to verify your account first.';
                    setVerificationMode(true); // Auto-switch to verification mode
                } else {
                    message = err.message;
                }
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithOAuth(provider);
        } catch (err) {
            setError(err.message || 'OAuth login failed.');
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="w-full h-screen flex overflow-hidden bg-white selection:bg-blue-100 font-sans">
            {/* Left Panel - Auth Form (55%) */}
            <div className="w-full lg:w-[55%] h-full flex flex-col relative bg-white overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] pointer-events-none -z-10 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>

                {/* Top Back Button */}
                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all group"
                    >
                        <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        Home
                    </button>
                </div>

                {/* Main Auth Form Container - Restricted to Viewport */}
                <div className="h-full flex flex-col items-center justify-center px-8 md:px-24">
                    <div className="w-full max-sm flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full flex flex-col items-center"
                        >
                            {/* Logo Mark - Compact */}
                            <div className="mb-5">
                                <Logo showText={false} className="scale-[1.6]" color="dark" />
                            </div>

                            {/* Welcome Text - Compact */}
                            <div className="text-center mb-5">
                                <h1 className="text-3xl font-display font-normal text-slate-900 mb-0.5 tracking-tight leading-tight">
                                    {mode === 'login' ? 'Welcome Back' : 'Join Capable'}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                    {mode === 'login' ? 'Continue with' : 'Create with'}
                                </p>
                            </div>

                            {/* Dynamic Error Alert */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                        className="w-full mb-5 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2.5 p-3.5 bg-red-50/50 border border-red-100 rounded-lg text-[11px] font-bold text-red-500/90 leading-tight">
                                            <AlertCircle size={15} className="shrink-0 text-red-400" />
                                            <div className="flex-1">{error}</div>
                                            <button
                                                onClick={() => setError('')}
                                                className="text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100 ml-2"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* OAuth Section - 2x2 Grid with reduced radius */}
                            <div className="w-full mb-5">
                                <button
                                    onClick={() => handleOAuth('google')}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm active:scale-95 group"
                                >
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M23.7449 12.27C23.7449 11.48 23.6849 10.73 23.5549 10H12.2549V14.51H18.7249C18.4349 15.99 17.5849 17.24 16.3249 18.09V21.09H20.1849C22.4449 19.01 23.7449 15.92 23.7449 12.27Z" />
                                        <path fill="#34A853" d="M12.2549 24C15.4949 24 18.2049 22.92 20.1849 21.09L16.3249 18.09C15.2449 18.81 13.8749 19.25 12.2549 19.25C9.12492 19.25 6.47492 17.14 5.52492 14.29H1.54492V17.38C3.51492 21.3 7.56492 24 12.2549 24Z" />
                                        <path fill="#FBBC05" d="M5.52492 14.29C5.27492 13.57 5.14492 12.8 5.14492 12C5.14492 11.2 5.28492 10.43 5.52492 9.71V6.62H1.54492C0.724922 8.24 0.254918 10.06 0.254918 12C0.254918 13.94 0.724922 15.76 1.54492 17.38L5.52492 14.29Z" />
                                        <path fill="#EA4335" d="M12.2549 4.75C14.0249 4.75 15.6049 5.36 16.8549 6.55L20.2749 3.13C18.2049 1.19 15.4949 0 12.2549 0C7.56492 0 3.51492 2.7 1.54492 6.62L5.52492 9.71C6.47492 6.86 9.12492 4.75 12.2549 4.75Z" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            {/* Divider - Minimal */}
                            <div className="w-full flex items-center gap-3 mb-5">
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">or</span>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>

                            {/* Email/Password Form - High Density */}
                            {!verificationMode ? (
                                <form onSubmit={handleSubmit} className="w-full space-y-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--brand-accent)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Password</label>
                                            {mode === 'login' && (
                                                <button type="button" className="text-[8px] font-black uppercase tracking-widest text-slate-300 hover:text-[var(--brand-accent)] transition-colors">
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full h-10 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--brand-accent)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-xs"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password (Signup only) */}
                                    {mode === 'signup' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full h-10 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--brand-accent)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-xs"
                                                    required={mode === 'signup'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-[var(--brand-accent)] hover:bg-[#0099ff] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98] disabled:opacity-70 mt-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit} className="w-full space-y-4">
                                    <div className="text-center mb-2">
                                        <p className="text-xs text-slate-500">We've sent a 6-digit code to <span className="text-slate-900 font-bold">{email}</span></p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Verification Code</label>
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="0 0 0 0 0 0"
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--brand-accent)] transition-all outline-none font-bold text-slate-900 text-xl text-center tracking-[0.5em]"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-[var(--brand-accent)] hover:bg-[#0099ff] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98] disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Continue'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVerificationMode(false)}
                                        className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors py-2"
                                    >
                                        Back to Register
                                    </button>
                                </form>
                            )}

                            {/* Switch Mode - Separated & Minimal */}
                            {!verificationMode && (
                                <div className="mt-6 text-[11px] font-medium text-slate-400">
                                    {mode === 'login' ? "New here?" : "Already member?"}{' '}
                                    <button
                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                        className="text-slate-900 font-bold hover:underline ml-1"
                                    >
                                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

            </div>

            {/* Right Panel - Visual Branding (50%) */}
            <div className="hidden lg:flex lg:w-[50%] h-full p-4">
                <div className="w-full h-full bg-gradient-to-br from-[#073B99] via-[var(--brand-accent)] to-[#0BAAFF] items-center justify-center overflow-hidden relative rounded-3xl flex">
                    {/* Particle System */}
                    <ParticleBackground />

                    {/* Text Overlay */}
                    <div className="absolute inset-0 p-16 flex flex-col justify-center items-center text-center z-20 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <h3 className="text-5xl font-display font-normal text-white mb-6 tracking-tight">
                                Build Your <span className="font-display italic">Business</span>
                            </h3>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
