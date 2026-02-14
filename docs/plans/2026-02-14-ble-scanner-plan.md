# BLE Scanner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a BLE device scanner with mock adapter, full architecture layers (types → adapter → service → store → hook → UI), so scanning works in Expo Go and swapping in real BLE later = rewriting one file.

**Architecture:** Layered vertical slice following the project's data flow pattern: `Component → Hook → Store → Service → Adapter`. Mock adapter emits fake Alamira devices on a timer. Zustand store holds transient scan state. The UI shows devices appearing in real-time during a scan.

**Tech Stack:** TypeScript, Zustand ^4.5, NativeWind (Tailwind), Iconoir icons, React Native

---

### Task 1: Install Zustand

**Files:**
- Modify: `apps/connect/package.json`

**Step 1: Install zustand**

```bash
cd apps/connect && yarn add zustand
```

**Step 2: Verify installation**

```bash
grep zustand apps/connect/package.json
```

Expected: `"zustand": "^4.x.x"` in dependencies

**Step 3: Commit**

```bash
git add apps/connect/package.json yarn.lock
git commit -m "Add zustand for state management"
```

---

### Task 2: BLE Types

**Files:**
- Create: `apps/connect/src/services/ble/types.ts`

**Step 1: Create the types file**

```typescript
// BLE domain types — shared across adapter, service, store, and hooks.

export interface DiscoveredDevice {
  /** BLE peripheral identifier (UUID on iOS, MAC on Android) */
  id: string;
  /** Advertised device name, null if not broadcasting */
  name: string | null;
  /** Signal strength in dBm. -30 = very strong, -90 = very weak */
  rssi: number;
  /** Advertised BLE service UUIDs */
  serviceUUIDs: string[];
  /** Timestamp (Date.now()) of last advertisement received */
  lastSeen: number;
}

export type ScanState = 'idle' | 'scanning' | 'error';

export interface BLEAdapterInterface {
  startScan(
    serviceUUIDs: string[] | null,
    onDeviceFound: (device: DiscoveredDevice) => void,
  ): void;
  stopScan(): void;
  destroy(): void;
}
```

**Step 2: Typecheck**

```bash
cd /Users/ahmedg/code/github/alamira-app && npx turbo typecheck --filter=alamira-connect
```

Expected: PASS

**Step 3: Commit**

```bash
git add apps/connect/src/services/ble/types.ts
git commit -m "Add BLE domain types (DiscoveredDevice, ScanState, BLEAdapterInterface)"
```

---

### Task 3: Mock BLE Adapter

**Files:**
- Create: `apps/connect/src/services/ble/adapter.ts`

**Dependencies:** Task 2 (types)

The mock adapter implements `BLEAdapterInterface` and emits fake Alamira devices on a timer. When real BLE is needed, replace ONLY this file with `react-native-ble-plx` calls.

**Step 1: Create the mock adapter**

```typescript
import type { BLEAdapterInterface, DiscoveredDevice } from './types';

const MOCK_DEVICES = [
  { id: 'alam-mfd7-001', name: 'Alamira MFD-7', serviceUUIDs: ['180A', 'FFF0'] },
  { id: 'alam-wind-002', name: 'Alamira Wind-1', serviceUUIDs: ['180A', 'FFF0'] },
  { id: 'alam-dpth-003', name: 'Alamira Depth-3', serviceUUIDs: ['180A', 'FFF0'] },
  { id: 'alam-nav-004', name: 'Alamira Nav-10', serviceUUIDs: ['180A', 'FFF0'] },
  { id: 'unknown-005', name: null, serviceUUIDs: ['180A'] },
];

function randomRSSI(): number {
  return Math.floor(Math.random() * (-40 - -85 + 1)) + -85;
}

function randomDelay(): number {
  return 800 + Math.random() * 700; // 800-1500ms
}

export class MockBLEAdapter implements BLEAdapterInterface {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private scanning = false;

  startScan(
    _serviceUUIDs: string[] | null,
    onDeviceFound: (device: DiscoveredDevice) => void,
  ): void {
    if (this.scanning) return;
    this.scanning = true;

    // Emit devices one by one with staggered timing
    let deviceIndex = 0;

    const emitNext = () => {
      if (!this.scanning) return;

      const mock = MOCK_DEVICES[deviceIndex % MOCK_DEVICES.length];
      onDeviceFound({
        ...mock,
        rssi: randomRSSI(),
        lastSeen: Date.now(),
      });

      deviceIndex++;
      const timer = setTimeout(emitNext, randomDelay());
      this.timers.push(timer);
    };

    // Start emitting after a short initial delay
    const timer = setTimeout(emitNext, 500);
    this.timers.push(timer);
  }

  stopScan(): void {
    this.scanning = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  destroy(): void {
    this.stopScan();
  }
}
```

