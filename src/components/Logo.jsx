import React from 'react';
import logoSrc from '../assets/logo.svg';

export const LogoIcon = ({ className = "w-8 h-8" }) => (
    <img
        src={logoSrc}
        alt="Capable Logo"
        className={className}
    />
);

const Logo = ({ showText = true, className = "", color = "white", iconColor = "#0BAAFF" }) => {
    // If color is 'dark', we want dark text (for light background)
    // If color is 'white', we want white text (for dark background)
    const textColorClass = color === "dark" || color === "#000000" ? "text-brand-black" : "text-white";

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center">
                <LogoIcon className="w-8 h-8" />
            </div>
            {showText && (
                <span
                    className={`text-2xl font-semibold ${textColorClass}`}
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        letterSpacing: "0.04em"
                    }}
                >
                    capable
                </span>
            )}
        </div>
    );
};

export default Logo;
