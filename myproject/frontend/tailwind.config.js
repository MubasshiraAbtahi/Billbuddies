module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          pink: '#FF69B4',
          purple: '#9D4EDD',
          orange: '#FF8C42',
          yellow: '#FFD60A',
          teal: '#00D9FF',
          magenta: '#FF006E',
          green: '#06A77D',
          lightPink: '#FFB3D9',
          lightPurple: '#E0AAFF',
          lightOrange: '#FFD6A5',
        },
      },
      backgroundImage: {
        // Gradients
        'gradient-sunset': 'linear-gradient(135deg, #FF69B4 0%, #9D4EDD 50%, #FF8C42 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FF8C42 0%, #FFD60A 100%)',
        'gradient-success': 'linear-gradient(135deg, #06A77D 0%, #00D9FF 100%)',
        'gradient-danger': 'linear-gradient(135deg, #FF006E 0%, #FF69B4 100%)',
        'gradient-playful': 'linear-gradient(135deg, #FFD60A 0%, #FF8C42 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-in',
        'scale-in': 'scale-in 0.3s ease-out',
        'ripple': 'ripple 0.6s ease-out',
        'confetti': 'confetti 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'toggle-slide': 'toggle-slide 0.3s ease-out',
        'draw-checkmark': 'draw-checkmark 0.4s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255, 105, 180, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 105, 180, 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'toggle-slide': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(20px)' },
        },
        'draw-checkmark': {
          '0%': { strokeDashoffset: '24', opacity: '0' },
          '100%': { strokeDashoffset: '0', opacity: '1' },
        },
      },
      boxShadow: {
        'subtle': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 8px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(255, 105, 180, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 217, 255, 0.3)',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
