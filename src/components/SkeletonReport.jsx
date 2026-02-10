import React from 'react';

const SkeletonReport = () => {
    return (
        <div className="w-full h-full bg-[#FAFAFA] overflow-y-auto custom-scrollbar animate-in fade-in duration-1000">
            <div className="max-w-7xl mx-auto px-6 py-8 pb-32">

                {/* Header Skeleton */}
                <div className="mb-10 border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="w-40 h-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full animate-pulse border border-blue-50/50" />
                        <div className="h-10 w-2/3 bg-slate-200 rounded-2xl animate-pulse" />
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
                        <div className="w-44 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl animate-pulse" />
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Row 1: Manifesto (Left) + Scores (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-12 bg-white border border-slate-100 rounded-[2rem] p-10 h-64 relative overflow-hidden shadow-sm">
                            <div className="space-y-4 relative z-10">
                                <div className="h-4 w-24 bg-slate-100 rounded-full animate-pulse" />
                                <div className="h-8 w-1/2 bg-slate-200 rounded-xl animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-slate-100 rounded-lg animate-pulse" />
                                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 -mr-16 -mt-16 rounded-full blur-3xl" />
                        </div>

                        {/* Row 2: Competitors & Scores */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 h-48 space-y-4 shadow-sm">
                                    <div className="h-4 w-20 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
                                    <div className="h-16 w-full bg-slate-50 rounded-xl animate-pulse" />
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white border border-slate-100 rounded-3xl aspect-square flex flex-col items-center justify-center p-6 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl border-2 border-slate-100 animate-pulse mb-3" />
                                    <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonReport;
