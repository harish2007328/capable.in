import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Trash2, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // Supabase stores user metadata in user_metadata
    const [name, setName] = useState(user?.user_metadata?.name || '');
    const [role, setRole] = useState(user?.user_metadata?.role || 'Founder');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('');
        try {
            await updateUser({
                data: { name, role }
            });
            setSaveStatus('Profile updated successfully.');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Update failed:', error);
            setSaveStatus('Update failed. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <p className="text-slate-500 font-medium">Authentication required to access settings.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-[#0066CC] transition-all shadow-xl shadow-blue-100"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 w-full pb-32 relative">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/10 rounded-full blur-[200px] translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>

            <header className="mb-12 relative z-10">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your profile and decentralized session.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Profile Section */}
                <section className="lg:col-span-2 space-y-8 relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl border border-blue-50 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-blue-50 text-[#0066CC] rounded-2xl flex items-center justify-center shadow-sm shadow-blue-100">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Identity Management</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-10 mb-12 pb-10 border-b border-slate-50">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 flex items-center justify-center text-3xl font-bold rounded-[2rem] border border-white shadow-inner">
                                {name ? name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-3 text-center md:text-left">
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{name || 'Venture Founder'}</h3>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 text-[#0066CC] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        {role}
                                    </div>
                                    <div className="text-slate-300 text-xs font-bold uppercase tracking-widest">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0066CC] px-1 opacity-60">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0066CC] px-1 opacity-60">Professional Role</label>
                                    <div className="relative">
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Founder">Founder</option>
                                            <option value="Visionary">Visionary</option>
                                            <option value="Builder">Builder</option>
                                            <option value="Strategist">Strategist</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <p className="text-xs font-bold text-slate-400">
                                    {saveStatus && <span className={saveStatus.includes('failed') ? 'text-red-500' : 'text-emerald-500'}>{saveStatus}</span>}
                                </p>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-widest flex items-center gap-3 hover:bg-[#0066CC] hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Sidebar Section */}
                <aside className="space-y-6 relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl border border-blue-50 p-8 rounded-[2rem] shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shadow-sm">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Security</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[#0066CC] font-black text-[10px] uppercase tracking-widest">Local Cache</h4>
                                    <Trash2 size={16} className="text-slate-300 group-hover:text-red-500 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (confirm('Erase all local venture data? This action is irreversible.')) {
                                                localStorage.clear();
                                                window.location.reload();
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Purge all offline project data from your local browser storage.
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all font-bold group"
                            >
                                <span className="text-sm">Sign Out Session</span>
                                <LogOut size={18} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#073B99] to-[#0066CC] text-white shadow-xl shadow-blue-500/10">
                        <h4 className="text-xl font-bold mb-3 tracking-tight">Need help?</h4>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-6 font-medium">
                            Our strategic mentors are available to help you with your account or venture scaling.
                        </p>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                            Contact Support
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

// Add missing icon
const ChevronDown = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
    </svg>
);

export default SettingsPage;
