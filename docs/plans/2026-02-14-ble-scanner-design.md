# BLE Scanner — Design Doc

**Date:** 2026-02-14
**Scope:** Scan-only. Mock adapter for now, real BLE later.
**Goal:** Build the full vertical slice (types → adapter → service → store → hook → UI) with mock data so the scan flow works in Expo Go. Swapping in real BLE = rewriting one file (adapter.ts).

---

## Architecture

Follows the data flow from `CLAUDE.md` and `notes/architecture-guide.md`:

```
DevicesScreen → useBLE hook → Zustand bleSlice → BLEService → MockBLEAdapter
```

Events flow back up:
```
MockBLEAdapter emits device → BLEService forwards → Store updates → Hook re-renders → UI shows device
```

---

## Layer 1: Types (`src/services/ble/types.ts`)

```typescript
interface DiscoveredDevice {
  id: string;             // BLE peripheral UUID
  name: string | null;    // Advertised name
  rssi: number;           // Signal strength (-30 strong, -90 weak)
  serviceUUIDs: string[]; // Advertised services
  lastSeen: number;       // Date.now() timestamp
}

type ScanState = 'idle' | 'scanning' | 'error';

interface BLEAdapterInterface {
  startScan(
    serviceUUIDs: string[] | null,
    onDeviceFound: (device: DiscoveredDevice) => void,
  ): void;
  stopScan(): void;
  destroy(): void;
}
```

---

## Layer 2: Mock Adapter (`src/services/ble/adapter.ts`)

Implements `BLEAdapterInterface` with fake data:
- `startScan()` uses `setInterval` (every 800-1500ms) to emit fake devices
- Fake devices have realistic names: "Alamira MFD-7", "Alamira Wind-1", "Alamira Depth-3", etc.
- RSSI values fluctuate randomly between -40 and -85
- Same device re-emitted with updated RSSI (simulates real BLE behavior)
- `stopScan()` clears the interval
- `destroy()` cleans up

When real BLE is needed, replace this file with `react-native-ble-plx` calls. Nothing else changes.

---

## Layer 3: BLE Service (`src/services/ble/BLEService.ts`)

Plain TypeScript class, no React:
- `startScan(options?)` — starts scan via adapter, auto-stops after timeout (default 15s)
- `stopScan()` — stops scan via adapter
- Emits events: `deviceFound`, `scanStarted`, `scanStopped`, `scanError`
- Deduplicates devices by ID, updates RSSI on re-discovery
- Singleton pattern (one BLE manager for the app)

---

## Layer 4: Zustand Store (`src/store/bleSlice.ts`)

```typescript
interface BLESlice {
  scanState: ScanState;
  discoveredDevices: DiscoveredDevice[];
  scanError: string | null;

  // Actions
  startScan: () => void;
  stopScan: () => void;
  clearDevices: () => void;
  addOrUpdateDevice: (device: DiscoveredDevice) => void;
  setScanState: (state: ScanState) => void;
  setScanError: (error: string | null) => void;
}
```

**Not persisted.** Scan results are transient per the architecture guide.

---

## Layer 5: Hook (`src/hooks/useBLE.ts`)

Bridges store to components:
- Returns `{ devices, scanState, error, startScan, stopScan }`
- `startScan()` clears previous results, calls store action
- Sorts devices by RSSI (strongest first)
- Handles cleanup on unmount

Permissions are a no-op with the mock adapter. Will add real permission requests when switching to ble-plx.

---

## Layer 6: UI (update `apps/connect/app/(tabs)/devices.tsx`)

Three states:
1. **Empty** — No scan run yet. Show icon + "Scan for Devices" button (current state, refined)
2. **Scanning** — Pulsing animation on button, devices appear in a scrollable list as they're discovered
3. **Results** — List of discovered devices with name, RSSI signal bars, and last seen time. "Scan Again" button.

Each device card shows:
- Device name (or "Unknown Device" if null)
- Signal strength as 1-4 bars icon
- RSSI value in dB

---

## Files to Create

```
apps/connect/src/
├── services/
│   └── ble/
│       ├── types.ts          # BLE domain types
│       ├── adapter.ts        # Mock adapter (swap for real BLE later)
│       └── BLEService.ts     # Scan lifecycle, event emission
├── store/
│   ├── index.ts              # Combined store
│   └── slices/
│       └── bleSlice.ts       # Scan state, discovered devices
└── hooks/
    └── useBLE.ts             # Bridge store to UI
```

## Files to Modify

```
apps/connect/app/(tabs)/devices.tsx   # Scan UI with device list
apps/connect/package.json             # Add zustand
```

---

## Dependencies to Install

- `zustand` ^4.5 (already planned in architecture guide)
- `@react-native-async-storage/async-storage` (for Zustand persist — not needed yet for BLE slice but good to have for device slice later)

No `react-native-ble-plx` needed yet — mock adapter handles everything.
