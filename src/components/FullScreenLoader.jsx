import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Lottie from 'lottie-react';
import loaderAnimation from '../assets/loader.json';

const FullScreenLoader = () => {
    const lottieRef = useRef(null);

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(3);
        }
    }, []);

    const loaderContent = (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white fixed inset-0 z-[9999] transition-opacity duration-300">
            <div className="w-[150px] h-[150px]">
                <Lottie lottieRef={lottieRef} animationData={loaderAnimation} loop={true} />
            </div>
        </div>
    );

    return ReactDOM.createPortal(loaderContent, document.body);
};

export default FullScreenLoader;
