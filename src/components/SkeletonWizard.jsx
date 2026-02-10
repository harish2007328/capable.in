import React from 'react';

const SkeletonWizard = () => {
    return (
        <div className="w-full h-full max-w-4xl mx-auto flex flex-col justify-center items-center pb-20">
            <div className="w-full space-y-12 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse" />
                    <div className="space-y-3">
                        <div className="h-10 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 rounded-2xl animate-pulse" />
                        <div className="h-10 w-2/3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl animate-pulse" />
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-[140px] rounded-3xl border-2 border-slate-100 bg-white/50 p-8 flex flex-col justify-center gap-4 relative overflow-hidden"
                        >
                            <div className="h-5 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="h-4 w-1/2 bg-slate-50 rounded-lg animate-pulse" />
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50/50 -mr-8 -mt-8 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                    <div className="h-4 w-20 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-14 w-48 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonWizard;
