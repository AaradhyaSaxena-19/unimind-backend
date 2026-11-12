/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F7FC',
        surface: '#FFFFFF',
        brand: {
          50: '#EFF6FF',
          100: '#EBF3FE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#1E6BFF',
          700: '#155BE5',
          800: '#1E40AF',
        },
        slate: {
          850: '#151F33',
        }
      },
      boxShadow: {
        'soft-xs': '0 2px 5px 0 rgba(15, 23, 42, 0.03)',
        'soft': '0 6px 20px -3px rgba(15, 23, 42, 0.05), 0 2px 6px -2px rgba(15, 23, 42, 0.02)',
        'soft-md': '0 12px 28px -4px rgba(15, 23, 42, 0.07), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 20px 35px -5px rgba(15, 23, 42, 0.09), 0 8px 16px -3px rgba(15, 23, 42, 0.04)',
        'glow-blue': '0 6px 20px 0 rgba(30, 107, 255, 0.32)',
        'glow-coral': '0 6px 20px 0 rgba(244, 63, 94, 0.30)',
        'glow-amber': '0 6px 20px 0 rgba(245, 158, 11, 0.30)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
