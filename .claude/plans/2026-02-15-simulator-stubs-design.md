# Simulator Stub Mode, Product Registration, Firmware Update & Home Redesign

Date: 2026-02-15

---

## Overview

Add an in-app simulator stub mode to Alamira Connect that bypasses real hardware during development. At the same time, insert two new onboarding screens (product registration and firmware update) and redesign the home tab as a device-centric paired devices list. The simulator injects mock data at the hook level while reusing the same store mutations, so every screen works identically in both real and simulated flows.

---

## Modified Onboarding Flow

### Step Sequence

```
Real mode:    scan → connecting → product-info → firmware-update → wifi-setup → verifying → name → complete
Sim mode:     scan → product-info → firmware-update → name → complete
```

Sim mode skips `connecting`, `wifi-setup`, and `verifying` because there is no physical device or network to interact with.

### Updated OnboardingStep Type

```typescript
// services/device/types.ts
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

### Updated Onboarding Layout

```typescript
// app/onboarding/_layout.tsx — add two new Stack.Screen entries
<Stack.Screen name="scan" />
<Stack.Screen name="connecting" />
<Stack.Screen name="product-info" />      // NEW
<Stack.Screen name="firmware-update" />   // NEW
<Stack.Screen name="wifi-setup" />
<Stack.Screen name="verifying" />
<Stack.Screen name="name-device" />
<Stack.Screen name="configure" />
<Stack.Screen name="complete" />
```

### Step Navigation Map

Each screen watches the `step` value from the store and navigates accordingly:

| Screen | On step change | Navigates to |
|--------|---------------|-------------|
| `scan.tsx` | `step !== 'scan'` | `/onboarding/connecting` (real) or `/onboarding/product-info` (sim) |
| `connecting.tsx` | `step === 'product-info'` | `/onboarding/product-info` |
| `product-info.tsx` | `step === 'firmware-update'` | `/onboarding/firmware-update` |
| `firmware-update.tsx` | `step === 'wifi-setup'` (real) or `step === 'name'` (sim) | next screen |
| `wifi-setup.tsx` | `step === 'verifying'` | `/onboarding/verifying` |
| `verifying.tsx` | `step === 'name'` | `/onboarding/name-device` |
| `name-device.tsx` | `step === 'complete'` | `/onboarding/complete` |

---

## New Screens

### Product Info (`app/onboarding/product-info.tsx`)

Shows after connecting to a device (real) or simulating one. Confirms identification.

**Content:**
- Placeholder device icon (Iconoir `Antenna` or similar, not a photo)
- Model name from `deviceInfo.model`
- Serial number from `deviceInfo.serial`
- Firmware version from `deviceInfo.firmware_version`
- Success message: "Device identified successfully"
- Continue button advances to `firmware-update`

**Data source:** `useOnboarding().deviceInfo` (already populated by `handleQRScan` or `simulateDevice`)

### Firmware Update (`app/onboarding/firmware-update.tsx`)

Simulated firmware update screen. Always shows an update available.

**Content:**
- Current version: from `deviceInfo.firmware_version` (e.g. "1.2.0")
- Available version: hardcoded "1.3.0"
- "Update Available" badge
- Update button triggers fake progress (0% to 100% over ~3 seconds)
- Progress bar with percentage
- After completion: checkmark icon + "Update Complete" + Continue button
- Skip option (text button) at all times

**Behavior:**
- `applyFirmwareUpdate()` from `useOnboarding` handles the fake delay
- Skip advances to next step immediately (`wifi-setup` in real mode, `name` in sim mode)
- Continue after completion does the same

### Paired Devices Home (redesigned `app/(tabs)/index.tsx`)

Replace the current dashboard with a device-centric home screen.

**Empty state:**
- Centered Iconoir device icon
- "Add your first device" heading
- Subtext explaining what Alamira Connect does
- Primary CTA button navigating to `/onboarding/scan`

**With devices:**
- Header: "Your Devices"
- Scrollable `FlatList` of `DeviceCard` components
- Each `DeviceCard` shows:
  - Device name (bold)
  - Model name (subtitle)
  - Connection status dot (stubbed as gray/disconnected for now)
  - Last seen timestamp (from `paired_at`, formatted as relative time)
- Tap card navigates to device detail (placeholder for now)
- FAB (floating action button) at bottom-right to add a new device

---

## Service Layer Changes

### New: SimulatorService (`src/services/simulator/SimulatorService.ts`)

Pure functions returning canned mock data. No side effects, no network calls.

```typescript
// services/simulator/SimulatorService.ts

import type { AlamiraQRPayload } from '../qr/types';
import type { DeviceInfo } from '../wifi/types';

export function getSimulatedQRPayload(): AlamiraQRPayload {
  return {
    ap_ssid: 'Alamira-SIM-001',
    ap_pass: 'simulator',
    device_id: 'sim-device-001',
    api_port: 8080,
    ip: '192.168.4.1',
  };
}

