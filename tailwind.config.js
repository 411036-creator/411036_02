module.exports = {
  content: ["./index.html", "./script.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#050505',
        panel: '#0b0b0b',
        card: '#141414',
        border: '#27211b',
        text: '#f8f4ec',
        muted: '#e6dcc0',
        accent: '#D4AF37',
        'accent-dark': '#B8860B',
        'on-accent': '#050505',
        'on-surface': '#f8f4ec'
      },
      boxShadow: {
        glow: '0 8px 30px rgba(212,175,55,0.12)'
      },
      borderRadius: {
        xl: '12px'
      }
    }
  }
}
