import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Layers, 
    CreditCard, 
    ArrowUpRight, 
    Search, 
    Settings, 
    LayoutDashboard,
    LogOut,
    CheckCircle2,
    XCircle,
    MoreVertical,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0, proUsers: 0 });
    const [usersList, setUsersList] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Basic permission check
    const isAdmin = user?.email === 'harish2007328@gmail.com';

    useEffect(() => {
        if (!isAdmin) return;
        fetchData();
    }, [isAdmin]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('insforge_session_token') || localStorage.getItem('sb-access-token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [usersRes, projectsRes] = await Promise.all([
                axios.get('/api/admin/users', config),
                axios.get('/api/admin/projects', config)
            ]);
            
            setUsersList(usersRes.data || []);
            setProjectsList(projectsRes.data || []);
            
            // Calculate stats
            const pro = usersRes.data.filter(u => u.subscription_status === 'pro').length;
            setStats({
                totalUsers: usersRes.data.length,
                totalProjects: projectsRes.data.length,
                proUsers: pro
            });
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    const filteredUsers = usersList.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProjects = projectsList.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#08090b] text-white flex overflow-hidden font-outfit">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-white/[0.02] flex flex-col p-6 glass-effect">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Capable</h1>
                        <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Admin Hub</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem 
                        icon={<LayoutDashboard />} 
                        label="Overview" 
                        active={activeTab === 'overview'} 
                        onClick={() => setActiveTab('overview')} 
                    />
                    <SidebarItem 
                        icon={<Users />} 
                        label="User Base" 
                        active={activeTab === 'users'} 
                        onClick={() => setActiveTab('users')} 
                    />
                    <SidebarItem 
                        icon={<Layers />} 
                        label="Active Ventures" 
                        active={activeTab === 'projects'} 
                        onClick={() => setActiveTab('projects')} 
                    />
                    <SidebarItem 
                        icon={<CreditCard />} 
                        label="Revenue Control" 
                        active={activeTab === 'revenue'} 
                        onClick={() => setActiveTab('revenue')} 
                    />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                    <SidebarItem icon={<Settings />} label="App Settings" active={false} />
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white/40 hover:text-red-400 hover:bg-red-400/5 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#08090b]/80 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-white/40 capitalize">{activeTab}</span>
                        <span className="text-white/10">/</span>
                        <span className="text-white">Live Data Feed</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search everything..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-light placeholder:text-white/20"
                            />
                        </div>
                        <div className="flex items-center gap-3 pr-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold ring-2 ring-white/10 shadow-lg">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-12 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Stat Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard 
                                        icon={<Users className="text-blue-400" />} 
                                        label="Total Users" 
                                        value={stats.totalUsers} 
                                        trend="+12%"
                                        description="24 new this week"
                                    />
                                    <StatCard 
                                        icon={<Layers className="text-purple-400" />} 
                                        label="Active Ventures" 
                                        value={stats.totalProjects} 
                                        trend="+5%"
                                        description="Market validation phase"
                                    />
                                    <StatCard 
                                        icon={<CreditCard className="text-pink-400" />} 
                                        label="Revenue Flow" 
                                        value={`$${(stats.proUsers * 29).toLocaleString()}`} 
                                        trend="+18%"
                                        description="Across all paid tiers"
                                    />
                                </div>

                                {/* Main Visuals */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 glass-effect rounded-3xl border border-white/5 p-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-purple-500/10" />
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div>
                                                <h3 className="text-lg font-semibold">User Conversion</h3>
                                                <p className="text-sm text-white/40">Registered vs Pro subscriptions</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                    <span className="text-white/40">Pro</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ml-4">
                                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                                    <span className="text-white/40">Free</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="h-64 flex items-end gap-2 relative z-10">
                                            {/* Dummy chart bars */}
                                            {[30, 45, 25, 60, 40, 80, 55, 70, 45, 90, 60, 75].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center group/bar">
                                                    <div className="w-full relative">
                                                        <div 
                                                            className="bg-white/5 w-full rounded-t-lg transition-all duration-1000 origin-bottom hover:bg-white/10" 
                                                            style={{ height: `${h}%` }}
                                                        />
                                                        <div 
                                                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-purple-500/50 to-purple-400 group-hover/bar:from-purple-400 group-hover/bar:to-pink-400 rounded-t-lg transition-all duration-1000" 
                                                            style={{ height: `${h * 0.3}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-effect rounded-3xl border border-white/5 p-8">
                                        <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
                                        <div className="space-y-6">
                                            {usersList.slice(0, 5).map((u, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5">
                                                        {u.email?.[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{u.email}</p>
                                                        <p className="text-[10px] text-white/40 uppercase tracking-wider">New Sign Up</p>
                                                    </div>
                                                    <div className="text-[10px] text-white/20 font-bold">
                                                        2m ago
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-10 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-colors">
                                            View Audit Log
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div 
                                key="users"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-effect rounded-3xl border border-white/5 overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">User Base</h3>
                                        <p className="text-sm text-white/40">Manage and audit system users</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all">
                                            Add New User
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white/[0.02] text-left text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 border-b border-white/5">
                                                <th className="px-8 py-4 font-bold">User</th>
                                                <th className="px-8 py-4 font-bold">Subscription</th>
                                                <th className="px-8 py-4 font-bold">Cap ID</th>
                                                <th className="px-8 py-4 font-bold">Last Active</th>
                                                <th className="px-8 py-4 text-right pr-12 font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredUsers.map((u, i) => (
                                                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-[10px] font-bold">
                                                                {u.email?.[0].toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium">{u.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                            u.subscription_status === 'pro' 
                                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                                                                : 'bg-white/5 text-white/40'
                                                        }`}>
                                                            {u.subscription_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-xs text-white/30 font-mono tracking-tighter">
                                                        {u.id.substring(0, 13)}...
                                                    </td>
                                                    <td className="px-8 py-5 text-sm text-white/50">
                                                        {new Date(u.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-5 text-right pr-12">
                                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                        
                        {activeTab === 'projects' && (
                            <motion.div 
                                key="projects"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-effect rounded-3xl border border-white/5 overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5">
                                    <h3 className="text-xl font-bold">Active Ventures</h3>
                                    <p className="text-sm text-white/40">Tracking all market-ready ideas in the system</p>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProjects.map((p, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
                                            </div>
                                            <h4 className="font-bold mb-1 line-clamp-1">{p.title}</h4>
                                            <p className="text-sm text-white/40 mb-6 font-light line-clamp-2">
                                                {p.data?.description || 'No description provided.'}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">User: {p.user_id.substring(0, 8)}</span>
                                                <span className="text-[10px] text-purple-400 font-bold tracking-widest">ACTIVE</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <style>{`
                .glass-effect {
                    background: rgba(255, 255, 255, 0.01);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            active 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
        }`}
    >
        {React.cloneElement(icon, { size: 18, strokeWidth: active ? 2.5 : 2 })}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const StatCard = ({ icon, label, value, trend, description }) => (
    <div className="glass-effect p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                {trend}
            </div>
        </div>
        <div className="relative z-10">
            <h4 className="text-white/40 text-sm font-medium mb-1">{label}</h4>
            <div className="text-3xl font-bold tracking-tight mb-2">{value}</div>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.1em] font-bold">{description}</p>
        </div>
    </div>
);

export default AdminDashboard;
