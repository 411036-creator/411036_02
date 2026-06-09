module.exports = {
  content: ["./index.html", "./script.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'glow-50': '#f8fafc',
        'glow-100': '#cbd5e1',
        'glow-200': '#94a3b8',
        'glow-400': '#60a5fa',
        'glow-600': '#0ea5a4',
        'glow-700': '#0f172a',
        'glow-800': '#0b1220',
        'glow-900': '#05060a',
        'glow-accent': '#38bdf8'
      },
      boxShadow: {
        'glow-lg': '0 8px 30px rgba(14,165,164,0.12)'
      },
      borderRadius: {
        'xl': '12px'
      }
    }
  }
}
