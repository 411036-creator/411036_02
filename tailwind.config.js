module.exports = {
  content: ["./index.html", "./script.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'glow-50': '#f8f4ec',
        'glow-100': '#e6dcc0',
        'glow-200': '#bfa86a',
        'glow-400': '#D4AF37',
        'glow-600': '#B8860B',
        'glow-700': '#141414',
        'glow-800': '#0b0b0b',
        'glow-900': '#050505',
        'glow-accent': '#D4AF37'
      },
      boxShadow: {
        'glow-lg': '0 8px 30px rgba(212,175,55,0.12)'
      },
      borderRadius: {
        'xl': '12px'
      }
    }
  }
}
