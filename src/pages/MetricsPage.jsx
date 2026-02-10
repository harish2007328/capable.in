import React, { useState, useEffect } from 'react';
import { BarChart2, Clock, CheckCircle, Zap, TrendingUp, Calendar } from 'lucide-react';

const MetricsPage = () => {
    // Mock Data (In a real app, this would be aggregated from your projects)
    const [stats, setStats] = useState({
        streak: 12,
        focusHours: 42,
        tasksCompleted: 156,
        avgProductivity: 85 // %
    });

    const [weeklyActivity, setWeeklyActivity] = useState([
        { day: 'Mon', tasks: 4 },
        { day: 'Tue', tasks: 6 },
        { day: 'Wed', tasks: 3 },
        { day: 'Thu', tasks: 8 },
        { day: 'Fri', tasks: 5 },
        { day: 'Sat', tasks: 2 },
        { day: 'Sun', tasks: 0 },
    ]);

    const [ideaBreakdown, setIdeaBreakdown] = useState([
        { status: 'Active', count: 3, color: 'bg-emerald-500' },
        { status: 'Planning', count: 2, color: 'bg-blue-500' },
        { status: 'Idea', count: 5, color: 'bg-amber-500' },
        { status: 'Paused', count: 1, color: 'bg-slate-300' },
    ]);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in-up relative">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#073B99]/15 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0BAAFF]/10 rounded-full blur-[200px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            {/* Header */}
            <div className="mb-10 relative z-10">
                <h1 className="text-3xl font-display font-bold text-brand-black tracking-tight">Performance Metrics</h1>
                <p className="text-slate-500 mt-1">Track your consistency and impact.</p>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={Zap}
                    label="Current Streak"
                    value={`${stats.streak} Days`}
                    color="text-amber-500"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    icon={Clock}
                    label="Focus Hours"
                    value={`${stats.focusHours}h`}
                    color="text-blue-500"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Tasks Done"
                    value={stats.tasksCompleted}
                    color="text-emerald-500"
                    bgColor="bg-emerald-50"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Productivity"
                    value={`${stats.avgProductivity}%`}
                    color="text-violet-500"
                    bgColor="bg-violet-50"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Activity Graph */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-blue-100 p-8 rounded-2xl shadow-lg relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-display font-bold text-brand-black">Weekly Activity</h3>
                            <p className="text-sm text-slate-500">Tasks completed over the last 7 days</p>
                        </div>
                        <Calendar className="text-slate-300" size={20} />
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4">
                        {weeklyActivity.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="relative w-full flex justify-center items-end h-[200px]">
                                    <div
                                        className="w-full max-w-[40px] bg-gradient-to-t from-[#0066CC] to-[#0BAAFF] rounded-t-lg transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#0066CC]/30"
                                        style={{ height: `${(day.tasks / 10) * 100}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded-md transition-opacity">
                                            {day.tasks} tasks
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-400">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Idea Breakdown */}
                <div className="bg-white/70 backdrop-blur-md border border-blue-100 p-8 rounded-2xl shadow-lg flex flex-col relative z-10">
                    <h3 className="text-lg font-display font-bold text-brand-black mb-2">Idea Status</h3>
                    <p className="text-sm text-slate-500 mb-8">Distribution of your portfolio</p>

                    <div className="flex-1 flex flex-col justify-center gap-6">
                        {ideaBreakdown.map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{item.status}</span>
                                    <span className="text-slate-500">{item.count} Projects</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color}`}
                                        style={{ width: `${(item.count / 11) * 100}%` }} // Mock total 11
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white/70 backdrop-blur-md border border-blue-100 p-6 rounded-2xl shadow-md flex items-center gap-5 transition-shadow hover:shadow-lg duration-300 relative z-10">
        <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold text-brand-black">{value}</h3>
        </div>
    </div>
);

export default MetricsPage;
