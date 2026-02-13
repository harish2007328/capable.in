import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Settings,
    BarChart3,
    PlusCircle,
    LogOut,
    Folder,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const links = [
        { path: '/dashboard#projects', label: 'Projects', icon: Folder },
        { path: '/dashboard#metrics', label: 'Metrics', icon: BarChart3 },
        { path: '/dashboard#settings', label: 'Settings', icon: Settings },
    ];

    const currentHash = location.hash.replace('#', '') || 'projects';

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col z-50 bg-[#0066CC] border-r border-[#0052a3]/30 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0066CC] via-[#0BAAFF] to-[#014da0] opacity-90 pointer-events-none" />

            {/* Header / Logo */}
            <div className="p-8 pb-6 relative z-10">
                <Link to="/" className="flex items-center group">
                    <Logo color="white" showText={true} />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 pt-4 relative z-10">
                <p className="px-4 mb-3 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Menu</p>
                {links.map((item) => {
                    const hash = item.path.split('#')[1];
                    const isActive = location.pathname === '/dashboard' && currentHash === hash;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`
                                group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative
                                ${isActive
                                    ? 'bg-white text-[#0066CC] shadow-xl shadow-blue-900/20'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }
                            `}
                        >
                            <item.icon size={18} className={isActive ? 'text-[#0066CC]' : 'text-white/50 group-hover:text-white'} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#0066CC]"
                                />
                            )}
                        </Link>
                    );
                })}

                <div className="h-px bg-white/10 my-6 mx-4" />

                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                >
                    <PlusCircle size={18} />
                    New Venture
                </Link>
            </nav>

            {/* Footer User Info & Sign Out */}
            <div className="p-6 space-y-4 relative z-10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-white/70" size={18} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                            {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Founder'}
                        </p>
                        <p className="text-[10px] font-medium text-white/50 truncate uppercase tracking-wider">
                            Founder Plan
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
