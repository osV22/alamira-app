export const theme = {
  colors: {
    // Brand
    primary: '#0A6E8A',        // Ocean teal — main brand color
    primaryLight: '#1A9EBF',   // Lighter teal for hover/active states
    primaryDark: '#064E63',    // Darker teal for pressed states
    secondary: '#F4A261',      // Warm amber — accent color

    // Backgrounds
    background: '#F8FAFB',     // Light gray-blue tint
    surface: '#FFFFFF',        // Cards, sheets
    surfaceElevated: '#FFFFFF',

    // Text
    text: '#1A2B3C',          // Dark navy — primary text
    textSecondary: '#5A6B7C', // Muted — secondary text
    textInverse: '#FFFFFF',   // Text on dark backgrounds
    textDisabled: '#9AABB8',

    // Semantic
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',

    // UI
    border: '#D1DBE3',
    borderLight: '#E8EDF1',
    divider: '#E8EDF1',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Night mode (future use)
    nightBackground: '#0D1B2A',
    nightSurface: '#1B2838',
    nightText: '#E0E6ED',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
} as const;

export type Theme = typeof theme;
