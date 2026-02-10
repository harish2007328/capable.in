import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
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

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:px-8"
        >
            <div className={`max-w-5xl mx-auto px-6 py-3 flex items-center justify-between bg-white/60 backdrop-blur-md border border-[#BBDDFF]/50 rounded-lg shadow-sm transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <Logo color="dark" showText={true} />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/features" className="text-sm font-medium text-gray-600 hover:text-[#0066CC] transition-colors font-sans">Features</Link>
                    <Link to="/use-cases" className="text-sm font-medium text-gray-600 hover:text-[#0066CC] transition-colors font-sans">Use Cases</Link>
                    <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-[#0066CC] transition-colors font-sans">Pricing</Link>
                </nav>

                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/dashboard" className="px-8 py-2.5 rounded-md bg-[#0066CC] text-white text-sm font-semibold hover:bg-[#0055AA] transition-colors font-sans">
                        Launch
                    </Link>
                    {user && (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center justify-center w-10 h-10 bg-blue-50 border border-blue-100 rounded-full text-[#0066CC] hover:bg-blue-100 transition-all shadow-sm active:scale-95"
                            >
                                <User size={18} />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="absolute -right-6 top-full mt-4 w-52 bg-white/70 backdrop-blur-md border border-[#BBDDFF]/50 rounded-lg shadow-xl overflow-hidden p-1 font-sans transform origin-top-right z-50"
                                    >
                                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Settings size={16} /> Settings
                                        </Link>
                                        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-brand-black">
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
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full text-brand-black">
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6 text-center">
                            <Link to="/features" className="text-2xl font-bold text-brand-black font-display">Features</Link>
                            <Link to="/use-cases" className="text-2xl font-bold text-brand-black font-display">Use Cases</Link>
                            <Link to="/pricing" className="text-2xl font-bold text-brand-black font-display">Pricing</Link>
                        </nav>

                        <div className="mt-auto flex flex-col gap-4">
                            <Link to="/dashboard" className="w-full py-4 rounded-full bg-brand-black text-white text-center font-medium">Launch</Link>
                            <Link to="/login" className="w-full py-4 rounded-full border border-gray-200 text-center font-medium text-brand-black">Log In</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
