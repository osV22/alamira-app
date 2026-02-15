# Simulator Stub Mode, Product Registration, Firmware Update & Home Redesign

**Date:** 2026-02-15
**Status:** Ready for execution
**Parallel agents:** Up to 6

---

## Overview

Add an in-app simulator stub mode to Alamira Connect so the full onboarding flow can be demonstrated without real hardware. This includes two new onboarding screens (product info and firmware update), modifications to the hook/store/service layers, and a redesigned home screen that is device-centric.

### What changes

1. **Simulator service** — pure TypeScript mock data generator (no network calls)
2. **Product info screen** — shows device details after connecting (real or simulated)
3. **Firmware update screen** — compares versions, runs fake progress bar, supports skip
4. **Onboarding flow changes** — new steps inserted, sim mode skips WiFi/verify steps
5. **Home screen redesign** — device-centric card list with empty state and FAB
6. **Store/hook updates** — `isSimulated` flag, new actions for sim + firmware flows

### What does NOT change

- `apps/simulator/` (the separate simulator app) is untouched
- `packages/ui/` components are used as-is (no new shared components)
- WiFi adapter, WiFi provisioning service, QR parser are unchanged
- `deviceSlice.ts` is unchanged (addDevice/removeDevice already works)
- `store/index.ts` is unchanged (onboardingSlice already wired in)

---

## Navigation Flow

### Current flow (real mode)
```
scan → connecting → wifi-setup → verifying → name-device → configure → complete
```

### New flow (real mode)
```
scan → connecting → product-info → firmware-update → wifi-setup → verifying → name-device → configure → complete
```

### New flow (sim mode)
```
scan → product-info → firmware-update → name-device → complete
```

Sim mode skips: `connecting`, `wifi-setup`, `verifying`, `configure`.

---

## File Matrix

Every file that gets created or modified, which phase it belongs to, which agent owns it, and the risk level.

| # | File Path | Action | Phase | Agent | Changes | Risk |
|---|-----------|--------|-------|-------|---------|------|
| 1 | `src/services/device/types.ts` | MODIFY | 1 | A1 | Add `'product-info' \| 'firmware-update'` to `OnboardingStep`; add `FirmwareUpdateInfo` interface | Low |
| 2 | `src/services/simulator/types.ts` | CREATE | 1 | A1 | `SimulatedDeviceCatalog` type, `SimulatedDevice` interface | Low |
| 3 | `src/services/simulator/SimulatorService.ts` | CREATE | 1 | A1 | Static mock data generator: `getSimulatedQRPayload()`, `getSimulatedDeviceInfo()`, `getSimulatedFirmwareUpdate()` | Low |
| 4 | `src/store/slices/onboardingSlice.ts` | MODIFY | 1 | A2 | Add `isSimulated: boolean` to state, `setIsSimulated` action, `firmwareProgress: number`, `setFirmwareProgress` action | Low |
| 5 | `src/hooks/useOnboarding.ts` | MODIFY | 2 | A1 | Add `simulateDevice()`, `checkFirmwareUpdate()`, `applyFirmwareUpdate()`, `skipFirmwareUpdate()` actions; modify `completeOnboarding()` to handle sim flow | Med |
| 6 | `app/onboarding/product-info.tsx` | CREATE | 3 | A1 | Product registration screen: device icon placeholder, model, serial, firmware version, "Continue" button | Low |
| 7 | `app/onboarding/firmware-update.tsx` | CREATE | 3 | A2 | Firmware update screen: version comparison, animated progress bar (0-100% over 3s), "Skip" option | Med |
| 8 | `app/(tabs)/index.tsx` | MODIFY | 3 | A3 | Full redesign: device-centric card list, empty state with illustration, FAB to add device | Med |
| 9 | `app/onboarding/scan.tsx` | MODIFY | 3 | A4 | Add "Simulate Device" dev button below QR frame (gated by `__DEV__`) | Low |
| 10 | `app/onboarding/_layout.tsx` | MODIFY | 3 | A5 | Add `product-info` and `firmware-update` Stack.Screen entries | Low |
| 11 | `app/onboarding/connecting.tsx` | MODIFY | 3 | A5 | Navigate to `product-info` instead of `wifi-setup` after connection | Low |
| 12 | `app/onboarding/complete.tsx` | MODIFY | 3 | A6 | Handle sim flow: skip showing WiFi-related info if `isSimulated` | Low |
| 13 | `app/onboarding/name-device.tsx` | MODIFY | 3 | A6 | In sim mode, after naming navigate to `complete` (skip `configure`); read `isSimulated` from store | Low |
| 14 | `src/services/logger/logger.ts` | MODIFY | 1 | A1 | Add `simLog` export for simulator service logging | Low |

