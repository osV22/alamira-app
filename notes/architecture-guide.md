# Alamira Connect — Architecture Guide

Reference document for the Alamira Connect app (`apps/connect/`), the mobile companion that pairs with Alamira instrument displays.

---

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React Native + Expo (SDK 54) | SDK 55 is available but too fresh (Jan 2026). SDK 54 is stable and well-documented. |
| Routing | Expo Router v5 | File-based routing in `app/` directory |
| State | Zustand (^4.5) | Slices pattern, persisted via AsyncStorage |
| Auth / Backend | Supabase (deferred) | Not needed for MVP. Will add for auth, user management, device registry when ready. |
| BLE | react-native-ble-plx (^3.x) | Requires Expo dev client. Wrapped behind adapter. |
| Wi-Fi / Network | react-native-wifi-reborn + fetch | mDNS discovery for local devices |
| YAML | js-yaml (^4.1) | Parsing and serializing YAML configs |
| Logging | react-native-logs | Popular, well-supported logging library with multiple transports. PostHog for analytics later (separate concern). |
| Build | EAS Build + Dev Client | Required for native BLE/Wi-Fi modules |

### Why SDK 54 over 55

SDK 55 launched January 2026. AI tooling has limited knowledge of it and community adoption is still early. SDK 54 (Dec 2025) is battle-tested and all dependencies are confirmed compatible. We can upgrade to 55 later when the ecosystem catches up.

### Why Expo Router (not React Navigation directly)

Expo Router wraps React Navigation with file-based conventions. It reduces boilerplate, works well with Expo's tooling, and has first-class support for layouts, groups, and protected routes. No compelling reason to use raw React Navigation unless we hit an edge case.

---

## Project Structure

```
apps/connect/                         # Alamira Connect (within monorepo)
├── app/                              # Expo Router — routes only (thin wrappers)
│   ├── _layout.tsx                   # Root layout, providers
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab navigator
│   │   ├── index.tsx                 # Dashboard / Home
│   │   ├── devices.tsx               # Paired devices list
│   │   └── settings.tsx
│   ├── device/
│   │   └── [deviceId].tsx            # Device detail (dynamic)
│   ├── onboarding/
│   │   └── pair.tsx                  # Device pairing wizard
│   └── +not-found.tsx
│
├── src/
│   ├── components/                   # App-specific UI components
│   │   ├── common/                   # Button, Input, Card, etc.
│   │   └── device/                   # DeviceCard, StatusIndicator, etc.
│   │
│   ├── services/                     # Business logic — NO React, NO hooks
│   │   ├── ble/
│   │   │   ├── types.ts              # BLE domain types & interfaces
│   │   │   ├── adapter.ts            # Library-specific code (ble-plx)
│   │   │   └── BLEManager.ts         # Public API (uses adapter)
│   │   ├── network/
│   │   │   ├── types.ts
│   │   │   ├── discovery.ts          # mDNS / device discovery
│   │   │   ├── HttpClient.ts         # HTTP wrapper for device web servers
│   │   │   └── NetworkManager.ts     # Public API
│   │   ├── device/
│   │   │   ├── types.ts
│   │   │   ├── DeviceManager.ts      # Orchestrates BLE + Network for devices
│   │   │   └── registry.ts           # Paired device persistence
│   │   ├── config/
│   │   │   ├── types.ts
│   │   │   ├── validator.ts          # YAML schema validation
│   │   │   └── ConfigManager.ts      # Push configs to devices
│   │   ├── firmware/
│   │   │   ├── types.ts
│   │   │   └── FirmwareManager.ts    # Download + push firmware updates
│   │   └── logger/
│   │       └── logger.ts             # Centralized logger (react-native-logs)
│   │
│   ├── hooks/                        # React hooks — bridge services to UI
│   │   ├── useBLE.ts                 # BLE scanning, connection
│   │   ├── useDevices.ts             # Paired device list, device detail
│   │   ├── useNetwork.ts             # Wi-Fi state, device discovery
│   │   ├── useConfig.ts              # Config push operations
│   │   ├── useFirmware.ts            # Firmware update operations
│   │   └── usePermissions.ts         # OS permission requests
│   │
│   ├── store/                        # Zustand state
│   │   ├── index.ts                  # Combined store export
│   │   └── slices/
│   │       ├── bleSlice.ts
│   │       ├── deviceSlice.ts
│   │       ├── networkSlice.ts
│   │       └── appSlice.ts           # General app state (theme, onboarding)
│   │
│   ├── lib/                          # External library initialization
│   │   └── ble.ts                    # BLE library init
│   │
│   ├── types/                        # Shared TypeScript types
│   │   ├── device.ts                 # InstrumentDisplay, DeviceMetrics, etc.
│   │   └── navigation.ts            # Route params
│   │
│   ├── utils/
│   │   ├── constants.ts              # BLE UUIDs, timeouts, env vars
│   │   └── helpers.ts                # Small pure utility functions
│   │
│   └── assets/
│       ├── images/
│       └── fonts/
│
├── app.json                          # Expo config
├── eas.json                          # EAS Build config
├── tsconfig.json
├── .env.example
└── package.json
```

