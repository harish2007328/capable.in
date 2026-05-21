import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GlobalHeroVideo = () => {
    const location = useLocation();
    const videoRef = useRef(null);

    const cleanPath = location.pathname.endsWith('/') && location.pathname.length > 1
        ? location.pathname.slice(0, -1)
        : location.pathname;

    const isPricingPage = cleanPath === '/pricing';
    const videoHeightClass = isPricingPage 
        ? "h-[52vh] min-h-[280px] lg:h-screen" 
        : "h-screen";

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
            videoRef.current.style.transform = 'translateZ(0)';
            // Play video just in case browser paused it
            videoRef.current.play().catch(() => {
                // Ignore autoplay block errors
            });
        }
    }, [cleanPath]);

    const heroVideo = "/hero-bg2-compressed.mp4";
    const heroPoster = "/hero-poster.webp";

    return (
        <div className={`absolute top-0 left-0 right-0 z-0 pt-[84px] px-3 pb-3 pointer-events-none select-none transition-all duration-500 ${videoHeightClass}`}>
            <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-2xl">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={heroPoster}
                    className="h-full w-full object-cover"
                    style={{
                        backfaceVisibility: 'hidden',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backgroundColor: '#0c1428',
                        filter: 'brightness(0.9)'
                    }}
                >
                    <source src={heroVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(rgba(41, 145, 248, 0.48), rgba(9, 106, 202, 0.48))' }} />
                <div className="absolute inset-0 z-10 bg-black/5" />
            </div>
        </div>
    );
};

export default GlobalHeroVideo;
