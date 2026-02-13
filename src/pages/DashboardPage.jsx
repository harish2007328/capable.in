import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Search,
    LayoutDashboard,
    BarChart2,
    Settings as SettingsIcon,
    Zap,
    Clock,
    CheckCircle,
    TrendingUp,
    Calendar,
    User,
    Shield,
    LogOut,
    Trash2,
    Folder
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { ProjectStorage } from '../services/projectStorage';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, updateUser } = useAuth();

    const [activeSection, setActiveSection] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Settings state
    const [settingsState, setSettingsState] = useState({
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        title: user?.user_metadata?.title || '',
        bio: user?.user_metadata?.bio || '',
        website: user?.user_metadata?.website || '',
        twitter: user?.user_metadata?.twitter || '',
        isSaving: false
    });

    useEffect(() => {
        const load = async () => {
            await ProjectStorage.init();
            const allProjects = await ProjectStorage.getAll();
            setProjects(allProjects);
        };
        load();

        if (user) {
            setSettingsState({
                name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
                title: user?.user_metadata?.title || '',
                bio: user?.user_metadata?.bio || '',
                website: user?.user_metadata?.website || '',
                twitter: user?.user_metadata?.twitter || '',
                isSaving: false
            });
        }

        // Handle hash-based navigation
        const hash = location.hash.replace('#', '');
        if (['projects', 'metrics', 'settings'].includes(hash)) {
            setActiveSection(hash);
        }
    }, [location.hash, user]);

    const handleSaveSettings = async () => {
        setSettingsState(s => ({ ...s, isSaving: true }));
        try {
            await updateUser({
                data: {
                    full_name: settingsState.name,
                    title: settingsState.title,
                    bio: settingsState.bio,
                    website: settingsState.website,
                    twitter: settingsState.twitter
                }
            });
            alert('Settings saved to database!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Error saving settings. Please try again.');
        } finally {
            setSettingsState(s => ({ ...s, isSaving: false }));
        }
    };

    const handleClearData = async () => {
        if (confirm('Are you sure? This will delete all projects from the SERVER and this browser PERMANENTLY.')) {
            await ProjectStorage.clearAll();
            window.location.reload();
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.data?.idea || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProjectClick = (id) => {
        ProjectStorage.setActiveId(id);
        navigate(`/project/${id}`);
    };

    const sections = [
        { id: 'projects', label: 'Projects', icon: Folder },
        { id: 'metrics', label: 'Metrics', icon: BarChart2 },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    const handleDeleteProject = async (e, id) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project? All progress and chat history will be lost.')) {
            await ProjectStorage.delete(id);
            const allProjects = await ProjectStorage.getAll();
            setProjects(allProjects);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20 pt-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">



                {/* Section Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeSection === 'projects' && (
                        <div>
                            {/* Search Bar */}
                            <div className="relative w-full max-w-md mb-10">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] bg-white/80 shadow-sm backdrop-blur-sm transition-all"
                                />
                            </div>

                            {/* Projects Grid Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Your Ventures</h2>
                                    <p className="text-sm text-slate-500 font-medium">Manage and track your active execution plans.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <Plus size={18} />
                                        New Project
                                    </button>
                                </div>
                            </div>

                            {/* Projects Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <GlassCard
                                        key={project.id}
                                        intensity="medium"
                                        hover={true}
                                        onClick={() => handleProjectClick(project.id)}
                                        className="p-8 min-h-[240px] flex flex-col relative overflow-hidden group cursor-pointer border border-white/40"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]" />

                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0066CC] transition-colors line-clamp-1 flex-1 pr-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                {project.title}
                                            </h3>
                                            <button
                                                onClick={(e) => handleDeleteProject(e, project.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-8 line-clamp-3 font-medium leading-relaxed">
                                            {project.data?.projectDescription || project.data?.idea || "No description provided."}
                                        </p>
                                        <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100/60">
                                            <span className="text-xs font-semibold text-slate-400 tracking-wider">
                                                {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="text-sm font-bold text-[#0066CC] flex items-center gap-2 group-hover:gap-3 transition-all">
                                                Launch <Plus size={16} />
                                            </span>
                                        </div>
                                    </GlassCard>
                                ))}

                                {filteredProjects.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white/40 rounded-2xl border-2 border-dashed border-gray-200">
                                        <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900">No projects yet</h3>
                                        <p className="text-gray-500 mb-6">Start by creating a new venture from the home page.</p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="px-6 py-2 bg-[#0066CC] text-white rounded-xl font-bold hover:bg-[#0055AA] transition-colors"
                                        >
                                            New Venture
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'metrics' && <MetricsView />}
                    {activeSection === 'settings' && (
                        <SettingsView
                            user={user}
                            logout={logout}
                            navigate={navigate}
                            state={settingsState}
                            setState={setSettingsState}
                            onSave={handleSaveSettings}
                            onClear={handleClearData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- Sub-Components --- */

const MetricsView = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Zap} label="Research Velocity" value="8.4/10" color="text-amber-500" bgColor="bg-amber-50" />
            <StatCard icon={Clock} label="Wait Time" value="1.2s" color="text-blue-500" bgColor="bg-blue-50" />
            <StatCard icon={CheckCircle} label="Success Rate" value="94%" color="text-emerald-500" bgColor="bg-emerald-50" />
            <StatCard icon={TrendingUp} label="Market Fit" value="Strong" color="text-violet-500" bgColor="bg-violet-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-gray-200 p-8 rounded-[2rem] shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Technical Performance</h3>
                        <p className="text-sm text-gray-500">Real-time analysis of your venture's digital footprint.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase">Optimal</span>
                    </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                            <div
                                className="w-full max-w-[40px] bg-gradient-to-t from-blue-100 to-blue-200 rounded-t-xl transition-all group-hover:from-[#0066CC] group-hover:to-[#0BAAFF] cursor-help relative"
                                style={{ height: `${[40, 60, 30, 80, 50, 20, 10][i]}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {Math.floor(Math.random() * 100)} units
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-widest">{day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-gray-200 p-8 rounded-[2rem] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Venture Health</h3>
                <div className="space-y-4">
                    {['Market Research', 'Technical Feasibility', 'Business Model', 'Growth Strategy'].map((item, i) => (
                        <div key={item} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>{item}</span>
                                <span className="text-[#0066CC]">{[85, 70, 92, 45][i]}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${[85, 70, 92, 45][i]}%` }}
                                    className="h-full bg-gradient-to-r from-[#0066CC] to-[#0BAAFF]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic mt-4">
                    Data updated 5 minutes ago based on current project interactions.
                </p>
            </div>
        </div>
    </div>
);

const SettingsView = ({ user, logout, navigate, state, setState, onSave, onClear }) => (
    <div className="max-w-4xl space-y-8 pb-32">
        <section className="bg-white/70 backdrop-blur-md border border-gray-200 p-8 rounded-[2rem] shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>Profile Settings</h2>
            <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
                <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center text-3xl font-bold rounded-[2rem] border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform overflow-hidden">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : user?.user_metadata?.name ? (
                            <span className="font-bold text-2xl uppercase tracking-tighter">
                                {user.user_metadata.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        ) : (
                            user?.email?.charAt(0).toUpperCase() || 'H'
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Venture Founder'}
                    </h3>
                    <p className="text-slate-500 font-medium">{user?.email}</p>
                    <div className="flex gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-blue-50 text-[#0066CC] text-[10px] font-bold rounded-full border border-blue-100">Founder Account</span>
                        <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full border border-slate-100">Starter Plan</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                        type="text"
                        value={state.name}
                        onChange={(e) => setState({ ...state, name: e.target.value })}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-5 py-3 bg-white/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Professional Title</label>
                    <input
                        type="text"
                        value={state.title}
                        onChange={(e) => setState({ ...state, title: e.target.value })}
                        placeholder="e.g. Full Stack Founder"
                        className="w-full px-5 py-3 bg-white/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all font-medium"
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Professional Bio</label>
                    <textarea
                        rows={3}
                        value={state.bio}
                        onChange={(e) => setState({ ...state, bio: e.target.value })}
                        placeholder="Tell us about your venture journey..."
                        className="w-full px-5 py-3 bg-white/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all font-medium resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Website</label>
                    <input
                        type="url"
                        value={state.website}
                        onChange={(e) => setState({ ...state, website: e.target.value })}
                        placeholder="https://yourventure.com"
                        className="w-full px-5 py-3 bg-white/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Twitter / X</label>
                    <input
                        type="text"
                        value={state.twitter}
                        onChange={(e) => setState({ ...state, twitter: e.target.value })}
                        placeholder="@username"
                        className="w-full px-5 py-3 bg-white/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0066CC] transition-all font-medium"
                    />
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={state.isSaving}
                    className="px-8 py-3 bg-[#0066CC] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-[#0052a3] transition-all disabled:opacity-50"
                >
                    {state.isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </section>

        <section className="bg-white/70 backdrop-blur-md border border-gray-200 p-8 rounded-[2rem] shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security & Preferences</h2>
            <div className="grid gap-4">
                <button className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-[#0066CC] transition-colors">
                            <Shield size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full uppercase">Off</div>
                </button>

                <button
                    onClick={onClear}
                    className="flex items-center justify-between p-5 bg-red-50/30 rounded-2xl border border-red-50 hover:bg-red-50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-red-300 group-hover:text-red-500 transition-colors">
                            <Trash2 size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-red-900">Clear All Data (Server + Local)</p>
                            <p className="text-xs text-red-500">Permanently delete everything from server and browser</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-slate-900 transition-colors">
                            <LogOut size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900">Sign Out</p>
                            <p className="text-xs text-slate-500">Terminate your current session</p>
                        </div>
                    </div>
                </button>
            </div>
        </section>
    </div>
);

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white/70 backdrop-blur-md border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
            <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default DashboardPage;
