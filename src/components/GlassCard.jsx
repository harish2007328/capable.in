import React from 'react';

/**
 * Reusable glassmorphism card component
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 * @param {string} props.intensity - Glass intensity: 'light' | 'medium' | 'strong'
 * @param {boolean} props.hover - Enable hover effects
 * @param {boolean} props.gradientBorder - Add gradient border
 * @param {function} props.onClick - Click handler
 */
const GlassCard = ({
    children,
    className = '',
    intensity = 'medium',
    hover = false,
    gradientBorder = false,
    onClick
}) => {

    const intensityClasses = {
        light: 'bg-white/50 backdrop-blur-sm border-gray-100/50',
        medium: 'bg-white/70 backdrop-blur-md border-gray-100',
        strong: 'bg-white/80 backdrop-blur-lg border-gray-200'
    };

    const hoverClasses = hover
        ? 'hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
        : '';

    const clickableClasses = onClick ? 'cursor-pointer' : '';

    if (gradientBorder) {
        return (
            <div className={`relative group ${clickableClasses} ${className}`} onClick={onClick}>
                {/* Gradient Border */}
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[var(--brand-accent)] via-[#0BAAFF] to-[var(--brand-accent)] pointer-events-none" />

                {/* Glow Effect */}
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[var(--brand-accent)] to-[#0BAAFF] opacity-20 blur-lg pointer-events-none" />

                {/* Card Content */}
                <div className={`relative ${intensityClasses[intensity]} border rounded-[14px] ${hoverClasses} m-[2px]`}>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${intensityClasses[intensity]} border rounded-2xl shadow-sm ${hoverClasses} ${clickableClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default GlassCard;