---

## Phase 1: Foundation (Types, Services, Store)

**Goal:** Build the data layer. No React code. All plain TypeScript.
**Parallelism:** 2 agents, fully independent.

### Agent A1 — Types + Simulator Service

**Files owned:**
- `src/services/device/types.ts` (modify)
- `src/services/simulator/types.ts` (create)
- `src/services/simulator/SimulatorService.ts` (create)
- `src/services/logger/logger.ts` (modify)

**Task 1.1: Extend OnboardingStep union**

In `src/services/device/types.ts`, add two new steps to the union:

```typescript
export type OnboardingStep =
  | 'scan'
  | 'connecting'
  | 'product-info'      // NEW
  | 'firmware-update'   // NEW
  | 'wifi-setup'
  | 'verifying'
  | 'name'
  | 'configure'
  | 'complete';
```

Add a firmware update info interface:

```typescript
export interface FirmwareUpdateInfo {
  currentVersion: string;
  availableVersion: string;
  updateAvailable: boolean;
  releaseNotes: string;
}
```

**Task 1.2: Create simulator types**

Create `src/services/simulator/types.ts`:

```typescript
import type { AlamiraQRPayload } from '../qr/types';
import type { DeviceInfo } from '../wifi/types';
import type { FirmwareUpdateInfo } from '../device/types';

export interface SimulatedDevice {
  qrPayload: AlamiraQRPayload;
  deviceInfo: DeviceInfo;
  firmwareUpdate: FirmwareUpdateInfo;
}
```

**Task 1.3: Create SimulatorService**

Create `src/services/simulator/SimulatorService.ts`:

```typescript
import { simLog } from '../logger/logger';
import type { SimulatedDevice } from './types';

const SIMULATED_DEVICE: SimulatedDevice = {
  qrPayload: {
    ap_ssid: 'ALAMIRA-SIM',
    ap_pass: 'simulator',
    device_id: 'ALM-DEMO-001',
    api_port: 8080,
    ip: '192.168.1.100',
  },
  deviceInfo: {
    device_id: 'ALM-DEMO-001',
    model: 'Alamira MFD-7',
    firmware_version: '1.2.0',
    serial: 'ALM-2026-DEMO-001',
  },
  firmwareUpdate: {
    currentVersion: '1.2.0',
    availableVersion: '1.3.0',
    updateAvailable: true,
    releaseNotes: 'Improved NMEA 2000 parsing, night mode, bug fixes.',
  },
};

export class SimulatorService {
  getSimulatedDevice(): SimulatedDevice {
    simLog.info('Generating simulated device data');
    return { ...SIMULATED_DEVICE };
  }

  getSimulatedQRPayload() {
    return { ...SIMULATED_DEVICE.qrPayload };
  }

  getSimulatedDeviceInfo() {
    return { ...SIMULATED_DEVICE.deviceInfo };
  }

  getSimulatedFirmwareUpdate() {
    return { ...SIMULATED_DEVICE.firmwareUpdate };
  }
}
```

**Task 1.4: Add simLog to logger**

In `src/services/logger/logger.ts`, add:

```typescript
export const simLog = log.extend('sim');
```

---

### Agent A2 — Onboarding Slice Changes

**Files owned:**
- `src/store/slices/onboardingSlice.ts` (modify)

**Task 1.5: Add simulator and firmware state**

Add new fields to the slice state and interface:

```typescript
// New state fields
isSimulated: boolean;
firmwareProgress: number;

// New actions
setIsSimulated: (simulated: boolean) => void;
setFirmwareProgress: (progress: number) => void;
```

Add to `initialState`:
```typescript
isSimulated: false,
firmwareProgress: 0,
```

Add action implementations:
```typescript
setIsSimulated: (simulated) => set({ isSimulated: simulated }),
setFirmwareProgress: (progress) => set({ firmwareProgress: progress }),
```

