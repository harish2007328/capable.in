import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    BarChart3,
    PlusCircle,
    LogOut,
    Box,
    Folder
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoSrc from '../assets/logo.svg';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const links = [
        { path: '/dashboard#projects', label: 'Projects', icon: Folder },
        { path: '/dashboard#metrics', label: 'Metrics', icon: BarChart3 },
        { path: '/dashboard#settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col z-40">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logoSrc} alt="Capable" className="w-8 h-8 rounded-lg" />
                    <span className="font-bold text-slate-900 text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>capable</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
                {links.map((link) => {
                    const hash = link.path.split('#')[1];
                    const currentHash = location.hash.replace('#', '') || 'projects';
                    const isActive = location.pathname === '/dashboard' && currentHash === hash;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-blue-50 text-[#0066CC]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}

                <div className="h-px bg-slate-100 my-4 mx-2" />

                <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#0066CC] hover:bg-blue-50 transition-all"
                >
                    <PlusCircle size={18} />
                    New Venture
                </Link>
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
