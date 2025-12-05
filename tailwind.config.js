/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ds: {
          bg: '#ffffff',
          sidebar: '#f9fafb',
          primary: '#4d6bfe',
          hover: '#f3f4f6',
          border: '#e5e7eb',
          text: '#111827',
          subtext: '#6b7280',
          input: '#ffffff',
          inputBorder: '#e5e7eb',
          codeBg: '#f6f8fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        ds: '0 2px 8px rgba(0, 0, 0, 0.05)',
        'ds-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
