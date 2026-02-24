import React from 'react';
import logoIconSrc from '../assets/LOGO ICON.svg';

export const LogoIcon = ({ className = "w-8 h-8" }) => (
    <img
        src={logoIconSrc}
        alt="Capable Logo"
        className={className}
    />
);

const Logo = ({ showText = true, className = "", color = "white", iconColor = "#0BAAFF" }) => {
    // Determine filter for dark vs white logo variants
    // The SVGs have fill="white" by default, so on light backgrounds we invert them
    const isDark = color === "dark" || color === "#000000";
    const filterStyle = isDark ? { filter: "brightness(0)" } : {};
    const textColorClass = isDark ? "text-brand-black" : "text-white";

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center">
                <img
                    src={logoIconSrc}
                    alt="Capable Logo"
                    className="w-6 h-6"
                    style={{
                        ...filterStyle,
                        position: "relative",
                        top: "1px"
                    }}
                />
            </div>
            {showText && (
                <span
                    className={`text-4xl font-bold leading-none ${textColorClass}`}
                    style={{
                        fontFamily: "'Cormorant Unicase', serif",
                        letterSpacing: "0.05em",
                        position: "relative",
                        top: "-2px"
                    }}
                >
                    capable
                </span>
            )}
        </div>
    );
};

export default Logo;