export function getSimulatedDeviceInfo(): DeviceInfo {
  return {
    device_id: 'sim-device-001',
    model: 'Alamira MFD-7',
    firmware_version: '1.2.0',
    serial: 'ALM-2024-00142',
  };
}
```

No class needed. Two exported functions. Tested trivially.

### New: Firmware Update Types (`src/services/firmware/types.ts`)

```typescript
export interface FirmwareUpdateInfo {
  current_version: string;
  available_version: string;
  update_available: boolean;
}
```

---

## Hook Changes

### `useOnboarding` Additions

Three new actions added to the existing hook:

```typescript
// New action: simulateDevice
const simulateDevice = useCallback(() => {
  const { setQRData, setDeviceInfo, setStep } = useStore.getState();
  setQRData(getSimulatedQRPayload());
  setDeviceInfo(getSimulatedDeviceInfo());
  setStep('product-info');  // Skip connecting, go straight to product-info
}, []);

// New action: confirmProductInfo
const confirmProductInfo = useCallback(() => {
  useStore.getState().setStep('firmware-update');
}, []);

// New action: applyFirmwareUpdate
const applyFirmwareUpdate = useCallback(async () => {
  // Fake progress over ~3 seconds, UI tracks progress via local state
  await new Promise((resolve) => setTimeout(resolve, 3000));
}, []);

// New action: skipFirmwareUpdate / completeFirmwareUpdate
const advancePastFirmware = useCallback(() => {
  const { qrData } = useStore.getState();
  // In sim mode (no real wifi needed), skip to name
  // In real mode, go to wifi-setup
  const isSimulated = qrData?.ap_ssid.startsWith('Alamira-SIM');
  useStore.getState().setStep(isSimulated ? 'name' : 'wifi-setup');
}, []);
```

### Modified: `handleQRScan`

After connecting and fetching device info, advance to `product-info` instead of `wifi-setup`:

```typescript
// Current:  setStep('wifi-setup')
// Changed:  setStep('product-info')
```

The `product-info` screen then continues to `firmware-update`, which then continues to `wifi-setup` (real mode). This inserts the two new steps into the real flow without breaking existing logic.

### Modified: `sendCredentials`

After successful provisioning, advance to `name` (unchanged — wifi-setup and verifying still lead to name).

### Hook Return Value

Add to returned object:
- `simulateDevice`
- `confirmProductInfo`
- `applyFirmwareUpdate`
- `advancePastFirmware`

---

## Store Changes

### `onboardingSlice`

No new state fields needed. The existing `step`, `qrData`, `deviceInfo` fields handle everything. The new `product-info` and `firmware-update` steps are just new values in the `OnboardingStep` union type.

Firmware update progress is local component state (transient UI, not persisted) — the progress bar lives in the `firmware-update.tsx` screen component.

### `deviceSlice`

No changes needed. `addDevice` already handles persisting `PairedDevice` objects.

---

## Scan Screen Changes

### "Simulate Device" Button (`app/onboarding/scan.tsx`)

Add a dev-only button below the QR scanner:

```
[Simulate Device]    — only visible in __DEV__ builds
```

- Positioned at the bottom of the scan screen, below the instruction text
- Calls `useOnboarding().simulateDevice()`
- Guarded by `__DEV__` flag so it never appears in production builds
- No camera permission needed for sim path

---

## File Impact Summary

### New Files

| File | Purpose |
|------|---------|
| `src/services/simulator/SimulatorService.ts` | Mock data factory for sim mode |
| `src/services/firmware/types.ts` | `FirmwareUpdateInfo` type |
| `app/onboarding/product-info.tsx` | Product registration screen |
| `app/onboarding/firmware-update.tsx` | Firmware update screen |

### Modified Files

| File | Changes |
|------|---------|
| `src/services/device/types.ts` | Add `'product-info'` and `'firmware-update'` to `OnboardingStep` |
| `src/hooks/useOnboarding.ts` | Add `simulateDevice`, `confirmProductInfo`, `applyFirmwareUpdate`, `advancePastFirmware` actions; change post-connect step from `wifi-setup` to `product-info` |
| `app/onboarding/_layout.tsx` | Add `product-info` and `firmware-update` Stack.Screen entries |
| `app/onboarding/scan.tsx` | Add "Simulate Device" button (dev only); update navigation target |
| `app/onboarding/connecting.tsx` | Navigate to `product-info` instead of `wifi-setup` |
| `app/(tabs)/index.tsx` | Redesign as paired devices home (empty state + device list + FAB) |

### Untouched

| File | Why |
|------|-----|
| `apps/simulator/` | Separate app, completely independent |
| `src/store/slices/onboardingSlice.ts` | No new fields, just uses updated `OnboardingStep` type |
| `src/store/slices/deviceSlice.ts` | No changes needed |
| `src/services/wifi/` | Real WiFi flow unchanged |
| `src/services/qr/` | QR parsing unchanged |