### Key Structural Decisions

**Routes are thin wrappers.** Files in `app/` import a component or hook and render. No business logic in route files. This keeps Expo Router's file conventions clean and avoids coupling navigation to implementation.

**Services have no React dependency.** Everything under `src/services/` is plain TypeScript classes/functions. They can be tested without React, swapped without touching UI, and reasoned about independently.

**Hooks bridge services to UI.** Hooks in `src/hooks/` subscribe to Zustand stores and call service methods. Components never import services directly.

**Adapter pattern for BLE.** `services/ble/adapter.ts` is the only file that imports `react-native-ble-plx`. `BLEManager.ts` depends on the adapter interface, not the library. Swapping BLE libraries = rewriting one file.

**Same adapter pattern for network.** `services/network/` isolates Wi-Fi and HTTP operations behind clean interfaces.

---

## Service Architecture

### Data Flow

```
Component → Hook → Zustand Action → Service → Adapter → OS/Device
                                                  ↓
                                            Event emitted
                                                  ↓
                                         Store state updated
                                                  ↓
                                         Component re-renders
```

### BLE Manager

The BLE manager handles all Bluetooth operations through a single entry point:

- **Scanning**: Start/stop scans, filter by service UUIDs, deduplicate results
- **Connection**: Connect/disconnect, track connection state per device
- **Communication**: Read/write characteristics, subscribe to notifications
- **Multi-device**: Connection pool supporting multiple simultaneous connections
- **Reconnection**: Exponential backoff with configurable retry limits

All BLE library calls go through `adapter.ts`. If we switch from `react-native-ble-plx` to another library, only `adapter.ts` changes.

### Network Manager

Handles Wi-Fi and local network operations:

- **Discovery**: mDNS-based discovery of instrument displays on local network
- **HTTP Client**: Wrapper around fetch for communicating with device web servers
- **State**: Track Wi-Fi connection status and available networks

### Device Manager

Orchestrates BLE + Network for device lifecycle:

- **Registry**: CRUD for paired devices (persisted locally in AsyncStorage)
- **Onboarding**: Step-by-step pairing flow coordination
- **State sync**: Keep device metadata current across BLE and Wi-Fi

### Config Manager

Handles YAML configuration for instrument displays:

- **Validation**: Schema validation before pushing configs
- **Push**: Send YAML to device via Wi-Fi HTTP endpoint
- **Versioning**: Track which config version each device is running

### Firmware Manager

Handles device software updates:

- **Download**: Fetch firmware from server with checksum verification
- **Push**: Transfer firmware to device (likely via Wi-Fi HTTP)
- **Progress**: Track and report update progress
- **Safety**: Verify checksums, support rollback

---

## Zustand Store Design

Using the **slices pattern** — one slice per domain, combined into a single store.

### Slices

| Slice | Responsibilities |
|-------|-----------------|
| `bleSlice` | Scan state, discovered devices, connection states |
| `deviceSlice` | Paired devices registry, selected device, device metadata |
| `networkSlice` | Wi-Fi state, discovered network devices |
| `appSlice` | General app state (onboarding complete, theme, etc.) |

Auth slice will be added when we introduce Supabase authentication post-MVP.

### Persistence Strategy

- **Persist**: Paired device list, app preferences
- **Don't persist**: BLE scan results, connection states, transient UI state
- **Storage**: AsyncStorage for general data. SecureStore will be added alongside auth for tokens.

### Store → Service Integration

Services emit events or call store actions — services never read from the store directly. This keeps services testable and decoupled from React.

```typescript
// Service emits event
bleManager.on('deviceConnected', (device) => { ... });

// Store subscribes and updates
bleManager.on('deviceConnected', (device) => {
  useStore.getState().setDeviceConnected(device.id, true);
});
```

---

## Logging Strategy

### Package: react-native-logs

We use `react-native-logs` — a well-established, widely-used logging library for React Native. It provides structured log levels, multiple transports, and colored console output out of the box.

Single logger instance at `src/services/logger/logger.ts`. All app code imports and uses this logger.

```typescript
import { logger } from '@/services/logger/logger';

logger.debug('BLE scan started', { timeout: 30000 });
logger.info('Device connected', { deviceId: 'abc123' });
logger.warn('Config push retry', { attempt: 2, deviceId: 'abc123' });
logger.error('Firmware update failed', error);
```

### Log Levels

| Level | Use |
|-------|-----|
| DEBUG | Verbose development info (filtered out in production) |
| INFO | Normal operations worth recording |
| WARN | Recoverable issues, retries |
| ERROR | Failures requiring attention |

