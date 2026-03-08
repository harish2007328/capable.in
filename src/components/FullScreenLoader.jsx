import React, { useRef, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import loaderAnimation from '../assets/loader.json';

// Lazy load the player to keep the initial index bundle small
const Lottie = lazy(() => import('lottie-react'));

const FullScreenLoader = () => {
    const lottieRef = useRef(null);

    const loaderContent = (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white fixed inset-0 z-[9999]">
            <div className="w-[150px] h-[150px] flex items-center justify-center">
                <Suspense fallback={
                    <div className="w-12 h-12 border-2 border-[var(--brand-accent)]/20 border-t-[var(--brand-accent)] rounded-full animate-spin" />
                }>
                    <Lottie
                        lottieRef={lottieRef}
                        animationData={loaderAnimation}
                        loop={true}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Suspense>
            </div>
            <div className="mt-4">
                <span className="text-gray-900 font-display text-xl tracking-tightest opacity-80 animate-pulse">Capable</span>
            </div>
        </div>
    );

    return ReactDOM.createPortal(loaderContent, document.body);
};

export default FullScreenLoader;
