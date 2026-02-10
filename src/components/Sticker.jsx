import React from 'react';

const Sticker = ({ children, className = '', rotation = '' }) => {
    // Transformed "Sticker" into a clean "Badge" for the new aesthetic
    // Ignoring "rotation" prop to keep things aligned/minimal

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 ${className}`}>
            {children}
        </span>
    );
};

export default Sticker;
