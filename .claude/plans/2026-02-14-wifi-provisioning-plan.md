# WiFi Provisioning Implementation Plan

**Date:** 2026-02-14
**Design doc:** `docs/plans/2026-02-14-wifi-provisioning-design.md`
**App:** Alamira Connect (`apps/connect/`)
**Parallelism:** Up to 6 agents can work concurrently on non-overlapping files

---

## File Matrix

Every file this plan creates or modifies, organized by layer. Use this to quickly check what a phase touches and whether agents can run in parallel (no two agents should write the same file).

### New Files Created

| File | Phase | Layer | Description |
|------|-------|-------|-------------|
| `src/services/logger/logger.ts` | 1 | Service | Centralized logger (react-native-logs) |
| `src/services/wifi/types.ts` | 2 | Types | WiFiNetwork, DeviceInfo, ProvisionRequest interfaces |
| `src/services/device/types.ts` | 2 | Types | PairedDevice, OnboardingStep, QR payload types |
| `src/services/qr/types.ts` | 2 | Types | AlamiraQRPayload schema |
| `src/services/qr/parser.ts` | 2 | Service | QR JSON validation + parsing |
| `src/services/wifi/adapter.ts` | 3 | Adapter | Real HTTP calls to device API |
| `src/services/wifi/WifiProvisioningService.ts` | 3 | Service | Orchestrates provisioning flow |
| `src/services/device/DeviceManager.ts` | 3 | Service | Paired device CRUD |
| `src/services/device/registry.ts` | 3 | Service | AsyncStorage persistence for paired devices |
| `src/store/index.ts` | 4 | Store | Combined Zustand store |
| `src/store/slices/onboardingSlice.ts` | 4 | Store | Wizard state (transient) |
| `src/store/slices/deviceSlice.ts` | 4 | Store | Paired devices (persisted) |
| `src/hooks/useOnboarding.ts` | 5 | Hook | Wizard actions + step transitions |
| `src/hooks/useDevices.ts` | 5 | Hook | Paired device list + CRUD |
| `app/onboarding/_layout.tsx` | 6 | Route | Modal stack layout for wizard |
| `app/onboarding/scan.tsx` | 6 | Route | Step 1: QR scanner screen |
| `app/onboarding/connecting.tsx` | 6 | Route | Step 2: Connecting animation |
| `app/onboarding/wifi-setup.tsx` | 6 | Route | Step 3: WiFi network picker |
| `app/onboarding/verifying.tsx` | 6 | Route | Step 4: Verifying connection |
| `app/onboarding/name-device.tsx` | 6 | Route | Step 5: Name the display |
| `app/onboarding/configure.tsx` | 6 | Route | Step 6: Config placeholder |
| `app/onboarding/complete.tsx` | 6 | Route | Step 7: Success screen |

### Modified Files

| File | Phase(s) | What changes |
|------|----------|-------------|
| `apps/connect/package.json` | 1 | Add zustand, async-storage, react-native-logs, expo-camera |
| `apps/connect/app/_layout.tsx` | 6 | Add onboarding modal stack to root navigator |
| `apps/connect/app/(tabs)/devices.tsx` | 7 | Wire "Scan for Devices" → onboarding flow, show paired devices |
| `apps/connect/app/(tabs)/index.tsx` | 7 | Wire dashboard buttons, show connected device status |

---

## Phase 1: Foundation — Dependencies & Logger

**Goal:** Install packages and set up centralized logging.

**Files touched:**
- `apps/connect/package.json` (modify)
- `src/services/logger/logger.ts` (create)

**Tasks:**
1. Install dependencies from `apps/connect/`:
   ```
   zustand ^4.5
   @react-native-async-storage/async-storage ^2.1
   react-native-logs ^5.2
   expo-camera ~16.1
   ```
2. Create `src/services/logger/logger.ts` — configure react-native-logs with transport and severity levels

**Parallel:** Single agent (package.json install + logger are quick sequential tasks)

---

## Phase 2: Types — Define All Interfaces First

**Goal:** Define every TypeScript interface before implementing anything. Types-first per architecture rules.

**Files touched:**
- `src/services/wifi/types.ts` (create)
- `src/services/device/types.ts` (create)
- `src/services/qr/types.ts` (create)

**Tasks:**

### 2A: WiFi service types (`src/services/wifi/types.ts`)
```typescript
// Key interfaces:
WiFiNetwork          // ssid, rssi, security
DeviceInfo           // device_id, model, firmware_version, serial
ProvisionRequest     // ssid, password
ProvisionResponse    // success, ip
WifiScanResponse     // networks[]
WifiAdapterInterface // getDeviceInfo(), scanNetworks(), provision()
```

