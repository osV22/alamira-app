# Alamira Monorepo

Turborepo monorepo containing two React Native Expo apps for the Alamira marine instrument ecosystem.

## Apps

- **Alamira Connect** (`apps/connect/`) — Hardware companion app. Pairs with Alamira instrument displays via BLE, pushes YAML configs, handles firmware updates. Current priority (manufacturer demo).
- **Alamira SK** (`apps/sk/`) — Free boat instrument display app. Connects to Signal K / NMEA sources to show real-time boat data. Phase 2 (lead gen / sales funnel for hardware).

## Shared Packages

- `packages/ui/` — Shared UI components, theme, brand colors
- `packages/assets/` — Shared logos, fonts, brand assets

Add new shared packages only when two or more apps need the same code. Do not prematurely extract.

## Stack

- React Native + Expo SDK 54 (not 55)
- Expo Router v5 (file-based routing)
- Zustand ^4.5 (slices pattern, persisted via AsyncStorage)
- TypeScript ^5.3
- Turborepo (local only, no Vercel cloud services)
- EAS Build + Dev Client (required for BLE/WiFi native modules)

## Architecture Rules

These apply to all apps in the monorepo.

### Data Flow
```
Component → Hook → Zustand Action → Service → Adapter → OS/Device
```

### Patterns
1. **Adapter pattern** for native libraries (BLE, WiFi). One file imports the library; everything else depends on our interface.
2. **Service layer** for all business logic. No React. No hooks. Plain TypeScript classes/functions.
3. **Hooks bridge** services and stores to components. Components never import services directly.
4. **Thin route files** in `app/`. Import and render — nothing more.
5. **Zustand slices** for domain-specific state. Persist selectively (paired devices, preferences = yes; scan results, connection state = no).
6. **Types first** — define interfaces before implementing.
7. **Centralized logger** (`react-native-logs`) instead of `console.log`.

### Anti-Patterns
- Don't import native libraries (BLE, WiFi) directly in components or hooks. Go through the service layer.
- Don't put business logic in route files or components.
- Don't over-abstract prematurely. One adapter file per library is enough.
- Don't persist transient state (scan results, connection state).
- Don't create helpers for one-time operations.

## Constraints

- **No Vercel cloud services.** Turborepo as a local tool is fine. No Vercel hosting, remote caching, or deployment. Ever.
- **No Supabase for MVP.** Auth and cloud sync are deferred. Everything persists locally for now.
- **Expo SDK 54 only.** Do not upgrade to 55 without explicit approval.
- **Apps ship via App Store / Google Play.** Normal native apps, no web hosting needed.

## Git Workflow

- **`/commit`** — Stage all changes, craft a descriptive commit message, update CHANGELOG.md, and push. Fully automatic, no prompts.
- **`/commit-fast`** — Same as `/commit` but fully automatic. No prompts, no changelog, just stage → commit → push.
- **Do not `git push` outside of `/commit` or `/commit-fast`.** A PreToolUse hook guards against accidental pushes.
- **Do not create or switch branches** without user confirmation (also hook-guarded).
- **Never force push.** The hook blocks it even from `/commit` skills.

## Key Docs

- `notes/architecture-guide.md` — Detailed architecture for Alamira Connect (services, stores, BLE, onboarding flow)
- `.claude/plans/2026-02-14-alamira-project-design.md` — Project design decisions and rationale
- `notes/boat-insturments-idea.md` — Signal K / NMEA research for Alamira SK

## Commands

```bash
# Development (from monorepo root)
turbo dev                    # Run dev server for all apps
turbo build                  # Build all apps
turbo lint                   # Lint all apps and packages

# Single app
turbo dev --filter=connect   # Run Alamira Connect only
turbo dev --filter=sk        # Run Alamira SK only

# Expo (from app directory)
npx expo start               # Start Expo dev server
npx expo run:ios             # Build and run on iOS
npx expo run:android         # Build and run on Android
eas build --platform ios     # Cloud build via EAS
```
