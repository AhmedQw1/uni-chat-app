/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.css"  // Added CSS file scanning
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color, #3b82f6)',
          hover: 'var(--primary-hover, #2563eb)',
        },
        background: 'var(--background-color, #ffffff)',
        surface: 'var(--surface-color, #f8fafc)',
        text: {
          DEFAULT: 'var(--text-color, #1e293b)',
          secondary: 'var(--text-secondary, #64748b)',
        },
        border: 'var(--border-color, #e2e8f0)',
        success: 'var(--success-color, #10b981)',
        error: 'var(--error-color, #ef4444)',
      },
    },
  },
  plugins: [],
}