### 2B: Device types (`src/services/device/types.ts`)
```typescript
// Key interfaces:
PairedDevice         // id, name, ip, model, firmware, paired_at
DeviceStatus         // online, uptime, wifi_rssi, ip, ssid
OnboardingStep       // union: 'scan' | 'connecting' | 'wifi-setup' | 'verifying' | 'name' | 'configure' | 'complete'
OnboardingState      // step, qrData, deviceInfo, selectedNetwork, deviceName, error
```

### 2C: QR types + parser (`src/services/qr/`)
```typescript
// types.ts:
AlamiraQRPayload     // ap_ssid, ap_pass, device_id, api_port

// parser.ts:
parseQRPayload(raw: string): AlamiraQRPayload | null
```

**Parallel:** 3 agents — one per file (2A, 2B, 2C). No overlapping files.

---

## Phase 3: Service Layer — Adapters & Business Logic

**Goal:** Build the real adapter, provisioning service, and device manager.

**Files touched:**
- `src/services/wifi/adapter.ts` (create)
- `src/services/wifi/WifiProvisioningService.ts` (create)
- `src/services/device/DeviceManager.ts` (create)
- `src/services/device/registry.ts` (create)

**Tasks:**

### 3A: Real adapter (`src/services/wifi/adapter.ts`)
- Implements `WifiAdapterInterface`
- Makes actual HTTP calls to `http://{host}:{port}/api/*`
- `getDeviceInfo()` → `GET /api/info`
- `scanNetworks()` → `GET /api/wifi/scan`
- `provision(ssid, password)` → `POST /api/provision`
- Proper error handling, timeouts, response parsing
- Logs all calls via logger

### 3B: Provisioning service (`src/services/wifi/WifiProvisioningService.ts`)
- Takes an adapter via constructor injection
- `connectToDevice(qrData)` → calls adapter.getDeviceInfo()
- `scanNetworks()` → calls adapter.scanNetworks()
- `provision(ssid, password)` → calls adapter.provision()
- `verifyConnection(deviceId)` → calls adapter.getDeviceInfo() on real network
- Handles timeouts, retries, error mapping
- No React imports, no hooks — pure TypeScript

### 3C: Device manager + registry (`src/services/device/`)
- `registry.ts` — AsyncStorage CRUD for paired devices
- `DeviceManager.ts` — add, remove, list, get paired devices. Wraps registry.

**Parallel:** 3 agents (3A, 3B, 3C). No overlapping files.

---

## Phase 4: Zustand Store

**Goal:** Create the store with slices for onboarding state and paired devices.

**Files touched:**
- `src/store/slices/onboardingSlice.ts` (create)
- `src/store/slices/deviceSlice.ts` (create)
- `src/store/index.ts` (create)

**Tasks:**

### 4A: Onboarding slice (`src/store/slices/onboardingSlice.ts`)
- `step: OnboardingStep`
- `qrData: AlamiraQRPayload | null`
- `deviceInfo: DeviceInfo | null`
- `networks: WiFiNetwork[]`
- `selectedNetwork: string | null`
- `deviceName: string`
- `error: string | null`
- `isLoading: boolean`
- Actions: `setStep()`, `setQRData()`, `setDeviceInfo()`, `setNetworks()`, `setError()`, `reset()`
- **NOT persisted** — transient wizard state

### 4B: Device slice (`src/store/slices/deviceSlice.ts`)
- `devices: PairedDevice[]`
- Actions: `addDevice()`, `removeDevice()`, `updateDevice()`
- **Persisted** via AsyncStorage middleware

### 4C: Store index (`src/store/index.ts`)
- Combines slices into single store
- Configures AsyncStorage persistence for deviceSlice only

**Parallel:** 3 agents (4A, 4B, 4C). 4C can be written to import from 4A/4B — the import paths are known in advance.

---

## Phase 5: Hooks

**Goal:** Bridge services and store to UI components.

**Files touched:**
- `src/hooks/useOnboarding.ts` (create)
- `src/hooks/useDevices.ts` (create)

**Tasks:**

### 5A: `useOnboarding` hook
- Reads onboarding state from store
- Exposes actions: `startOnboarding()`, `handleQRScan(data)`, `sendCredentials(ssid, pass)`, `nameDevice(name)`, `completeOnboarding()`, `cancelOnboarding()`
- Each action calls the provisioning service, updates the store, and advances the step
- Instantiates `WifiProvisioningService` with the real adapter

### 5B: `useDevices` hook
- Reads device list from store
- Exposes: `devices`, `addDevice()`, `removeDevice()`, `getDevice(id)`
- Wraps `DeviceManager` calls

**Parallel:** 2 agents (5A, 5B). No overlapping files.

---

## Phase 6: Onboarding Screens

**Goal:** Build the 7-step onboarding wizard as a modal route group.

