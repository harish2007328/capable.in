import React from 'react';

const SkeletonTask = () => {
    return (
        <div className="w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-8 animate-pulse">
            {/* Header Info Skeleton */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div>
                        <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                        <div className="h-8 w-64 bg-slate-200 rounded"></div>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Progress */}
                    <div className="flex-1 md:w-48">
                        <div className="flex justify-between mb-2">
                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            <div className="h-3 w-8 bg-slate-200 rounded"></div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full"></div>
                    </div>

                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)] min-h-[600px]">

                {/* Left: Task Details (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col relative overflow-hidden">
                        <div className="mb-6">
                            <div className="h-6 w-32 bg-slate-200 rounded-full mb-3"></div>
                            <div className="h-10 w-24 bg-slate-200 rounded"></div>
                        </div>

                        <div className="h-8 w-3/4 bg-slate-200 rounded mb-6"></div>

                        <div className="space-y-4 mb-6">
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                            <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                            <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="h-12 w-full bg-blue-50 rounded-xl"></div>
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                <div className="flex-1 h-12 bg-slate-900/10 rounded-xl"></div>
                                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle: Map (4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-6"></div>

                    <div className="grid grid-cols-10 gap-2 mb-6">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-lg"></div>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <div className="h-3 w-32 bg-slate-200 rounded mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-slate-100 rounded"></div>
                            <div className="h-10 bg-slate-100 rounded"></div>
                            <div className="h-10 bg-slate-100 rounded"></div>
                            <div className="h-10 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Right: Chat (4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                        <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                    </div>

                    <div className="flex-1 p-4 space-y-4 flex flex-col-reverse">
                        <div className="h-20 w-3/4 bg-slate-100 rounded-2xl rounded-bl-none self-start"></div>
                        <div className="h-12 w-1/2 bg-slate-100 rounded-2xl rounded-br-none self-end"></div>
                        <div className="h-24 w-4/5 bg-slate-100 rounded-2xl rounded-bl-none self-start"></div>
                    </div>

                    <div className="p-4 border-t border-slate-100">
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-200"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SkeletonTask;