Update `reset` — `initialState` already includes the new fields, so `reset` works automatically.

**Dependencies:** None. This slice has no imports from simulator service.

---

## Phase 2: Hook Layer

**Goal:** Wire services and store into React-consumable actions.
**Parallelism:** 1 agent (depends on Phase 1 outputs).

### Agent A1 — useOnboarding Modifications

**Files owned:**
- `src/hooks/useOnboarding.ts` (modify)

**Task 2.1: Import SimulatorService**

```typescript
import { SimulatorService } from '../services/simulator/SimulatorService';

const simulatorService = new SimulatorService();
```

**Task 2.2: Add `simulateDevice()` action**

This is what the "Simulate Device" button on the scan screen calls. It:
1. Gets mock data from SimulatorService
2. Sets `isSimulated: true` in the store
3. Sets `qrData` and `deviceInfo` from the mock
4. Navigates directly to `product-info` (skips `connecting`)

```typescript
const simulateDevice = useCallback(() => {
  const {
    setIsSimulated,
    setQRData,
    setDeviceInfo,
    setStep,
  } = useStore.getState();

  const simDevice = simulatorService.getSimulatedDevice();

  setIsSimulated(true);
  setQRData(simDevice.qrPayload);
  setDeviceInfo(simDevice.deviceInfo);
  setStep('product-info');
}, []);
```

**Task 2.3: Add `checkFirmwareUpdate()` action**

Called from the product-info screen when user taps "Continue". Returns the firmware update info and navigates to `firmware-update`.

```typescript
const checkFirmwareUpdate = useCallback(() => {
  const { setStep } = useStore.getState();
  // In sim mode, always returns mock. In real mode, this would call a real endpoint.
  setStep('firmware-update');
}, []);
```

**Task 2.4: Add `applyFirmwareUpdate()` action**

Called from the firmware-update screen. Runs a fake progress animation via setInterval, then navigates forward.

```typescript
const applyFirmwareUpdate = useCallback(() => {
  const { setFirmwareProgress, setStep, isSimulated } = useStore.getState();

  setFirmwareProgress(0);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 8 + 2; // 2-10% increments
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setFirmwareProgress(100);

      // Navigate after a brief pause at 100%
      setTimeout(() => {
        const { isSimulated: currentIsSimulated } = useStore.getState();
        if (currentIsSimulated) {
          setStep('name');
        } else {
          setStep('wifi-setup');
        }
      }, 500);
      return;
    }
    setFirmwareProgress(Math.round(progress));
  }, 100);
}, []);
```

**Task 2.5: Add `skipFirmwareUpdate()` action**

Skips the firmware update and navigates forward.

```typescript
const skipFirmwareUpdate = useCallback(() => {
  const { setStep, isSimulated } = useStore.getState();
  if (isSimulated) {
    setStep('name');
  } else {
    setStep('wifi-setup');
  }
}, []);
```

**Task 2.6: Modify `handleQRScan` navigation target**

In the existing `handleQRScan`, after connecting to the device and scanning networks, change the navigation target from `wifi-setup` to `product-info`:

```typescript
// Change this line:
setStep('wifi-setup');
// To:
setStep('product-info');
```

The networks are still scanned and stored — they will be used when the user reaches `wifi-setup` after `firmware-update`.

**Task 2.7: Modify `nameDevice` for sim mode**

Currently `nameDevice` sets step to `configure`. In sim mode, it should skip `configure` and go straight to triggering `completeOnboarding`:

```typescript
const nameDevice = useCallback((name: string) => {
  const { setDeviceName, setStep, isSimulated } = useStore.getState();
  setDeviceName(name);
  if (isSimulated) {
    setStep('complete');
    // Trigger device save for sim mode
    const {
      deviceInfo: currentDeviceInfo,
      deviceName: currentDeviceName,
      qrData: currentQrData,
      addDevice,
    } = useStore.getState();

    if (currentDeviceInfo && currentQrData) {
      addDevice({
        id: currentDeviceInfo.device_id,
        name: name || currentDeviceInfo.model,
        ip: currentQrData.ip ?? '192.168.1.100',
        port: currentQrData.api_port,
        model: currentDeviceInfo.model,
        firmware_version: currentDeviceInfo.firmware_version,
        serial: currentDeviceInfo.serial,
        paired_at: Date.now(),
      });
    }
  } else {
    setStep('configure');
  }
}, []);
```

