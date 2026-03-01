import React, { useEffect, useState, useRef } from 'react';
import {
    ChevronDown,
    Share2,
    LogOut,
    Settings,
    LayoutDashboard,
    Home,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PricingModal from './PricingModal';
import logoIconSrc from '../assets/LOGO ICON.svg';

const ProjectHeader = ({ activeTab, onTabChange, hasPlan, projectTitle, isTitleLoading }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [isPricingOpen, setIsPricingOpen] = useState(false);

    const menuRef = useRef(null);
    const userMenuRef = useRef(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const triggerComingSoon = () => {
        setShowComingSoon(true);
        setTimeout(() => setShowComingSoon(false), 2000);
    };

    const tabs = [
        { id: 'context', label: 'Context' },
        { id: 'strategy', label: 'Strategy' },
        { id: 'plan', label: 'Plan', disabled: !hasPlan },
    ];

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Logo and Project Title */}
            <div className="flex items-center gap-4">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 shadow-sm group"
                    >
                        <img src={logoIconSrc} alt="Logo" className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ filter: "brightness(0)" }} />
                        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, x: -10 }}
                                animate={{ opacity: 1, y: 6, x: -5 }}
                                exit={{ opacity: 0, y: 10, x: -10 }}
                                className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50"
                            >
                                <Link
                                    to="/"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Home size={16} />
                                    Home
                                </Link>
                                <Link
                                    to="/dashboard#projects"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-t border-slate-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Project</span>
                    {isTitleLoading ? (
                        <div className="h-4 w-24 md:w-32 bg-slate-100 rounded animate-pulse" />
                    ) : (
                        <h2 className="text-sm font-normal text-slate-900 truncate max-w-[150px] md:max-w-[300px]">
                            {projectTitle || 'New Venture'}
                        </h2>
                    )}
                </div>
            </div>

            {/* Navigation Steps */}
            <nav className="hidden lg:flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isDisabled = tab.disabled;

                    return (
                        <button
                            key={tab.id}
                            disabled={isDisabled}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex items-center justify-center px-6 py-2 rounded-lg text-sm font-bold transition-all
                                ${isActive
                                    ? 'bg-white text-[var(--brand-accent)] shadow-sm'
                                    : isDisabled
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                            `}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            {/* Actions & User */}
            <div className="flex items-center gap-3 md:gap-4">
                <button
                    onClick={() => setIsPricingOpen(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-[var(--brand-accent)] text-white rounded-lg text-xs font-bold hover:bg-[var(--brand-accent-hover)] transition-all shadow-md shadow-blue-100"
                >
                    Upgrade
                </button>

                <div className="relative">
                    <button
                        onClick={triggerComingSoon}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                    >
                        <Share2 size={14} />
                        Invite & earn
                    </button>

                    <AnimatePresence>
                        {showComingSoon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50"
                            >
                                Coming Soon
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-10 h-10 bg-rose-500 text-white flex items-center justify-center text-sm font-bold rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 hover:ring-[var(--brand-accent)]/30 transition-all overflow-hidden group"
                    >
                        {user?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                            <img
                                src={user?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                                alt="Profile"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        ) : user?.profile?.name || user?.user_metadata?.name ? (
                            <span className="font-bold text-xs uppercase tracking-tighter">
                                {(user?.profile?.name || user?.user_metadata?.name).split(' ').map(n => n[0]).join('')}
                            </span>
                        ) : (
                            user?.email?.charAt(0).toUpperCase() || 'H'
                        )}
                    </button>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 6, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-3 z-50"
                            >
                                <div className="px-4 pb-3 mb-2 border-b border-slate-50">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {user?.profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Venture Founder'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'No email'}</p>
                                </div>

                                <Link
                                    to="/dashboard#settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    <Settings size={14} />
                                    Settings
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
        </header>
    );
};

export default ProjectHeader;
