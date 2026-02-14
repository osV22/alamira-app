# Monorepo Skeleton Design

Date: 2026-02-14

## Goal

Scaffold a bootable Turborepo monorepo with two Expo SDK 54 apps (Alamira Connect and Alamira SK) and two shared packages (ui, assets). The skeleton should launch on a device/simulator and verify workspace resolution end-to-end, but contain no business logic, services, or native dependencies yet.

## Approach

Use `create-expo-app` (pinned to SDK 54 template) to scaffold each app inside `apps/`, then wire up Turborepo and shared packages manually. This gives us Expo's official boilerplate per app with monorepo config layered on top.

## Package Manager

Yarn (v1 Classic) with workspaces.

## Directory Structure

```
alamira-app/
├── apps/
│   ├── connect/                  # Expo SDK 54, Expo Router v5, tabs
│   │   ├── app/
│   │   │   ├── _layout.tsx       # Root layout
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx   # Tab navigator (Dashboard, Devices, Settings)
│   │   │   │   ├── index.tsx     # Dashboard placeholder
│   │   │   │   ├── devices.tsx   # Devices placeholder
│   │   │   │   └── settings.tsx  # Settings placeholder
│   │   │   └── +not-found.tsx
│   │   ├── src/                  # Empty, ready for services/hooks/store
│   │   ├── app.json
│   │   ├── metro.config.js       # Monorepo-aware
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── sk/                       # Expo SDK 54, minimal Phase 2 placeholder
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   └── index.tsx     # "Coming soon" placeholder
│       │   └── +not-found.tsx
│       ├── metro.config.js
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   ├── index.ts          # Barrel export
│   │   │   └── theme.ts          # Brand colors, spacing, typography
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── assets/
│       ├── src/
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── turbo.json
├── package.json                  # Root (Yarn workspaces)
├── tsconfig.base.json            # Shared compiler options
└── .gitignore
```

## Key Config Decisions

1. **Yarn workspaces**: `"workspaces": ["apps/*", "packages/*"]` in root package.json
2. **Turborepo pipelines**: `dev`, `build`, `lint`, `typecheck`
3. **Metro config**: Each app uses `@expo/metro-config` with `watchFolders` for monorepo root and `nodeModulesPaths` for workspace resolution
4. **tsconfig paths**: `@/` maps to `./src/` in each app; packages resolved via workspace protocol
5. **Shared packages**: Raw TypeScript (`"main": "src/index.ts"`) — Metro handles transpilation, no build step needed
6. **Connect app**: 3 tabs (Dashboard, Devices, Settings) per architecture guide
7. **SK app**: Single tab with placeholder — proves monorepo works
8. **Both apps** import `@alamira/ui` to verify workspace resolution

## What's NOT Included

- No services, hooks, stores, or adapters
- No native dependencies (BLE, WiFi)
- No Zustand, AsyncStorage, or react-native-logs
- No EAS config
- No tests
- No Supabase or auth