**Task 2.8: Expose new state and actions**

Add to the returned object from `useOnboarding()`:

```typescript
return {
  // Existing state...
  isSimulated: useStore((s) => s.isSimulated),
  firmwareProgress: useStore((s) => s.firmwareProgress),

  // Existing actions...
  simulateDevice,
  checkFirmwareUpdate,
  applyFirmwareUpdate,
  skipFirmwareUpdate,
};
```

**Task 2.9: Reset provisionedIp on cancel and handle sim cleanup**

The existing `cancelOnboarding` already resets the store (which will now reset `isSimulated` and `firmwareProgress` too). No changes needed.

---

## Phase 3: Screens (Parallel)

**Goal:** Build all UI screens. 6 agents can run simultaneously.
**Parallelism:** Up to 6 agents. Each agent owns distinct files — no overlap.

### Agent A1 — Product Info Screen

**Files owned:**
- `app/onboarding/product-info.tsx` (create)

**Task 3.1: Create product-info.tsx**

Layout:
- Large iconoir icon at top (e.g., `Sailing` or `Boat` — use iconoir-react-native)
- Device model name (large text)
- Card with info rows: Serial, Firmware Version, Device ID
- "Continue" button at bottom → calls `checkFirmwareUpdate()`
- Uses `useOnboarding()` hook to read `deviceInfo`

Navigation pattern (consistent with existing screens):
```typescript
useEffect(() => {
  if (step === 'firmware-update') {
    router.replace('/onboarding/firmware-update');
  }
}, [step]);
```

UI structure:
```
┌─────────────────────────────┐
│                             │
│         [Boat Icon]         │
│                             │
│      Alamira MFD-7          │
│    Your device is ready     │
│                             │
│  ┌─────────────────────┐    │
│  │ Serial  ALM-2026-.. │    │
│  │ FW      1.2.0       │    │
│  │ ID      ALM-DEMO-.. │    │
│  └─────────────────────┘    │
│                             │
│     [   Continue   ]        │
│                             │
└─────────────────────────────┘
```

---

### Agent A2 — Firmware Update Screen

**Files owned:**
- `app/onboarding/firmware-update.tsx` (create)

**Task 3.2: Create firmware-update.tsx**

Layout:
- Title: "Firmware Update Available" (or "Firmware Up to Date" if no update)
- Current version vs. available version (side by side or stacked)
- Release notes text
- Progress bar (animated, 0-100%)
- "Update Now" button → calls `applyFirmwareUpdate()`
- "Skip" text button → calls `skipFirmwareUpdate()`
- While updating: show progress bar, disable buttons
- On completion: auto-navigates (handled by useEffect watching step)

Navigation pattern:
```typescript
const { isSimulated } = useOnboarding();

useEffect(() => {
  if (step === 'wifi-setup') {
    router.replace('/onboarding/wifi-setup');
  } else if (step === 'name') {
    router.replace('/onboarding/name-device');
  }
}, [step]);
```

Progress bar: Use a simple `View` with dynamic width percentage and `bg-primary` background. Animated via `Animated.View` with `useNativeDriver: false` (width animation requires layout) or just re-render on `firmwareProgress` changes (simpler, good enough for a fake 3s animation).

For the firmware info in sim mode, read from `SimulatorService` directly (or pass through the hook). Since this is mock data and we want to keep it simple, have the `useOnboarding` hook expose a `getFirmwareUpdateInfo()` that returns the `SimulatorService` data.

**Alternative (simpler):** Hard-code the firmware update info reading from the simulated device info already in the store. The hook already has `deviceInfo` which contains `firmware_version`. The "available" version can come from a constant or a new store field.

**Decision:** Add `firmwareUpdateInfo: FirmwareUpdateInfo | null` to the onboarding slice and have the hook populate it. This keeps the screen thin. Agent A2 in Phase 1 should add this field.

**Revised Phase 1 Agent A2 addition:**

Add to `onboardingSlice.ts`:
```typescript
firmwareUpdateInfo: FirmwareUpdateInfo | null;
setFirmwareUpdateInfo: (info: FirmwareUpdateInfo | null) => void;
```

Add to `initialState`:
```typescript
firmwareUpdateInfo: null,
```

And the Phase 2 hook work populates it when entering firmware-update step.

