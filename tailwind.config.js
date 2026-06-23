/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                transparent: 'transparent',
                current: 'currentColor',
                black: '#303030',
                white: '#ffffff',
                primary: '#303030',
            },
            fontFamily: {
                sans: ['"Instrument Sans"', 'sans-serif'],
                serif: ['"Instrument Sans"', 'sans-serif'],
                display: ['"Instrument Sans"', 'sans-serif'],
                body: ['"Instrument Sans"', 'sans-serif'],
            },
            letterSpacing: {
                tightest: '-0.02em',
                tighter: '-0.01em',
                tight: '0em',
                normal: '0em',
                wide: '0.02em',
                wider: '0.04em',
                widest: '0.08em',
            },
            borderRadius: {
                // Configurable corner radius variables
                'button': 'var(--radius-button)', 
                'card': 'var(--radius-card)', 
                'input': 'var(--radius-input)', 
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
