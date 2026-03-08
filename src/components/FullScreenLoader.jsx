import React from 'react';
import ReactDOM from 'react-dom';

const FullScreenLoader = () => {
    const loaderContent = (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white fixed inset-0 z-[9999]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-2 border-[var(--brand-accent)]/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-[var(--brand-accent)] rounded-full animate-[spin_1.5s_cubic-bezier(0.76,0,0.24,1)_infinite] border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
            </div>
            <div className="mt-8">
                <span className="text-gray-900 font-display text-xl tracking-tightest opacity-80 animate-pulse">Capable</span>
            </div>
        </div>
    );

    return ReactDOM.createPortal(loaderContent, document.body);
};

export default FullScreenLoader;