UI structure:
```
┌─────────────────────────────┐
│                             │
│    Firmware Update          │
│    Available                │
│                             │
│    v1.2.0  →  v1.3.0       │
│                             │
│  ┌─────────────────────┐    │
│  │ Improved NMEA 2000  │    │
│  │ parsing, night mode │    │
│  │ bug fixes.          │    │
│  └─────────────────────┘    │
│                             │
│  ░░░░░░░░░░░░░░░░░░░░  0%  │
│                             │
│     [  Update Now  ]        │
│         Skip                │
│                             │
└─────────────────────────────┘
```

---

### Agent A3 — Home Screen Redesign

**Files owned:**
- `app/(tabs)/index.tsx` (modify)

**Task 3.3: Redesign dashboard as device-centric home**

Replace the current placeholder dashboard with:

**Empty state (no devices):**
- Large iconoir icon (e.g., `Antenna` or `Sailing`)
- "No devices paired yet" heading
- "Scan the QR code on your Alamira display to get started" body text
- Primary "Add Device" button → navigates to `/onboarding/scan`

**Device list (has devices):**
- Header: "My Devices" with device count
- FlatList of device cards, each showing:
  - Device name (bold)
  - Model + serial (muted)
  - Firmware version badge
  - Green dot (online indicator — always green for now)
  - Chevron or tap area for future device detail navigation
- Each card is a `Pressable` wrapping a `Card`

**FAB (Floating Action Button):**
- Fixed position bottom-right (above tab bar — use `pb-24` or absolute positioning)
- Circular primary-colored button with `+` icon
- Navigates to `/onboarding/scan`
- Only shown when devices exist (empty state has its own CTA)

Uses `useDevices()` hook for device data, `useRouter()` for navigation. No new hooks needed.

---

### Agent A4 — Scan Screen Modifications

**Files owned:**
- `app/onboarding/scan.tsx` (modify)

**Task 3.4: Add "Simulate Device" button**

Add a dev-only button below the instruction text area. Requirements:

- Only visible when `__DEV__` is true
- Positioned below the "Point your camera at the QR code" text
- Button text: "Simulate Device" (outline or ghost variant)
- On press: calls `simulateDevice()` from `useOnboarding()`
- Small "DEV" label/badge next to it for clarity

Update the `useEffect` navigation to also handle the `product-info` step:

```typescript
useEffect(() => {
  if (step === 'connecting') {
    router.replace('/onboarding/connecting');
  } else if (step === 'product-info') {
    router.replace('/onboarding/product-info');
  }
}, [step, router]);
```

The button should be styled subtly — ghost variant with muted text — so it does not dominate the screen but is easy to find in dev.

---

### Agent A5 — Onboarding Layout + Connecting Screen

**Files owned:**
- `app/onboarding/_layout.tsx` (modify)
- `app/onboarding/connecting.tsx` (modify)

**Task 3.5: Update onboarding Stack layout**

Add two new screens to the Stack:

```tsx
<Stack.Screen name="product-info" />
<Stack.Screen name="firmware-update" />
```

Insert them after `connecting` and before `wifi-setup` to match the logical flow order:

```tsx
<Stack.Screen name="scan" />
<Stack.Screen name="connecting" />
<Stack.Screen name="product-info" />
<Stack.Screen name="firmware-update" />
<Stack.Screen name="wifi-setup" />
<Stack.Screen name="verifying" />
<Stack.Screen name="name-device" />
<Stack.Screen name="configure" />
<Stack.Screen name="complete" />
```

**Task 3.6: Update connecting.tsx navigation**

Change the navigation target from `wifi-setup` to `product-info`:

```typescript
useEffect(() => {
  if (step === 'product-info') {
    router.replace('/onboarding/product-info');
  }
}, [step]);
```

Currently it watches for `step === 'wifi-setup'`. Change to `step === 'product-info'` since the hook now sets `product-info` as the next step after connecting.

---

### Agent A6 — Complete + Name-Device Adjustments

**Files owned:**
- `app/onboarding/complete.tsx` (modify)
- `app/onboarding/name-device.tsx` (modify)

**Task 3.7: Update complete.tsx for sim mode**

The complete screen currently shows device name, model, and firmware. This works fine for sim mode too since those fields are populated.

