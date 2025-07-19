/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#000c1a',
        'cyber-darker': '#001830',
        'cyber-dark': '#002040',
        'cyber-neon': '#00ffe1',
        'cyber-glow': '#00ff88',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 255, 225, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 225, 0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      backgroundImage: {
        'cyber-gradient': 'radial-gradient(circle at center, #000000 0%, #000000 50%, #001f33 100%)',
      }
    },
  },
  plugins: [],
};