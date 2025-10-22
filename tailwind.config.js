// tailwind.config.js
const { tailwindColors } = require('./src/styles/colorPattern');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Import colors from colorPattern.js
        ...tailwindColors,
        
        // Additional semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        
        // Neutral/Gray scale
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      // Gradient presets for sports theme
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF6B35 0%, #E65100 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-sport': 'linear-gradient(135deg, #0F52BA 0%, #10B981 50%, #FF6B35 100%)',
      },
      // Box Shadow for depth
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'colored-primary': '0 8px 24px rgba(15, 82, 186, 0.25)',
        'colored-secondary': '0 8px 24px rgba(255, 107, 53, 0.25)',
        'colored-accent': '0 8px 24px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
}