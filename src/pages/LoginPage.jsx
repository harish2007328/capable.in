import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ChevronLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import FullScreenLoader from '../components/FullScreenLoader';
import ParticleBackground from '../components/ParticleBackground';

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

    const [verificationMode, setVerificationMode] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                navigate(from, { replace: true });
            } else if (verificationMode) {
                await verifyEmail(email, verificationCode);
                navigate(from, { replace: true });
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
                                <Logo showText={false} className="scale-[1.6]" />
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
                            <div className="w-full grid grid-cols-2 gap-2.5 mb-5">
                                <button
                                    onClick={() => handleOAuth('google')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-600 text-[10px] shadow-sm active:scale-95"
                                >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M23.7449 12.27C23.7449 11.48 23.6849 10.73 23.5549 10H12.2549V14.51H18.7249C18.4349 15.99 17.5849 17.24 16.3249 18.09V21.09H20.1849C22.4449 19.01 23.7449 15.92 23.7449 12.27Z" />
                                        <path fill="#34A853" d="M12.2549 24C15.4949 24 18.2049 22.92 20.1849 21.09L16.3249 18.09C15.2449 18.81 13.8749 19.25 12.2549 19.25C9.12492 19.25 6.47492 17.14 5.52492 14.29H1.54492V17.38C3.51492 21.3 7.56492 24 12.2549 24Z" />
                                        <path fill="#FBBC05" d="M5.52492 14.29C5.27492 13.57 5.14492 12.8 5.14492 12C5.14492 11.2 5.28492 10.43 5.52492 9.71V6.62H1.54492C0.724922 8.24 0.254918 10.06 0.254918 12C0.254918 13.94 0.724922 15.76 1.54492 17.38L5.52492 14.29Z" />
                                        <path fill="#EA4335" d="M12.2549 4.75C14.0249 4.75 15.6049 5.36 16.8549 6.55L20.2749 3.13C18.2049 1.19 15.4949 0 12.2549 0C7.56492 0 3.51492 2.7 1.54492 6.62L5.52492 9.71C6.47492 6.86 9.12492 4.75 12.2549 4.75Z" />
                                    </svg>
                                    Google
                                </button>
                                <button
                                    onClick={() => handleOAuth('apple')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-600 text-[10px] shadow-sm active:scale-95"
                                >
                                    <svg className="w-4 h-4 shrink-0 fill-black" viewBox="0 0 384 512">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                    </svg>
                                    Apple
                                </button>
                                <button
                                    onClick={() => handleOAuth('facebook')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-600 text-[10px] shadow-sm active:scale-95"
                                >
                                    <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>
                                <button
                                    onClick={() => handleOAuth('discord')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-600 text-[10px] shadow-sm active:scale-95"
                                >
                                    <svg className="w-4 h-4 shrink-0 fill-[#5865F2]" viewBox="0 0 640 512">
                                        <path d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91 337.461 337.461 0 0 0-14.9 30.6 447.848 447.848 0 0 0-134.426 0 309.541 309.541 0 0 0-15.135-30.6 1.89 1.89 0 0 0-1.924-.91 483.689 483.689 0 0 0-119.688 37.107 1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375 487.666 487.666 0 0 0 146.825 74.538 1.9 1.9 0 0 0 2.063-.676A348.2 348.2 0 0 0 208.12 430.4a1.86 1.86 0 0 0-1.019-2.588 321.173 321.173 0 0 1-45.868-21.853 1.885 1.885 0 0 1-.185-3.126c3.082-2.309 6.166-4.711 9.109-7.137a1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233c2.944 2.426 6.027 4.851 9.132 7.16a1.884 1.884 0 0 1-.162 3.126 301.407 301.407 0 0 1-45.89 21.83 1.875 1.875 0 0 0-1 2.611 391.055 391.055 0 0 0 30.014 49.177 1.862 1.862 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352c12.264-126.783-20.532-236.912-86.934-334.541zM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.241 52.844-59.241c29.665 0 53.306 26.82 52.843 59.239 0 32.654-23.41 59.241-52.843 59.241zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.241 52.843-59.241c29.667 0 53.307 26.82 52.844 59.239 0 32.654-23.177 59.241-52.844 59.241z" />
                                    </svg>
                                    Discord
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