Minor changes:
- Add `isSimulated` from `useOnboarding()`
- If simulated, optionally show a small "Simulated" badge (using StatusBadge with a custom label)
- Ensure the "Go to Dashboard" button works (it uses `router.dismissAll()` + `router.replace('/(tabs)')` which should work regardless of mode)

**Task 3.8: Update name-device.tsx for sim mode**

Currently, `nameDevice()` navigates to `configure`. In sim mode, the hook's `nameDevice()` will set step to `complete` instead (handled in Phase 2). The screen just needs to watch for the `complete` step:

```typescript
useEffect(() => {
  if (step === 'configure') {
    router.replace('/onboarding/configure');
  } else if (step === 'complete') {
    router.replace('/onboarding/complete');
  }
}, [step]);
```

No other changes needed — the hook handles the branching logic.

---

## Phase 4: Integration Verification

**Goal:** Verify all flows work end-to-end.
**Parallelism:** 1 agent, sequential.

### Verification Checklist

**Sim mode flow:**
1. Launch app → Dashboard shows empty state
2. Tap "Add Device" → Opens scan screen
3. Tap "Simulate Device" (dev button) → Navigates to product-info
4. Product-info shows simulated device details → Tap "Continue"
5. Firmware-update shows version comparison → Tap "Update Now"
6. Progress bar fills to 100% → Auto-navigates to name-device
7. Enter name → Tap "Continue" → Navigates to complete (skips configure)
8. Complete shows device summary → Tap "Go to Dashboard"
9. Dashboard shows the simulated device in the card list
10. FAB visible to add another device

**Sim mode with skip:**
1. On firmware-update screen → Tap "Skip"
2. Navigates directly to name-device (skips update)

**Real mode flow (regression):**
1. Scan QR code → Connecting spinner
2. Connecting succeeds → Product-info (new!)
3. Product-info → Continue → Firmware-update (new!)
4. Firmware-update → Skip → WiFi-setup (unchanged from here)
5. WiFi-setup → Verifying → Name-device → Configure → Complete

**Edge cases:**
- Cancel from any screen should reset the store and go back
- Error on connecting should still show retry (unchanged)
- Multiple simulated devices can be added (each gets the same ID — consider if this matters for demo)

---

## Dependency Graph

```
Phase 1 (parallel)
├── A1: types.ts + simulator/types.ts + SimulatorService.ts + logger.ts
└── A2: onboardingSlice.ts
         │
         ▼
Phase 2 (sequential, depends on Phase 1)
└── A1: useOnboarding.ts
         │
         ▼
Phase 3 (parallel, depends on Phase 2)
├── A1: product-info.tsx
├── A2: firmware-update.tsx
├── A3: index.tsx (home redesign)
├── A4: scan.tsx
├── A5: _layout.tsx + connecting.tsx
└── A6: complete.tsx + name-device.tsx
         │
         ▼
Phase 4 (sequential, depends on Phase 3)
└── Integration verification
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `nameDevice` branching logic gets complex | Med | All branching lives in the hook, not the screen. Screen just watches `step`. |
| Progress bar animation performance | Low | Using simple state updates every 100ms. No heavy animations. |
| Sim mode leaks into production | Low | `__DEV__` gate on the "Simulate Device" button. The sim flow itself is harmless (just mock data). |
| Home screen redesign breaks tab layout | Low | Only `index.tsx` changes. Tab layout and other tabs untouched. |
| Multiple simulated devices with same ID | Low | For demo purposes this is fine. Real devices will have unique IDs from hardware. |
| Step enum changes break existing navigation | Med | Existing steps unchanged. New steps are additive. All existing `useEffect` watchers still match their expected steps. |

---

## Notes

- All new screens use existing `@alamira/ui` components: `ScreenContainer`, `Card`, `Button`, `StatusBadge`
- Device placeholder image = large iconoir icon (e.g., `Boat`, `Sailing`, or `Antenna`), not a photo
- Dev-only features gated with `__DEV__` (React Native built-in, stripped in production builds)
- `SimulatorService` is a pure data factory — no async, no network calls, no side effects
- The `apps/simulator/` directory (separate simulator app with HTTP server) is NOT touched by this plan
- `firmwareProgress` is transient state — not persisted (already handled by `partialize` in store)
- `isSimulated` is transient state — not persisted (reset on app restart is correct behavior)
