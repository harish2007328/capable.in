import React from 'react';
import { Sparkles, Rocket, Lightbulb } from 'lucide-react';

const MissionSection = ({ heroVideo }) => (
    <section className="w-full bg-[#f9f9f9] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[24px] overflow-hidden relative group border border-gray-100 shadow-soft min-h-[500px] md:min-h-[700px] flex items-center justify-center py-16 px-4 md:py-24 md:px-12">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                    style={{
                        backfaceVisibility: 'hidden',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backgroundColor: '#0c1428',
                        filter: 'brightness(0.9)'
                    }}
                    src={heroVideo}
                />

                <div className="absolute inset-0 transition-all duration-1000 opacity-100 group-hover:opacity-90 group-hover:scale-105 pointer-events-none" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }}></div>

                <div className="relative z-10 flex items-center justify-center w-full max-w-5xl">
                    <div className="bg-white/30 backdrop-blur-2xl rounded-[28px] p-2 md:p-3 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/40 w-full">
                        <div className="bg-white/80 backdrop-blur-3xl rounded-[20px] p-8 sm:p-10 md:p-16 lg:p-20 shadow-inner">
                            <p className="text-2xl sm:text-3xl lg:text-[42px] font-display font-normal text-gray-900 leading-[1.5] lg:leading-[1.6] tracking-tightest text-center mx-auto max-w-4xl">
                                What began as a <span className="font-display italic text-[var(--brand-accent)]">simple</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform rotate-3 transition-transform hover:scale-110">
                                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />
                                </span>
                                question—<span className="font-display italic">why is starting up so hard?</span>—has evolved into a mission to modernize
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform -rotate-6 transition-transform hover:scale-110">
                                    <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />
                                </span>
                                venture building. By merging technical skills with <span className="font-display italic">industry</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform rotate-6 transition-transform hover:scale-110">
                                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />
                                </span>
                                insights, we're creating technology that <span className="font-display italic text-gray-500">enhances speed, clarity, and confidence</span> in founder decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default MissionSection;
