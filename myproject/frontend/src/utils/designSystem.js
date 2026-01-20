// Design System Constants
export const COLORS = {
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
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    light: '#F3F4F6',
  },
  background: {
    light: '#FFFFFF',
    lighter: '#F9FAFB',
  },
  status: {
    success: '#06A77D',
    error: '#FF006E',
    warning: '#FFD60A',
    info: '#00D9FF',
  },
};

export const GRADIENTS = {
  sunset: 'linear-gradient(135deg, #FF69B4 0%, #9D4EDD 50%, #FF8C42 100%)',
  ocean: 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
  warm: 'linear-gradient(135deg, #FF8C42 0%, #FFD60A 100%)',
  success: 'linear-gradient(135deg, #06A77D 0%, #00D9FF 100%)',
  danger: 'linear-gradient(135deg, #FF006E 0%, #FF69B4 100%)',
  playful: 'linear-gradient(135deg, #FFD60A 0%, #FF8C42 100%)',
};

export const SHADOWS = {
  subtle: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
  strong: '0 8px 16px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(255, 105, 180, 0.3)',
  glowBlue: '0 0 20px rgba(0, 217, 255, 0.3)',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '999px',
};

export const ANIMATIONS = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// Member color assignments for groups
export const MEMBER_COLORS = [
  { bg: 'bg-brand-pink', text: 'text-brand-pink', light: 'bg-brand-lightPink' },
  { bg: 'bg-brand-purple', text: 'text-brand-purple', light: 'bg-brand-lightPurple' },
  { bg: 'bg-brand-orange', text: 'text-brand-orange', light: 'bg-brand-lightOrange' },
  { bg: 'bg-brand-teal', text: 'text-brand-teal', light: 'bg-brand-teal/20' },
  { bg: 'bg-brand-yellow', text: 'text-brand-yellow', light: 'bg-brand-yellow/20' },
  { bg: 'bg-brand-magenta', text: 'text-brand-magenta', light: 'bg-brand-magenta/20' },
  { bg: 'bg-brand-green', text: 'text-brand-green', light: 'bg-brand-green/20' },
];

// Expense categories with colors
export const EXPENSE_CATEGORIES = [
  { name: 'Food', icon: '🍽️', color: 'bg-orange-100', accentColor: 'text-orange-600' },
  { name: 'Travel', icon: '✈️', color: 'bg-blue-100', accentColor: 'text-blue-600' },
  { name: 'Entertainment', icon: '🎬', color: 'bg-purple-100', accentColor: 'text-purple-600' },
  { name: 'Shopping', icon: '🛍️', color: 'bg-pink-100', accentColor: 'text-pink-600' },
  { name: 'Utilities', icon: '💡', color: 'bg-yellow-100', accentColor: 'text-yellow-600' },
  { name: 'Other', icon: '📌', color: 'bg-gray-100', accentColor: 'text-gray-600' },
];

// Group emoji icons
export const GROUP_EMOJIS = [
  '👥', '🎉', '🏠', '✈️', '💰', '🍽️', '🎓', '⚽', '📚', '🎵',
];
