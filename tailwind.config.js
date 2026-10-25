/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4EDDD',
          2: '#EBE1CB',
          3: '#DFD1B4',
        },
        ink: {
          DEFAULT: '#14100C',
          soft: '#3A3128',
          mute: '#6B5F50',
          faint: '#9A8D7A',
        },
        red: {
          DEFAULT: '#DE3A22',
          deep: '#B22A16',
          soft: '#F0745C',
        },
        teal: {
          DEFAULT: '#1B6C85',
          deep: '#12505F',
          soft: '#4A93A6',
        },
      },
      fontFamily: {
        display: ['Anton', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Space Grotesk"', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
        serif: ['"Bodoni Moda"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
      },
      boxShadow: {
        hard: '7px 7px 0 #14100C',
        'hard-sm': '4px 4px 0 #14100C',
        'hard-red': '7px 7px 0 #DE3A22',
      },
      animation: {
        'twinkle': 'twinkle 5s ease-in-out infinite',
        'marquee': 'marquee 34s linear infinite',
        'float': 'float 9s ease-in-out infinite',
        'drift-slow': 'driftSlow 26s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.12' },
          '50%': { opacity: '0.75' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0) rotate(-2deg)' },
          '50%': { transform: 'translate3d(0,-10px,0) rotate(-1deg)' },
        },
        driftSlow: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-40px, 40px, 0)' },
        },
      },
    },
  },
  plugins: [],
}
