// Centralized color pattern for the sports e-commerce project

const colorPattern = {
  // Primary Colors - Deep Blue (Trust, Professional, Athletic)
  primary: '#0F52BA', // Royal blue - more vibrant, athletic
  primaryLight: '#3B82F6', // Brighter blue for better contrast
  primaryDark: '#0A3D8F', // Deeper blue for active states
  
  // Secondary Colors - Energetic Orange (Action, Energy, Sport)
  secondary: '#FF6B35', // Vibrant orange for CTAs and highlights
  secondaryLight: '#FF8A65', // Light orange for backgrounds
  secondaryDark: '#E65100', // Dark orange for emphasis
  
  // Accent Colors
  accent: '#10B981', // Modern emerald green for success and health vibes
  accentLight: '#6EE7B7', // Light green for subtle accents
  accentDark: '#059669', // Rich green for confirmation
  
  // Athletic Gold for premium/featured products
  gold: '#F59E0B', // Warmer, more premium gold
  goldLight: '#FCD34D', // Softer gold highlight
  goldDark: '#D97706', // Deeper gold for emphasis
  
  // Neutrals
  background: '#FFFFFF', // Pure white
  backgroundGray: '#F9FAFB', // Slightly cooler gray for modern look
  backgroundDark: '#111827', // Richer dark mode background
  
  // Text Colors
  text: '#1F2937', // Softer black for better readability
  textLight: '#6B7280', // Balanced gray for secondary text
  textMuted: '#9CA3AF', // Light gray for muted text
  textWhite: '#FFFFFF', // White text for dark backgrounds
  
  // Border and Divider Colors
  border: '#E5E7EB', // Neutral gray borders
  borderLight: '#F3F4F6', // Very light borders
  borderDark: '#D1D5DB', // Medium gray for emphasis
  
  // Input and Form Colors
  inputBg: '#F9FAFB', // Clean, modern input background
  inputBorder: '#D1D5DB', // Visible but not harsh
  inputFocus: '#3B82F6', // Bright focus color
  
  // Status Colors
  error: '#EF4444', // Modern red for errors
  errorLight: '#FEE2E2', // Soft red background
  success: '#10B981', // Emerald green for success
  successLight: '#D1FAE5', // Soft green background
  warning: '#F59E0B', // Amber for warnings
  warningLight: '#FEF3C7', // Soft amber background
  info: '#3B82F6', // Blue for info
  infoLight: '#DBEAFE', // Soft blue background
  
  // E-commerce Specific Colors
  price: '#DC2626', // Bold red for prices (attention-grabbing)
  originalPrice: '#9CA3AF', // Muted gray for crossed-out prices
  discount: '#10B981', // Green for discount badges
  inStock: '#10B981', // Green for in-stock status
  outOfStock: '#DC2626', // Red for out-of-stock
  
  // Sport Category Colors (for different sport types)
  fitness: '#F97316', // Energetic orange for fitness
  outdoor: '#22C55E', // Fresh green for outdoor sports
  team: '#3B82F6', // Dynamic blue for team sports
  water: '#06B6D4', // Cyan for water sports
  winter: '#64748B', // Cool slate for winter sports
  
  // Interactive Elements
  hover: '#F3F4F6', // Subtle gray for hover
  active: '#E5E7EB', // Medium gray for active states
  disabled: '#D1D5DB', // Clear disabled state
  
  // Shadows and Overlays
  shadow: 'rgba(0, 0, 0, 0.08)', // Softer shadow
  shadowDark: 'rgba(0, 0, 0, 0.15)', // Medium shadow
  overlay: 'rgba(0, 0, 0, 0.6)', // Stronger overlay for focus
  overlayLight: 'rgba(255, 255, 255, 0.95)', // Clean light overlay
  
  // Gradient Colors (for modern effects)
  gradientStart: '#0F52BA',
  gradientEnd: '#3B82F6',
  gradientAccent: '#FF6B35',
};

// Tailwind color format (with shade variations)
export const tailwindColors = {
  primary: {
    50: '#F0F6FF',
    100: '#E1EDFF',
    200: '#C3DBFF',
    300: '#A5C9FF',
    400: '#87B7FF',
    500: colorPattern.primary, // #0F52BA
    600: colorPattern.primaryDark, // #0A3D8F
    700: '#082D6B',
    800: '#061D47',
    900: '#040D23',
  },
  secondary: {
    50: '#FFF5F0',
    100: '#FFEBE1',
    200: '#FFD7C3',
    300: '#FFC3A5',
    400: '#FFAF87',
    500: colorPattern.secondary, // #FF6B35
    600: colorPattern.secondaryDark, // #E65100
    700: '#CC4700',
    800: '#993400',
    900: '#662300',
  },
  accent: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBFBCF',
    300: '#86EFB7',
    400: colorPattern.accentLight, // #6EE7B7
    500: colorPattern.accent, // #10B981
    600: colorPattern.accentDark, // #059669
    700: '#047857',
    800: '#065F46',
    900: '#034E3F',
  },
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: colorPattern.goldLight, // #FCD34D
    300: '#FBD13A',
    400: '#FAC515',
    500: colorPattern.gold, // #F59E0B
    600: '#E5971D',
    700: colorPattern.goldDark, // #D97706
    800: '#B45309',
    900: '#92400E',
  },
};

// Helper function to get color with opacity
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Color combinations for common use cases
export const colorCombinations = {
  // Primary button
  primaryButton: {
    bg: colorPattern.primary,
    text: colorPattern.textWhite,
    hover: colorPattern.primaryDark,
  },
  
  // Secondary button
  secondaryButton: {
    bg: colorPattern.secondary,
    text: colorPattern.textWhite,
    hover: colorPattern.secondaryDark,
  },
  
  // Success button (Add to Cart, etc.)
  successButton: {
    bg: colorPattern.accent,
    text: colorPattern.textWhite,
    hover: colorPattern.accentDark,
  },
  
  // Product card
  productCard: {
    bg: colorPattern.background,
    border: colorPattern.border,
    shadow: colorPattern.shadow,
  },
  
  // Navigation
  navigation: {
    bg: colorPattern.background,
    text: colorPattern.text,
    hover: colorPattern.hover,
  },
  
  // Footer
  footer: {
    bg: colorPattern.text,
    text: colorPattern.textWhite,
    accent: colorPattern.secondary,
  },
};

export default colorPattern;