**Step 2: Typecheck**

```bash
npx turbo typecheck --filter=alamira-connect
```

Expected: PASS

**Step 3: Commit**

```bash
git add apps/connect/src/services/ble/adapter.ts
git commit -m "Add mock BLE adapter with fake Alamira devices"
```

---

### Task 4: BLE Service

**Files:**
- Create: `apps/connect/src/services/ble/BLEService.ts`

**Dependencies:** Task 2 (types), Task 3 (adapter)

Plain TypeScript class. No React. Manages scan lifecycle, emits events, handles auto-stop timeout.

**Step 1: Create the BLE service**

```typescript
import { MockBLEAdapter } from './adapter';
import type { BLEAdapterInterface, DiscoveredDevice, ScanState } from './types';

type BLEEventMap = {
  scanStarted: () => void;
  scanStopped: () => void;
  scanError: (error: string) => void;
  deviceFound: (device: DiscoveredDevice) => void;
};

type BLEEvent = keyof BLEEventMap;

const DEFAULT_SCAN_TIMEOUT = 15_000; // 15 seconds

class BLEService {
  private adapter: BLEAdapterInterface;
  private listeners: { [K in BLEEvent]: Set<BLEEventMap[K]> } = {
    scanStarted: new Set(),
    scanStopped: new Set(),
    scanError: new Set(),
    deviceFound: new Set(),
  };
  private scanTimer: ReturnType<typeof setTimeout> | null = null;
  private _scanState: ScanState = 'idle';

  constructor(adapter?: BLEAdapterInterface) {
    this.adapter = adapter ?? new MockBLEAdapter();
  }

  get scanState(): ScanState {
    return this._scanState;
  }

  on<K extends BLEEvent>(event: K, listener: BLEEventMap[K]): () => void {
    this.listeners[event].add(listener as any);
    return () => {
      this.listeners[event].delete(listener as any);
    };
  }

  private emit<K extends BLEEvent>(event: K, ...args: Parameters<BLEEventMap[K]>): void {
    this.listeners[event].forEach((listener) => (listener as any)(...args));
  }

  startScan(options?: { timeoutMs?: number; serviceUUIDs?: string[] }): void {
    if (this._scanState === 'scanning') {
      this.stopScan();
    }

    const timeout = options?.timeoutMs ?? DEFAULT_SCAN_TIMEOUT;
    const serviceUUIDs = options?.serviceUUIDs ?? null;

    this._scanState = 'scanning';
    this.emit('scanStarted');

    this.adapter.startScan(serviceUUIDs, (device) => {
      this.emit('deviceFound', device);
    });

    // Auto-stop after timeout
    this.scanTimer = setTimeout(() => {
      this.stopScan();
    }, timeout);
  }

  stopScan(): void {
    if (this._scanState !== 'scanning') return;

    this.adapter.stopScan();
    this._scanState = 'idle';

    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }

    this.emit('scanStopped');
  }

  destroy(): void {
    this.stopScan();
    this.adapter.destroy();
    // Clear all listeners
    Object.values(this.listeners).forEach((set) => set.clear());
  }
}

// Singleton
export const bleService = new BLEService();
```