### Transports

- **Development**: Console transport with colors (built into react-native-logs)
- **Production**: File transport for on-device logs. Remote error tracking can be added later.

### Future: PostHog for Analytics

PostHog will be added down the line for product analytics (feature usage, funnels, user behavior). This is separate from logging — PostHog tracks *what users do*, the logger tracks *what the app does*. They serve different purposes and will coexist.

### Guidelines

- Use the centralized logger, not `console.log`
- Exception: Quick temporary debugging during development is fine with `console.log` — just clean it up
- Include contextual data (device IDs, operation names) in log calls
- Don't log sensitive data (tokens, passwords, user PII)

---

## Authentication (Deferred — Post-MVP)

Auth is intentionally left out of the MVP. The app launches directly into the main experience with no login required.

### When We Add Auth

- **Provider**: Supabase (auth, user management, device registry sync)
- **Storage**: expo-secure-store for tokens
- **Route protection**: Add `(auth)` route group, auth gate in `_layout.tsx`
- **Store**: Add `authSlice` to Zustand
- **Service**: Add `src/services/auth/AuthService.ts`

The architecture is layered so none of this requires restructuring existing code — it's purely additive.

---

## Device Onboarding Flow

Step-by-step wizard for first-time pairing:

1. **Scan** — BLE scan for nearby instrument displays
2. **Select** — User picks their device from discovered list
3. **Connect** — Establish BLE connection, read device info
4. **Wi-Fi** — Optionally configure device's Wi-Fi credentials
5. **Name** — User names the device for easy identification
6. **Verify** — Test connection (BLE and/or Wi-Fi), confirm pairing
7. **Done** — Device added to registry, user returns to dashboard

### Multi-Device Support

- Users can pair multiple instrument displays
- Each device tracked independently in the device registry
- Dashboard shows all paired devices with connection status
- User selects a device to manage, push configs, or update firmware

---

## Key Dependencies

### Core
- `expo` ~54.0.0
- `expo-router` ~5.0.0
- `react-native` ~0.82.0
- `zustand` ^4.5.0
- `typescript` ^5.3.0

### Native (require dev client)
- `react-native-ble-plx` ^3.x (verify SDK 54 compat before finalizing)
- `react-native-wifi-reborn` ^4.3.0

### Backend (deferred — post-MVP)
- `@supabase/supabase-js` ^2.39.0
- `expo-secure-store` ^14.0.0

### Utilities
- `js-yaml` ^4.1.0 (YAML parsing)
- `react-native-logs` ^5.2.0 (centralized logging)
- `@react-native-async-storage/async-storage` ^1.23.0

### Dev
- `@testing-library/react-native` ^12.4.0
- `jest` ^29.7.0
- `eslint` + `prettier`

---

## Claude Code Project Configuration

We rely heavily on **project-level** `.claude/` configuration rather than user-level or universal settings. This keeps all Claude Code behavior version-controlled and consistent across machines.

### `.claude/` Directory

```
.claude/
├── settings.json          # Project-level permissions, allowed/denied tools
├── plans/                 # Implementation plans (created during plan mode)
├── skills/                # Custom skills for this project
└── hooks/                 # Pre/post hooks for tool execution
```

### Why Project-Level

- **Reproducible**: Anyone cloning the repo gets the same Claude Code behavior
- **Version controlled**: Permission changes are tracked in git
- **Project-specific**: BLE/device-related skills and hooks don't leak into other projects
- **Collaborative**: Team members don't need to configure their local Claude Code settings

### CLAUDE.md

The `CLAUDE.md` file at the repo root is the primary instruction file for Claude Code. It contains project context, architecture rules, coding conventions, and behavioral guidelines. Claude reads this automatically at the start of every session.

---

## Patterns to Follow

1. **Adapter pattern** for external libraries (BLE, Wi-Fi). One file touches the library; everything else depends on our interface.
2. **Service layer** for all business logic. No React. No hooks. Plain TypeScript.
3. **Hooks as bridge** between services/stores and components.
4. **Thin route files** in `app/`. Import and render — nothing more.
5. **Centralized logger** instead of scattered console.log.
6. **Zustand slices** for domain-specific state. Persist selectively.
7. **Types first** — define interfaces before implementing. Helps AI tooling and humans alike.

## Anti-Patterns to Avoid

1. **Don't import BLE/Wi-Fi libraries directly in components or hooks.** Always go through the service layer.
2. **Don't put business logic in route files or components.** Keep them presentational.
3. **Don't over-abstract prematurely.** One adapter file is enough until we actually need to swap a library.
4. **Don't persist everything.** Transient state (scan results, connection state) should not be in AsyncStorage.
5. **Don't scatter console.log.** Use the centralized logger.
6. **Don't create helpers for one-time operations.** Three lines of inline code beats a premature utility function.
