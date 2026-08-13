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
        primary: '#000000',
        secondary: '#525252',
        muted: '#737373',
        surface: '#FFFFFF',
        footer: '#0A0A0A',
      },
      letterSpacing: {
        'display': '-0.05em',
        'body': '-0.02em',
        'mono-wide': '0.1em',
      },
      lineHeight: {
        'display': '0.9',
        'body': '1.5',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
