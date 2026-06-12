/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#001bca',
        'primary-container': '#2d3fe0',
        'sidebar': '#1E2A4A',
        'surface': '#FFFFFF',
        'surface-container-low': '#f2f4f6',
        'ai-accent': '#7C3AED',
        'status-success': '#059669',
        'status-warning': '#D97706',
        'status-danger': '#DC2626',
        'text-muted': '#64748B',
        'outline-variant': '#c5c5d8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
