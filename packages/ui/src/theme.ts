/**
 * Alamira dark theme tokens.
 *
 * Canonical color values live in each app's tailwind.config.ts.
 * This file re-exports them as a plain object for cases where
 * you need values outside of NativeWind className (e.g. StatusBar,
 * React Navigation theme, Reanimated, or any imperative API).
 */
export const colors = {
  background: '#0F1419',
  surface: '#1A2029',
  surfaceElevated: '#232B36',
  surfaceBright: '#2D3643',

  primary: '#90FF00',
  primaryDim: 'rgba(144, 255, 0, 0.15)',
  primaryMuted: 'rgba(144, 255, 0, 0.08)',

  foreground: '#E8ECF0',
  muted: '#8899A6',
  disabled: '#4A5568',

  border: '#2D3643',
  borderBright: '#3D4A5C',

  error: '#FF4D6A',
  success: '#4ADE80',
  warning: '#FBBF24',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type Colors = typeof colors;