**Step 2: Typecheck**

```bash
npx turbo typecheck --filter=alamira-connect
```

Expected: PASS

**Step 3: Commit**

```bash
git add apps/connect/src/services/ble/BLEService.ts
git commit -m "Add BLE service with scan lifecycle and event emission"
```

---

### Task 5: Zustand Store (bleSlice)

**Files:**
- Create: `apps/connect/src/store/slices/bleSlice.ts`
- Create: `apps/connect/src/store/index.ts`

**Dependencies:** Task 1 (zustand), Task 2 (types), Task 4 (BLE service)

**Step 1: Create the bleSlice**

`apps/connect/src/store/slices/bleSlice.ts`:

```typescript
import type { StateCreator } from 'zustand';
import type { DiscoveredDevice, ScanState } from '../../services/ble/types';
import { bleService } from '../../services/ble/BLEService';

export interface BLESlice {
  scanState: ScanState;
  discoveredDevices: DiscoveredDevice[];
  scanError: string | null;
  startScan: () => void;
  stopScan: () => void;
  clearDevices: () => void;
}

export const createBLESlice: StateCreator<BLESlice> = (set) => {
  // Subscribe to service events
  bleService.on('scanStarted', () => {
    set({ scanState: 'scanning', scanError: null });
  });

  bleService.on('scanStopped', () => {
    set({ scanState: 'idle' });
  });

  bleService.on('scanError', (error) => {
    set({ scanState: 'error', scanError: error });
  });

  bleService.on('deviceFound', (device) => {
    set((state) => {
      const existing = state.discoveredDevices.findIndex((d) => d.id === device.id);
      if (existing >= 0) {
        // Update RSSI and lastSeen for existing device
        const updated = [...state.discoveredDevices];
        updated[existing] = { ...updated[existing], rssi: device.rssi, lastSeen: device.lastSeen };
        return { discoveredDevices: updated };
      }
      return { discoveredDevices: [...state.discoveredDevices, device] };
    });
  });

  return {
    scanState: 'idle',
    discoveredDevices: [],
    scanError: null,

    startScan: () => {
      set({ discoveredDevices: [], scanError: null });
      bleService.startScan();
    },

    stopScan: () => {
      bleService.stopScan();
    },

    clearDevices: () => {
      set({ discoveredDevices: [] });
    },
  };
};
```

**Step 2: Create the store index**

`apps/connect/src/store/index.ts`:

```typescript
import { create } from 'zustand';
import { createBLESlice, type BLESlice } from './slices/bleSlice';

// Combined store — add more slices here as the app grows
export type AppStore = BLESlice;

export const useStore = create<AppStore>()((...args) => ({
  ...createBLESlice(...args),
}));
```

**Step 3: Typecheck**

```bash
npx turbo typecheck --filter=alamira-connect
```

Expected: PASS

**Step 4: Commit**

```bash
git add apps/connect/src/store/
git commit -m "Add Zustand store with BLE slice for scan state"
```

---

### Task 6: useBLE Hook

**Files:**
- Create: `apps/connect/src/hooks/useBLE.ts`

**Dependencies:** Task 5 (store)

**Step 1: Create the hook**

```typescript
import { useCallback, useMemo } from 'react';
import { useStore } from '../store';

export function useBLE() {
  const scanState = useStore((s) => s.scanState);
  const discoveredDevices = useStore((s) => s.discoveredDevices);
  const scanError = useStore((s) => s.scanError);
  const startScanAction = useStore((s) => s.startScan);
  const stopScanAction = useStore((s) => s.stopScan);

  // Sort by signal strength (strongest first)
  const devices = useMemo(
    () => [...discoveredDevices].sort((a, b) => b.rssi - a.rssi),
    [discoveredDevices],
  );

  const startScan = useCallback(() => {
    startScanAction();
  }, [startScanAction]);

  const stopScan = useCallback(() => {
    stopScanAction();
  }, [stopScanAction]);

  const isScanning = scanState === 'scanning';

  return { devices, scanState, isScanning, scanError: scanError, startScan, stopScan };
}
```

