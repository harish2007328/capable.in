/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Strict Palette
                'brand-blue': '#0BAAFF', // Primary Blue
                'brand-dark-blue': '#073B99', // Secondary Deep Blue
                'brand-black': '#000000', // Pure Black
                'brand-white': '#FFFFFF', // Pure White
                // Neutral Grays for Hierarchy (Derived from black/white)
                'gray-50': '#F9FAFB',
                'gray-100': '#F3F4F6',
                'gray-200': '#E5E7EB',
                'gray-300': '#D1D5DB',
                'gray-800': '#1F2937',
                'gray-900': '#111827',
                'brand-accent': 'var(--brand-accent)',
                'brand-accent-hover': 'var(--brand-accent-hover)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Syne', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                // Standardized Radii
                'card': '0.5rem', // 8px (rounded-lg)
                'button': '0.375rem', // 6px (rounded-md)
                'input': '0.375rem', // 6px
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)', // Very subtle
                'card': '0 4px 24px rgba(0, 0, 0, 0.06)', // Clean card shadow
                'float': '0 10px 30px rgba(0, 0, 0, 0.1)', // Lifted element
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' }, // Subtle entry
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
