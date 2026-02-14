import type { Config } from 'tailwindcss';

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
        background: '#0F1419',
        surface: {
          DEFAULT: '#1A2029',
          elevated: '#232B36',
          bright: '#2D3643',
        },
        primary: {
          DEFAULT: '#90FF00',
          dim: 'rgba(144, 255, 0, 0.15)',
          muted: 'rgba(144, 255, 0, 0.08)',
        },
        foreground: '#E8ECF0',
        muted: {
          DEFAULT: '#8899A6',
          foreground: '#8899A6',
        },
        disabled: '#4A5568',
        border: {
          DEFAULT: '#2D3643',
          bright: '#3D4A5C',
        },
        error: '#FF4D6A',
        success: '#4ADE80',
        warning: '#FBBF24',
      },
    },
  },
  plugins: [],
} satisfies Config;
