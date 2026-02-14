import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Settings,
    BarChart3,
    PlusCircle,
    LogOut,
    Folder,
    Sparkles,
    User,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        const handler = (e) => setIsModalOpen(e.detail.isOpen);
        window.addEventListener('modal-state-changed', handler);
        return () => window.removeEventListener('modal-state-changed', handler);
    }, []);

    const links = [
        { path: '/dashboard#projects', label: 'Projects', icon: Folder },
        { path: '/dashboard#metrics', label: 'Metrics', icon: BarChart3 },
        { path: '/dashboard#settings', label: 'Settings', icon: Settings },
    ];

    const currentHash = location.hash.replace('#', '') || 'projects';

    return (
        <aside className={`
            w-64 h-screen fixed left-0 top-0 flex flex-col z-50 bg-[#0066CC]/100 backdrop-blur-md border-r border-white/10
            transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isModalOpen ? 'blur-[2px] opacity-80 pointer-events-none' : ''}
        `}>
            {/* Header / Logo */}
            <div className="p-8 pb-6 flex items-center justify-between">
                <Link to="/" className="flex items-center group">
                    <Logo showText={true} forceLight={true} />
                </Link>
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-white/60 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 pt-4">
                <p className="px-4 mb-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Navigation Stage</p>
                {links.map((item) => {
                    const hash = item.path.split('#')[1];
                    const isActive = location.pathname === '/dashboard' && currentHash === hash;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                                group flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold transition-all relative uppercase tracking-wider
                                ${isActive
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <item.icon size={16} className={isActive ? 'text-white' : 'text-white/40 group-hover:text-white transition-colors'} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                            )}
                        </Link>
                    );
                })}

                <div className="pt-8 px-4">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#0066CC] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20"
                    >
                        <PlusCircle size={14} />
                        New Venture
                    </Link>
                </div>
            </nav>

            {/* Pro Upgrade Section */}
            <div className="px-6 mb-6">
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1.5">Go Unlimited</p>
                    <p className="text-[9px] text-white/60 font-bold mb-4 leading-relaxed">Unlock advanced market analysis and AI depth.</p>
                    <button className="w-full py-2 bg-white text-[#0066CC] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/10">
                        Upgrade to Pro
                    </button>
                </div>
            </div>

            {/* Footer User Info & Sign Out */}
            <div className="p-6 space-y-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-white/40" size={18} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">
                            {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Founder'}
                        </p>
                        <p className="text-[9px] font-bold text-white/60 truncate uppercase tracking-widest">
                            Starter Plan
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
