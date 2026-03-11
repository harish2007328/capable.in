import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import Lottie from 'lottie-react';
import animationData from '../assets/loader.json';

const FullScreenLoader = () => {
    const lottieRef = useRef(null);

    const handleAnimationLoaded = () => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(2.5);
        }
    };

    const loaderContent = (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white fixed inset-0 z-[9999]">
            <div className="relative w-40 h-40 flex items-center justify-center">
                <Lottie 
                    lottieRef={lottieRef}
                    animationData={animationData} 
                    loop={true} 
                    autoplay={true} 
                    className="w-full h-full"
                    onDOMLoaded={handleAnimationLoaded}
                />
            </div>
            <div className="mt-2 text-center">
                <span className="text-gray-900 font-display text-lg tracking-tightest opacity-80 animate-pulse uppercase">Capable</span>
            </div>
        </div>
    );

    return ReactDOM.createPortal(loaderContent, document.body);
};

export default FullScreenLoader;
