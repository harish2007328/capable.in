import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Trash2 } from 'lucide-react';

const SettingsPage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <p className="text-slate-500">Please login to view settings.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-slate-800 transition-all"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 w-full pb-32 relative">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0BAAFF]/15 rounded-full blur-[180px] translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>

            <h1 className="text-3xl font-sans font-medium text-slate-900 mb-8 relative z-10">Settings</h1>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-white/70 backdrop-blur-md border border-blue-100 p-8 rounded-2xl shadow-lg relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-display font-bold text-brand-black">User Profile</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8 pb-8 border-b border-slate-50">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 flex items-center justify-center text-2xl font-sans font-bold rounded-full border border-slate-100">
                            {user.name && user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display font-bold text-brand-black capitalize">{user.name}</h3>
                            <div className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                                {user.role}
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6 max-w-md">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Display Name</label>
                            <input
                                type="text"
                                defaultValue={user.name}
                                onChange={(e) => updateUser({ name: e.target.value })}
                                className="input-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Role</label>
                            <div className="relative">
                                <select
                                    defaultValue={user.role}
                                    onChange={(e) => updateUser({ role: e.target.value })}
                                    className="input-primary appearance-none"
                                >
                                    <option value="Founder">Founder</option>
                                    <option value="Visionary">Visionary</option>
                                    <option value="Builder">Builder</option>
                                    <option value="Strategist">Strategist</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Data Section */}
                <section className="bg-white/70 backdrop-blur-md border border-blue-100 p-8 rounded-2xl shadow-lg relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <h2 className="text-lg font-display font-bold text-brand-black">Data & Session</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between group">
                            <div>
                                <h4 className="text-slate-900 font-medium text-sm">Clear Local Data</h4>
                                <p className="text-slate-400 text-xs">Remove all local projects.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure? This will delete all your local projects.')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                title="Purge Data"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between group">
                            <div>
                                <h4 className="text-slate-900 font-medium text-sm">Sign Out</h4>
                                <p className="text-slate-400 text-xs">End current session.</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
