module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',      // blue-600
        secondary: '#3b82f6',    // blue-500
        trust: {
          light: '#f8fafc',      // slate-50
          mid: '#e5e7eb',        // gray-200
          blue: '#2563eb',       // blue-600
          navy: '#1e293b',       // slate-800
        }
      }
    },
  },
  plugins: [],
}