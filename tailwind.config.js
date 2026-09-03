/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Primary Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9', // Backgrounds
          200: '#e2e8f0', // Borders
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Subtle text
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Primary Text
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        // Enforcing sharp/subtle corners. Removing large/pill shapes.
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.375rem', 
        'xl': '0.375rem',
        '2xl': '0.375rem',
        '3xl': '0.375rem',
        'full': '0.375rem', // Overriding pill shapes to be square-ish
      },
      boxShadow: {
        // Flat design, very subtle shadows
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        lg: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)', // override larger shadows
        xl: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
