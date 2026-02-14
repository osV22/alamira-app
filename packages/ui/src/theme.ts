/**
 * Alamira dark theme tokens — single source of truth.
 *
 * Every color in the app should reference this file.
 * Tailwind configs import from here; components use `colors.*`.
 */

/** Convert a hex color (#RRGGBB) to an rgba string. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const primary = '#34FF85';
const surface = '#1A2029';
const border = '#2D3643';

export const colors = {
  background: '#0F1419',
  surface,
  surfaceElevated: '#232B36',
  surfaceBright: border,

  primary,
  primaryDim: hexToRgba(primary, 0.15),
  primaryMuted: hexToRgba(primary, 0.08),

  foreground: '#E8ECF0',
  muted: '#8899A6',
  disabled: '#4A5568',

  border,
  borderBright: '#3D4A5C',

  /** Semi-transparent surface for overlays (e.g. floating tab bar). */
  surfaceTranslucent: hexToRgba(surface, 0.92),
  /** Semi-transparent border for overlays. */
  borderTranslucent: hexToRgba(border, 0.6),

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
