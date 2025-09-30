// src/styles/colorPattern.js
// Centralized color pattern for the e-commerce project

// const colorPattern = {
//   primary: '#ef4444', // red-500
//   primaryDark: '#dc2626', // red-600
//   secondary: '#f59e42', // orange-400
//   background: '#ffffff',
//   text: '#111827', // gray-900
//   textLight: '#6b7280', // gray-500
//   border: '#e5e7eb', // gray-200
//   inputBg: '#f3f4f6', // gray-100
//   error: '#ef4444',
//   success: '#22c55e', // green-500
//   disabled: '#d1d5db', // gray-300
// };

// export default colorPattern;
// Centralized color pattern for the sports e-commerce project

const colorPattern = {
  // Primary Colors - Deep Blue (Trust, Professional, Athletic)
  primary: '#0B4F6C', // Deep ocean blue - main brand color
  primaryLight: '#1976D2', // Lighter blue for hover states
  primaryDark: '#083D56', // Darker blue for active states
  
  // Secondary Colors - Energetic Orange (Action, Energy, Sport)
  secondary: '#FF6B35', // Vibrant orange for CTAs and highlights
  secondaryLight: '#FF8A65', // Light orange for backgrounds
  secondaryDark: '#E65100', // Dark orange for emphasis
  
  // Accent Colors
  accent: '#00C853', // Fresh green for success states and health vibes
  accentLight: '#69F0AE', // Light green for subtle accents
  accentDark: '#00A043', // Dark green for confirmation
  
  // Athletic Gold for premium/featured products
  gold: '#FFB300',
  goldLight: '#FFD54F',
  goldDark: '#FF8F00',
  
  // Neutrals
  background: '#FFFFFF', // Pure white
  backgroundGray: '#F8F9FA', // Very light gray for sections
  backgroundDark: '#1A1A1A', // Dark mode background
  
  // Text Colors
  text: '#212121', // Almost black for main text
  textLight: '#757575', // Medium gray for secondary text
  textMuted: '#9E9E9E', // Light gray for muted text
  textWhite: '#FFFFFF', // White text for dark backgrounds
  
  // Border and Divider Colors
  border: '#E0E0E0', // Light gray borders
  borderLight: '#F5F5F5', // Very light borders
  borderDark: '#BDBDBD', // Darker borders for emphasis
  
  // Input and Form Colors
  inputBg: '#FAFAFA', // Light background for inputs
  inputBorder: '#E0E0E0', // Input borders
  inputFocus: '#1976D2', // Focus state color
  
  // Status Colors
  error: '#D32F2F', // Red for errors
  errorLight: '#FFCDD2', // Light red for error backgrounds
  success: '#388E3C', // Green for success
  successLight: '#C8E6C9', // Light green for success backgrounds
  warning: '#F57C00', // Orange for warnings
  warningLight: '#FFE0B2', // Light orange for warning backgrounds
  info: '#1976D2', // Blue for info
  infoLight: '#BBDEFB', // Light blue for info backgrounds
  
  // E-commerce Specific Colors
  price: '#D32F2F', // Red for prices (attention-grabbing)
  originalPrice: '#9E9E9E', // Gray for crossed-out original prices
  discount: '#388E3C', // Green for discount badges
  inStock: '#388E3C', // Green for in-stock status
  outOfStock: '#D32F2F', // Red for out-of-stock
  
  // Sport Category Colors (for different sport types)
  fitness: '#FF6B35', // Orange for fitness equipment
  outdoor: '#4CAF50', // Green for outdoor sports
  team: '#2196F3', // Blue for team sports
  water: '#00BCD4', // Cyan for water sports
  winter: '#607D8B', // Blue gray for winter sports
  
  // Interactive Elements
  hover: '#F5F5F5', // Light gray for hover states
  active: '#E0E0E0', // Medium gray for active states
  disabled: '#BDBDBD', // Gray for disabled elements
  
  // Shadows and Overlays
  shadow: 'rgba(0, 0, 0, 0.1)', // Light shadow
  shadowDark: 'rgba(0, 0, 0, 0.2)', // Darker shadow
  overlay: 'rgba(0, 0, 0, 0.5)', // Dark overlay for modals
  overlayLight: 'rgba(255, 255, 255, 0.9)', // Light overlay
  
  // Gradient Colors (for modern effects)
  gradientStart: '#0B4F6C',
  gradientEnd: '#1976D2',
  gradientAccent: '#FF6B35',
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