# Alamira UI Design System

**Date:** 2026-02-14
**Status:** Approved

## Overview

Dark, modern UI system for both Alamira apps using NativeWind v4 (Tailwind CSS for React Native). Dark slate/blue-gray base with `#90FF00` electric lime-green as the primary accent.

## Color Palette

| Token | Hex | Tailwind Class | Use |
|-------|-----|----------------|-----|
| background | `#0F1419` | `bg-background` | App background |
| surface | `#1A2029` | `bg-surface` | Cards, sheets |
| surface-elevated | `#232B36` | `bg-surface-elevated` | Elevated cards, modals |
| surface-bright | `#2D3643` | `bg-surface-bright` | Hover states, input bg |
| primary | `#90FF00` | `text-primary` / `bg-primary` | Buttons, links, active states |
| primary-dim | `rgba(144,255,0,0.15)` | `bg-primary-dim` | Ghost button fills |
| primary-muted | `rgba(144,255,0,0.08)` | `bg-primary-muted` | Subtle background tints |
| text | `#E8ECF0` | `text-foreground` | Primary text |
| text-secondary | `#8899A6` | `text-muted` | Secondary text |
| text-disabled | `#4A5568` | `text-disabled` | Disabled text |
| border | `#2D3643` | `border-border` | Default borders |
| border-bright | `#3D4A5C` | `border-border-bright` | Focus borders |
| error | `#FF4D6A` | `text-error` | Error states |
| success | `#4ADE80` | `text-success` | Success states |
| warning | `#FBBF24` | `text-warning` | Warning states |

## Components

### Core

- **Button** — Variants: `solid` (lime bg, dark text), `ghost` (lime border, dim fill, lime text), `outline` (subtle border, no fill). Sizes: `sm`, `md`, `lg`.
- **Card** — Dark surface, subtle border, rounded `lg`. Optional header/footer slots.
- **TextInput** — Dark bg, border, lime-green focus ring. Label + error message support.
- **StatusBadge** — Small pill for status indicators. Variants: `connected` (green), `disconnected` (red), `scanning` (amber pulse).
- **ScreenContainer** — SafeAreaView + dark background + consistent padding. Wraps every screen.

### Navigation

- **Custom TabBar** — Bottom bar, dark surface-elevated background, lime-green active indicator with pill highlight. Icons + labels. Subtle glow effect on active tab.
- **Header** — Dark background, screen title, optional left/right action buttons. Clean, minimal.

## Tech Stack

- **NativeWind v4** — Tailwind CSS compiled to React Native styles
- **Custom tailwind.config.ts** — Extends default with Alamira dark palette
- **@alamira/ui package** — Houses NativeWind config, shared components, and theme
- Replaces the existing `theme.ts` light-mode tokens

## Architecture

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── TextInput.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ScreenContainer.tsx
│   │   ├── TabBar.tsx
│   │   └── Header.tsx
│   ├── theme.ts          (updated — dark palette + NativeWind tokens)
│   └── index.ts          (barrel exports)
├── tailwind.config.ts
└── package.json
```

Apps import from `@alamira/ui` and use NativeWind className props.

## Design Decisions

1. **Dark-only** — No light mode toggle for now. Simpler, focused.
2. **NativeWind over StyleSheet** — Faster to write, Tailwind DX, AI-friendly.
3. **Ghost button style** — Semi-transparent fill + full-opacity border for the "ghosty" effect.
4. **Custom TabBar** — Replaces default React Navigation tab bar for a modern, branded look.
5. **Slate/blue-gray, not pure black** — Warmer, more depth, easier on the eyes.