**Files touched:**
- `app/onboarding/_layout.tsx` (create)
- `app/onboarding/scan.tsx` (create)
- `app/onboarding/connecting.tsx` (create)
- `app/onboarding/wifi-setup.tsx` (create)
- `app/onboarding/verifying.tsx` (create)
- `app/onboarding/name-device.tsx` (create)
- `app/onboarding/configure.tsx` (create)
- `app/onboarding/complete.tsx` (create)
- `app/_layout.tsx` (modify — add onboarding modal group)

**Tasks:**

### 6A: Onboarding layout (`app/onboarding/_layout.tsx`)
- Modal `Stack` navigator
- `gestureEnabled: false` (no swipe dismiss)
- Dark background, no header
- Register in root `_layout.tsx` as modal presentation

### 6B: Scan screen (`app/onboarding/scan.tsx`)
- Camera viewfinder using `expo-camera`
- Overlay frame with instructions
- Calls `useOnboarding().handleQRScan()` on scan
- Auto-navigates to next step on success
- Error display for invalid QR codes

### 6C: Connecting screen (`app/onboarding/connecting.tsx`)
- Full-screen animation (pulsing icon or spinner)
- "Connecting to your display..." text
- Calls `useOnboarding()` — connecting happens via the hook
- Auto-navigates on success, shows retry on failure

### 6D: WiFi setup screen (`app/onboarding/wifi-setup.tsx`)
- List of WiFi networks from `useOnboarding().networks`
- Each row: network name, signal strength indicator, security icon
- Tap network → password input modal
- Submit calls `useOnboarding().sendCredentials()`

### 6E: Verifying screen (`app/onboarding/verifying.tsx`)
- Similar to connecting — animation + status text
- "Finding your display on the network..."
- Auto-navigates on success

### 6F: Name device screen (`app/onboarding/name-device.tsx`)
- `TextInput` with default name from device model
- "Continue" button calls `useOnboarding().nameDevice()`

### 6G: Configure + Complete screens
- `configure.tsx` — placeholder: "Using default configuration" + Continue button
- `complete.tsx` — success checkmark, device summary, "Go to Dashboard" button

### 6H: Root layout update (`app/_layout.tsx`)
- Add `<Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />`

**Parallel:** Up to 6 agents. Group into:
- Agent 1: 6A (layout) + 6H (root layout update) — these two are related
- Agent 2: 6B (scan)
- Agent 3: 6C (connecting) + 6E (verifying) — identical pattern
- Agent 4: 6D (wifi-setup)
- Agent 5: 6F (name-device)
- Agent 6: 6G (configure + complete) — both are simple screens

---

## Phase 7: Wire Up Existing Screens

**Goal:** Connect the existing tab screens to the new onboarding flow and paired device data.

**Files touched:**
- `app/(tabs)/devices.tsx` (modify)
- `app/(tabs)/index.tsx` (modify)

**Tasks:**

### 7A: Devices screen (`app/(tabs)/devices.tsx`)
- Show paired devices list (from `useDevices()`)
- Each device: name, model, IP, status indicator
- "Add Device" button → navigates to `onboarding/scan`
- Empty state still shows when no devices paired
- Swipe to delete or long-press to remove

### 7B: Dashboard screen (`app/(tabs)/index.tsx`)
- "Scan for Devices" button → navigates to `onboarding/scan`
- If device paired: show connected device card with status
- StatusBadge reflects actual connection state

**Parallel:** 2 agents (7A, 7B). No overlapping files.

---

## Phase Summary

| Phase | Description | Files | Agents | Depends on |
|-------|-------------|-------|--------|------------|
| 1 | Dependencies + Logger | 2 | 1 | — |
| 2 | Types (interfaces) | 3 | 3 | Phase 1 (logger) |
| 3 | Services + Adapters | 5 | 4 | Phase 2 (types) |
| 4 | Zustand Store | 3 | 3 | Phase 2 (types) |
| 5 | Hooks | 2 | 2 | Phase 3 + 4 |
| 6 | Onboarding Screens | 9 | 6 | Phase 5 (hooks) |
| 7 | Wire Existing Screens | 2 | 2 | Phase 5 + 6 |

**Total new files:** 22
**Total modified files:** 4
**Phases 3 & 4 can run in parallel** (services and store are independent, both depend on types).

---

## Post-Implementation: Device Simulator (Next Project)

After all 7 phases, the app will work end-to-end with mock data. The next project is building a device simulator in `tools/simulator/` that:
- Runs a Node.js HTTP server implementing the device API contract
- Generates a QR code in the browser for the app to scan
- Shows live request logs as the app communicates with it
- Lets you test the real adapter (`src/services/wifi/adapter.ts`) against simulated hardware

This is a separate plan — not part of this implementation.

---

## Execution Notes

- All paths are relative to `apps/connect/` unless they start with `app/` (which is `apps/connect/app/`)
- Use mock adapter by default in `__DEV__` mode
- Follow existing code style: NativeWind classes, `@alamira/ui` components, Iconoir icons
- Keep route files thin — import hook, render UI, nothing else
- No `console.log` — use the centralized logger
