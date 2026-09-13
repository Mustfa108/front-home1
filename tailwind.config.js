/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Cairo',
          'Tajawal',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // European-editorial display face (Arabic + Latin)
        display: [
          'Alexandria',
          'Cairo',
          'Tajawal',
          'system-ui',
          'sans-serif',
        ],
        wordmark: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Brand colors aligned with the PDF design
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#bcd1ff',
          300: '#8eb1ff',
          400: '#5a85ff',
          500: '#365fff',
          600: '#1f3ff5',
          700: '#1730d8',
          800: '#192aae',
          900: '#1a2a89',
          950: '#141b53',
        },
        // Readiness palette (mirrors backend enum colors)
        readiness: {
          low: '#DC2626',
          medium: '#F59E0B',
          good: '#16A34A',
        },
      },
      boxShadow: {
        soft: '0 6px 20px -8px rgba(15, 23, 42, 0.15)',
        card: '0 8px 30px -10px rgba(15, 23, 42, 0.12)',
        lift: '0 18px 45px -18px rgba(15, 23, 42, 0.22)',
        glow: '0 0 0 1px rgba(31, 63, 245, 0.08), 0 20px 60px -20px rgba(31, 63, 245, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'bar-grow': 'barGrow 1.1s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 1.8s linear infinite',
        'splash-exit': 'splashExit 0.65s cubic-bezier(0.76, 0, 0.24, 1) forwards',
        'logo-pop': 'logoPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'logo-ring': 'logoRing 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'word-reveal': 'wordReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        barGrow: {
          '0%': { transform: 'scaleX(0)', opacity: '0.4' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        splashExit: {
          '0%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
          '100%': { clipPath: 'inset(0 0 100% 0)', opacity: '0.98' },
        },
        logoPop: {
          '0%': { transform: 'scale(0.4) rotate(-12deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        logoRing: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        wordReveal: {
          '0%': { transform: 'translateY(28px)', opacity: '0', filter: 'blur(6px)' },
          '100%': { transform: 'translateY(0)', opacity: '1', filter: 'blur(0)' },
        },
      },
    },
  },
  plugins: [],
};
