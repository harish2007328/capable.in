import React, { useRef } from 'react';
import { Sparkles, Rocket, Lightbulb } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollWord = ({ children, progress, range, className }) => {
    // Opacity interpolates from 0.15 to 1 based on the global scroll progress of the section
    const opacity = useTransform(progress, range, [0.15, 1]);
    return (
        <motion.span style={{ opacity }} className={`inline-block mr-[0.25em] ${className}`}>
            {children}
        </motion.span>
    );
};

const ScrollIcon = ({ children, progress, range, rotate }) => {
    const opacity = useTransform(progress, range, [0.15, 1]);
    return (
        <motion.span
            style={{ opacity }}
            className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgba(59,130,246,0.3)] align-middle mx-1.5 sm:mx-3 transform ${rotate} transition-transform hover:scale-110`}
        >
            {children}
        </motion.span>
    );
};

const AnimatedParagraph = ({ scrollYProgress }) => {
    const tokens = [];
    const pushText = (text, className = "font-display text-gray-900") => {
        text.split(/\s+/).filter(Boolean).forEach(word => {
            tokens.push({ type: 'word', content: word, className });
        });
    };

    // Construct the timeline of words and icons
    pushText("What began as a");
    pushText("simple", "font-display italic text-[var(--brand-accent)]");
    tokens.push({
        type: 'icon',
        content: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />,
        rotate: 'rotate-3'
    });
    pushText("question—");
    pushText("why is starting up so hard?", "font-display italic text-gray-900");
    pushText("—has evolved into a mission to modernize");
    tokens.push({
        type: 'icon',
        content: <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />,
        rotate: '-rotate-6'
    });
    pushText("venture building. By merging technical skills with");
    pushText("industry", "font-display italic text-gray-900");
    tokens.push({
        type: 'icon',
        content: <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={1.5} fill="currentColor" />,
        rotate: 'rotate-6'
    });
    pushText("insights, we're creating technology that");
    pushText("enhances speed, clarity, and confidence", "font-display italic text-gray-700");
    pushText("in founder decisions.");

    const total = tokens.length;

    return (
        <p className="text-3xl sm:text-4xl lg:text-[54px] font-display leading-[1.15] lg:leading-[1.1] tracking-tight text-center mx-auto max-w-5xl pb-4">
            {tokens.map((token, i) => {
                // Determine the scroll progress range that corresponds to this exact word
                const start = i / total;
                const end = start + (1 / total);

                if (token.type === 'word') {
                    return (
                        <ScrollWord key={i} progress={scrollYProgress} range={[start, end]} className={token.className}>
                            {token.content}
                        </ScrollWord>
                    );
                } else {
                    return (
                        <ScrollIcon key={i} progress={scrollYProgress} range={[start, end]} rotate={token.rotate}>
                            {token.content}
                        </ScrollIcon>
                    );
                }
            })}
        </p>
    );
};

const MissionSection = ({ heroVideo }) => {
    const textRef = useRef(null);

    // Track the scroll progress specifically as the *text block* moves through the screen
    // "start 85%" -> animation begins right when the text box itself enters the viewport
    // "center 45%" -> animation completely finishes when the text box is centered on screen
    const { scrollYProgress } = useScroll({
        target: textRef,
        offset: ["start 65%", "center 60%"]
    });

    return (
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
                    >
                        <track kind="captions" srcLang="en" label="English" />
                    </video>

                    <div className="absolute inset-0 transition-all duration-1000 opacity-100 group-hover:opacity-90 group-hover:scale-105 pointer-events-none" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.5), rgba(9, 106, 202, 0.5))' }}></div>

                    <div ref={textRef} className="relative z-10 flex items-center justify-center w-full max-w-5xl">
                        <div className="bg-white/30 backdrop-blur-2xl rounded-[28px] p-2 md:p-3 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/40 w-full">
                            <div className="bg-white/80 backdrop-blur-3xl rounded-[20px] p-8 sm:p-10 md:p-16 lg:p-20 shadow-inner">
                                <AnimatedParagraph scrollYProgress={scrollYProgress} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MissionSection;
