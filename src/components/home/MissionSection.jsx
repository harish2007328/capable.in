import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Rocket, Lightbulb } from 'lucide-react';

const Word = ({ children, range, progress, isItalic, isBrand, isGray }) => {
    const opacity = useTransform(progress, range, [0.15, 1]);
    return (
        <span className="relative inline-block mr-1.5 sm:mr-3 last:mr-0">
            <motion.span
                style={{ opacity }}
                className={`
                    font-display
                    ${isItalic ? 'italic' : ''}
                    ${isBrand ? 'text-[var(--brand-accent)]' : ''}
                    ${isGray ? 'text-gray-700' : ''}
                `}
            >
                {children}
            </motion.span>
        </span>
    );
};

const IconReveal = ({ progress, range, icon: Icon }) => {
    const opacity = useTransform(progress, range, [0, 1]);
    const scale = useTransform(progress, range, [0.5, 1]);
    const rotate = useTransform(progress, range, [-15, 0]);

    return (
        <motion.span
            style={{ opacity, scale, rotate }}
            className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3"
        >
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} fill="currentColor" />
        </motion.span>
    );
};

const MissionSection = ({ heroVideo }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 0.8", "start 0.2"]
    });

    const text = "What began as a simple question—why is starting up so hard? —has evolved into a mission to modernize venture building. By merging technical skills with industry insights, we're creating technology that enhances speed, clarity, and confidence in founder decisions.";
    const words = text.split(" ");

    return (
        <section className="w-full bg-[#f9f9f9] py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-200px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[24px] overflow-hidden relative group border border-gray-100 shadow-soft min-h-[500px] md:min-h-[700px] flex items-center justify-center py-16 px-4 md:py-24 md:px-12"
                >
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
                    >
                        <track kind="captions" srcLang="en" label="English" />
                    </video>

                    <div className="absolute inset-0 transition-all duration-1000 opacity-100 group-hover:opacity-90 group-hover:scale-105 pointer-events-none" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }}></div>

                    <div className="relative z-10 flex items-center justify-center w-full max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white/30 backdrop-blur-2xl rounded-[28px] p-2 md:p-3 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/40 w-full"
                        >
                            <div className="bg-white/80 backdrop-blur-3xl rounded-[20px] p-8 sm:p-10 md:p-16 lg:p-20 shadow-inner" ref={containerRef}>
                                <div className="text-2xl sm:text-3xl lg:text-[42px] font-display font-normal text-gray-900 leading-[1.5] lg:leading-[1.6] tracking-tightest text-center mx-auto max-w-4xl flex flex-wrap justify-center items-center">
                                    {words.map((word, i) => {
                                        const start = i / words.length;
                                        const end = start + (1 / words.length);

                                        const isSimple = word.includes("simple");
                                        const isHard = word.includes("hard?");
                                        const isModernize = word.includes("modernize");
                                        const isIndustry = word.includes("industry");
                                        const isEnhanceRange = i >= words.length - 12 && i <= words.length - 5;

                                        return (
                                            <React.Fragment key={i}>
                                                <Word
                                                    range={[start, end]}
                                                    progress={scrollYProgress}
                                                    isItalic={isSimple || isHard || isModernize || isIndustry}
                                                    isBrand={isSimple}
                                                    isGray={isEnhanceRange}
                                                >
                                                    {word}
                                                </Word>

                                                {isSimple && (
                                                    <IconReveal progress={scrollYProgress} range={[start, end]} icon={Sparkles} />
                                                )}

                                                {isModernize && (
                                                    <IconReveal progress={scrollYProgress} range={[start, end]} icon={Rocket} />
                                                )}

                                                {isIndustry && (
                                                    <IconReveal progress={scrollYProgress} range={[start, end]} icon={Lightbulb} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default MissionSection;
