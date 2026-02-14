import type { Config } from 'tailwindcss';
import { colors } from '../../packages/ui/src/theme';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        surface: {
          DEFAULT: colors.surface,
          elevated: colors.surfaceElevated,
          bright: colors.surfaceBright,
        },
        primary: {
          DEFAULT: colors.primary,
          dim: colors.primaryDim,
          muted: colors.primaryMuted,
        },
        foreground: colors.foreground,
        muted: {
          DEFAULT: colors.muted,
          foreground: colors.muted,
        },
        disabled: colors.disabled,
        border: {
          DEFAULT: colors.border,
          bright: colors.borderBright,
        },
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
      },
    },
  },
  plugins: [],
} satisfies Config;