**Step 2: Typecheck**

```bash
npx turbo typecheck --filter=alamira-connect
```

Expected: PASS

**Step 3: Commit**

```bash
git add apps/connect/src/hooks/useBLE.ts
git commit -m "Add useBLE hook bridging store to UI"
```

---

### Task 7: Devices Screen UI

**Files:**
- Modify: `apps/connect/app/(tabs)/devices.tsx`

**Dependencies:** Task 6 (hook)

This is the main UI task. Replace the static empty state with a live scanning experience.

**Reference docs:**
- Existing UI components: `packages/ui/src/components/Button.tsx`, `Card.tsx`, `ScreenContainer.tsx`
- Iconoir icons: `iconoir-react-native` — use `Antenna`, `SignalBarsWeak`, `SignalBarsAverage`, `SignalBarsGood`, `SignalBarsFull` (or similar) for signal strength. Use `Refresh` or `SearchIcon` for scan button icon.
- NativeWind classes for styling (same Tailwind config as existing screens)

**Step 1: Rewrite devices.tsx**

The screen has three visual states:
1. **Empty** (no scan run yet) — centered icon + message + "Scan for Devices" button
2. **Scanning** — header with scanning indicator, device list building up, "Stop Scan" button
3. **Results** (scan complete, devices found) — device list, "Scan Again" button

Each device row shows:
- Device name (or "Unknown Device")
- Signal strength as bars (1-4 based on RSSI thresholds)
- RSSI value in small muted text

Use the existing `Card`, `Button`, and `ScreenContainer` components from `@alamira/ui`.

Use Iconoir icons: `Antenna` for the empty state icon, `Wifi` signal indicators or simple View-based bars for RSSI.

```typescript
// Key imports needed:
import { useBLE } from '../../src/hooks/useBLE';
import { Antenna } from 'iconoir-react-native';
// ... plus View, Text, FlatList, Pressable from react-native
// ... plus ScreenContainer, Card, Button from @alamira/ui
```

Build a `SignalBars` component inline that renders 4 small bars, coloring them based on RSSI:
- rssi >= -50: 4 bars (excellent)
- rssi >= -65: 3 bars (good)
- rssi >= -75: 2 bars (fair)
- else: 1 bar (weak)

Bar colors: active bars use `#90FF00` (primary), inactive bars use `#2D3643` (surface-bright).

Use `FlatList` for the device list (not ScrollView) for performance with many devices.

**Step 2: Typecheck**

```bash
npx turbo typecheck --filter=alamira-connect
```

Expected: PASS

**Step 3: Visual test**

```bash
cd apps/connect && npx expo start
```

Open in Expo Go. Navigate to Devices tab. Tap "Scan for Devices". Verify:
- Devices appear one by one
- Signal bars render correctly
- Scan auto-stops after 15 seconds
- "Stop Scan" button works
- "Scan Again" works after scan completes

**Step 4: Commit**

```bash
git add apps/connect/app/(tabs)/devices.tsx
git commit -m "Add BLE scanner UI with live device list and signal bars"
```

---

### Task 8: Final Typecheck + Cleanup

**Step 1: Full typecheck**

```bash
npx turbo typecheck
```

Expected: all packages pass

**Step 2: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "Clean up BLE scanner implementation"
```

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | package.json | Install zustand |
| 2 | src/services/ble/types.ts | BLE domain types |
| 3 | src/services/ble/adapter.ts | Mock adapter with fake devices |
| 4 | src/services/ble/BLEService.ts | Scan lifecycle + events |
| 5 | src/store/ | Zustand store + BLE slice |
| 6 | src/hooks/useBLE.ts | Hook bridging store to UI |
| 7 | app/(tabs)/devices.tsx | Scanner UI with device list |
| 8 | — | Final typecheck + cleanup |
