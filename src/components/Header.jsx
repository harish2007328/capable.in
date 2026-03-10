import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Settings, LogOut, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';
import Logo from './Logo';

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [loadingPortal, setLoadingPortal] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [location]);


    // Reusable Gradient Button Style
    const btnClassName = "bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white px-8 py-2.5 rounded-md font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center whitespace-nowrap";

    const handlePortal = async () => {
        setLoadingPortal(true);
        try {
            // In a real app, you'd store the dodo_customer_id in user profile
            const customerId = user?.profile?.dodo_customer_id || user?.user_metadata?.dodo_customer_id;

            if (!customerId) {
                // If no customer ID, redirect to pricing as they might not have a subscription
                window.location.href = '/pricing';
                return;
            }

            const response = await axios.post('/api/portal', { customerId });
            if (response.data.portal_url) {
                window.location.href = response.data.portal_url;
            }
        } catch (err) {
            console.error("Portal redirect failed:", err);
            alert("Could not open billing portal. Please try again.");
        } finally {
            setLoadingPortal(false);
        }
    };

    const isHomePage = location.pathname === '/';
    const showShrink = isHomePage && scrolled;

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 ${showShrink ? 'pt-4 px-4 md:px-8' : 'pt-0 px-0'}`}
        >
            <div className={`relative mx-auto flex items-center justify-between border-b transition-all duration-500 ${showShrink ? 'max-w-5xl px-6 py-4 bg-white/70 backdrop-blur-md border-white/20 rounded-lg shadow-md border-slate-200/50' : `max-w-full w-full px-8 py-5 ${isHomePage ? 'bg-transparent border-transparent' : 'bg-white/80 backdrop-blur-md border-slate-100'} rounded-none`}`}>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <Logo color="dark" showText={true} />
                </Link>

                {/* Desktop Nav - Absolutely Centered */}
                <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link to="/features" className="text-sm font-semibold text-gray-800 hover:text-[var(--brand-accent)] transition-colors font-sans lowercase">Features</Link>
                    <Link to="/pricing" className="text-sm font-semibold text-gray-800 hover:text-[var(--brand-accent)] transition-colors font-sans lowercase">Pricing</Link>
                    <Link to="/docs" className="text-sm font-semibold text-gray-800 hover:text-[var(--brand-accent)] transition-colors font-sans lowercase">Docs</Link>
                </nav>

                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-6 h-[42px]">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[var(--brand-accent)] transition-colors px-2">
                                Sign In
                            </Link>
                            <Link to="/login" state={{ mode: 'signup' }} className={btnClassName}>
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className={btnClassName}>
                                Dashboard
                            </Link>
                            <div className="relative h-full flex items-center" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    aria-label="User profile menu"
                                    className="flex items-center justify-center w-[35px] h-[35px] bg-white border border-slate-100 rounded-full text-slate-900 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] shadow-sm active:scale-95 group overflow-hidden transition-all"
                                >
                                    {user?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                        <img
                                            src={user?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                                            alt="Profile"
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                                        />
                                    ) : user?.profile?.name || user?.user_metadata?.name ? (
                                        <span className="font-bold text-xs uppercase tracking-tighter">
                                            {(user?.profile?.name || user?.user_metadata?.name).split(' ').map(n => n[0]).join('')}
                                        </span>
                                    ) : (
                                        <User size={18} className="transition-transform" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className="absolute -right-6 top-full mt-6 w-64 bg-white/100 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl shadow-blue-500/10 overflow-hidden p-2 z-50 transition-all"
                                            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                                        >
                                            <div className="px-4 py-4 mb-2 border-b border-slate-50 text-left">
                                                <p className="text-sm font-bold text-slate-900 truncate">{user?.profile?.name || user?.user_metadata?.name || 'Venture Founder'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[var(--brand-accent)] rounded-xl transition-all group">
                                                    <Settings size={18} className="text-slate-300 group-hover:text-[var(--brand-accent)] transition-colors" /> Settings
                                                </Link>
                                                <button
                                                    onClick={handlePortal}
                                                    disabled={loadingPortal}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[var(--brand-accent)] rounded-xl transition-all group text-left disabled:opacity-50"
                                                >
                                                    {loadingPortal ? (
                                                        <Loader2 size={18} className="animate-spin text-[var(--brand-accent)]" />
                                                    ) : (
                                                        <CreditCard size={18} className="text-slate-300 group-hover:text-[var(--brand-accent)] transition-colors" />
                                                    )}
                                                    Manage Billing
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group text-left"
                                                >
                                                    <LogOut size={18} className="text-red-200 group-hover:text-red-600 transition-colors" /> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 text-brand-black"
                    aria-label="Open navigation menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white p-6 flex flex-col font-sans"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <Logo color="dark" />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 bg-gray-50 rounded-full text-brand-black"
                                aria-label="Close navigation menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-8 text-center mt-12">
                            <Link to="/" className="text-4xl font-normal text-brand-black font-display lowercase border-b border-gray-100 pb-4">Home</Link>
                            <Link to="/features" className="text-4xl font-normal text-brand-black font-display lowercase border-b border-gray-100 pb-4">Features</Link>
                            <Link to="/pricing" className="text-4xl font-normal text-brand-black font-display lowercase border-b border-gray-100 pb-4">Pricing</Link>
                            <Link to="/docs" className="text-4xl font-normal text-brand-black font-display lowercase">Docs</Link>
                        </nav>

                        <div className="mt-auto flex flex-col gap-4">
                            {user ? (
                                <>
                                    <Link to="/dashboard" className={btnClassName}>Dashboard</Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full py-3.5 rounded-md border border-red-100 text-center font-bold text-sm text-red-400 hover:bg-red-50 transition-all"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" state={{ mode: 'signup' }} className={btnClassName}>Sign Up</Link>
                                    <Link to="/login" className="w-full py-3.5 rounded-md border border-slate-200 text-center font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">Sign In</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header >
    );
};

export default Header;
