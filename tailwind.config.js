/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          hover: 'var(--primary-hover)',
        },
        background: 'var(--background-color)',
        surface: 'var(--surface-color)',
        text: {
          DEFAULT: 'var(--text-color)',
          secondary: 'var(--text-secondary)',
        },
        border: 'var(--border-color)',
        success: 'var(--success-color)',
        error: 'var(--error-color)',
      },
    },
  },
  plugins: [],
}