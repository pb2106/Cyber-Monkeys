/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                'veridia': {
                    'bg': '#0a0f1a',
                    'card': '#10182d',
                    'accent': '#10b981',
                    'glow': '#06b6d4',
                    'surface': '#131b30',
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'float-slow': 'float 8s ease-in-out 1s infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'ring-ping': 'ring-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' },
                    '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'ring-ping': {
                    '0%': { transform: 'scale(1)', opacity: '0.8' },
                    '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
