# Monorepo Skeleton Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold a bootable Turborepo monorepo with two Expo SDK 54 apps and two shared packages, ready for feature development.

**Architecture:** Yarn workspaces monorepo with Turborepo orchestration. Each app is scaffolded via `create-expo-app` then adapted for monorepo. Shared packages export raw TypeScript (no build step).

**Tech Stack:** React Native, Expo SDK 54, Expo Router v5, Turborepo, Yarn v1, TypeScript

---

## Parallelism Map

Tasks 1-3 can run in parallel (no dependencies).
Task 4 depends on Tasks 1-3 completing.
Task 5 depends on Task 4.

```
[Task 1: Root config]  ──┐
[Task 2: packages/ui]  ──┼──→ [Task 4: Wire monorepo] → [Task 5: Verify]
[Task 3: packages/assets]┘
```

Connect and SK apps are created as part of Task 4 (via create-expo-app), after root config exists.

---

### Task 1: Root Monorepo Configuration

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

**Step 1: Create root package.json**

```json
{
  "name": "alamira",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "yarn@1.22.22"
}
```

**Step 2: Create turbo.json**

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "exclude": ["node_modules"]
}
```

**Step 4: Create .gitignore**

Standard Expo + monorepo gitignore:
- `node_modules/`, `.expo/`, `dist/`, `.turbo/`
- OS files (`.DS_Store`, `Thumbs.db`)
- Build outputs, environment files

**Step 5: Run `yarn install` to create lockfile and install turbo**

Run: `yarn install`
Expected: `yarn.lock` created, turbo installed in root `node_modules`

---

### Task 2: Create packages/ui

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/theme.ts`
- Create: `packages/ui/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@alamira/ui",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create src/theme.ts**

Alamira brand theme tokens:
- Colors: brand primary (ocean blue), secondary, background, text, surface, border, accent, error, success, warning
- Spacing scale: xs through 3xl
- Font sizes: xs through 3xl
- Border radii: sm, md, lg, xl, full

**Step 4: Create src/index.ts**

Barrel export of theme: `export { theme } from './theme';`

---

### Task 3: Create packages/assets

**Files:**
- Create: `packages/assets/package.json`
- Create: `packages/assets/tsconfig.json`
- Create: `packages/assets/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@alamira/assets",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create tsconfig.json and src/index.ts**

tsconfig extends base. `src/index.ts` exports a placeholder comment noting this is where brand assets (logos, fonts) will be added.

---

### Task 4: Scaffold Expo Apps and Wire Monorepo

**Depends on:** Tasks 1, 2, 3

This task creates both Expo apps using `create-expo-app` and wires them into the monorepo.

**Step 1: Create apps directory**

```bash
mkdir -p apps
```

**Step 2: Scaffold Connect app**

```bash
cd apps && npx create-expo-app@latest connect --template tabs
```

This gives us Expo Router v5 with a tabs template. After scaffolding:

- Update `apps/connect/package.json`:
  - Set `"name": "alamira-connect"`
  - Add `@alamira/ui` and `@alamira/assets` as workspace dependencies (`"*"`)
  - Ensure scripts include `dev`, `build`, `lint`, `typecheck`
- Update `apps/connect/metro.config.js` for monorepo:
  - Add `watchFolders` pointing to monorepo root
  - Add `nodeModulesPaths` for root and app `node_modules`
- Update `apps/connect/tsconfig.json`:
  - Extend `../../tsconfig.base.json`
  - Add `@/*` path alias to `./src/*`
- Update `apps/connect/app.json`:
  - Set `name` to "Alamira Connect"
  - Set `slug` to "alamira-connect"
  - Update `scheme` to "alamira-connect"

**Step 3: Customize Connect app routes**

Replace the generated tab routes to match our architecture:
- `app/(tabs)/index.tsx` — Dashboard tab (placeholder with Alamira branding)
- `app/(tabs)/devices.tsx` — Devices tab (placeholder)
- `app/(tabs)/settings.tsx` — Settings tab (placeholder)
- `app/(tabs)/_layout.tsx` — Tab layout with Dashboard, Devices, Settings tabs
- `app/_layout.tsx` — Root layout
- Import and use `theme` from `@alamira/ui` in at least one screen to verify workspace resolution

**Step 4: Scaffold SK app**

```bash
cd apps && npx create-expo-app@latest sk --template tabs
```

After scaffolding:

- Update `apps/sk/package.json`:
  - Set `"name": "alamira-sk"`
  - Add workspace dependencies
- Apply same metro.config.js and tsconfig.json monorepo adjustments as Connect
- Update `apps/sk/app.json`:
  - Set `name` to "Alamira SK"
  - Set `slug` to "alamira-sk"

**Step 5: Simplify SK routes**

Replace generated routes with a single minimal tab:
- `app/(tabs)/index.tsx` — "Alamira SK — Coming Soon" placeholder
- `app/(tabs)/_layout.tsx` — Single tab layout
- Import from `@alamira/ui` to verify resolution

**Step 6: Create empty src/ directories**

```bash
mkdir -p apps/connect/src
mkdir -p apps/sk/src
```

**Step 7: Run yarn install from root**

```bash
cd /path/to/alamira-app && yarn install
```

Resolves all workspace dependencies, hoists shared deps.

---

### Task 5: Verify Everything Works

**Depends on:** Task 4

**Step 1: Verify turbo can see all workspaces**

Run: `yarn turbo run build --dry-run`
Expected: Shows all 4 packages (connect, sk, ui, assets)

**Step 2: Run typecheck**

Run: `yarn typecheck`
Expected: No TypeScript errors

**Step 3: Boot Connect app**

Run: `cd apps/connect && npx expo start`
Expected: Expo dev server starts, app loads with 3 tabs

**Step 4: Boot SK app**

Run: `cd apps/sk && npx expo start`
Expected: Expo dev server starts, shows "Coming Soon" screen

**Step 5: Verify workspace imports work**

Both apps should import `theme` from `@alamira/ui` without errors at runtime.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold monorepo with Expo SDK 54 apps and shared packages"
```
