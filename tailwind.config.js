/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hpc: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#3B82F6',
          purple: '#8B5CF6',
          green: '#10B981',
          orange: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
