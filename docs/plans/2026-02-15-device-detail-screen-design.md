# Device Detail Screen — Design

## Overview

Tapping a paired device card on the Home screen pushes a full-screen device detail view. This screen shows device status, data connection management (Signal K, NMEA 2000, NMEA 0183), device info, firmware updates, and a remove action.

## Navigation

- Route: `/device/[id]` — top-level stack screen (not inside tabs)
- Home card `Pressable` navigates via `router.push(`/device/${device.id}`)`
- Standard back button returns to Home

## Screen Layout

### Header
- Back arrow (left)
- Device name (center, tappable → rename modal)
- Edit icon (right, also opens rename modal)

### Section 1: Data Connections
Prominent section at top. Three rows:

| Source | Cardinality | Row Display |
|--------|------------|-------------|
| Signal K | 1 server | "Not linked" or "server-name:port" |
| NMEA 2000 | 1 gateway | "Not linked" or "gateway-ip:port" |
| NMEA 0183 | Multiple | "No sources" or "N sources linked" |

Each row has a **"Link"** button (or **"Edit"** if already linked).

Tapping "Link" opens a bottom sheet modal with two options:
- **Discover** — scan local network via mDNS/UDP, list found services
- **Manual** — IP + port text fields

For NMEA 0183, after linking one source, show "Add Another Source" option.

**MVP scope:** Show the section UI with "Link" buttons. Discovery and manual entry modals are implemented but connect logic is stubbed (no actual network discovery yet).

### Section 2: Device Info (read-only)
Card with key-value rows:
- Model
- Serial Number
- IP Address
- Port
- Firmware Version
- Paired Date (formatted)

### Section 3: Firmware
- Shows current version
- "Check for Update" button
- If update available: version + release notes + "Update" button
- Uses existing `FirmwareUpdateInfo` type

### Section 4: Remove Device
- Red "Remove Device" button at bottom
- Confirmation alert before removal
- On confirm: `removeDevice(id)`, navigate back to Home

### Rename Modal
- Simple modal/alert with TextInput
- Pre-filled with current device name
- Save calls `updateDevice(id, { name })`

## Types

```typescript
// New — added to services/device/types.ts
interface DataConnection {
  id: string;
  type: 'signalk' | 'nmea2000' | 'nmea0183';
  host: string;
  port: number;
  name?: string; // friendly name from discovery
  linked_at: number;
}
```

Extend `PairedDevice`:
```typescript
interface PairedDevice {
  // ... existing fields
  connections: DataConnection[]; // new, defaults to []
}
```

## Store Changes

- `deviceSlice` — `updateDevice` already handles partial updates, no new actions needed
- Persist: `connections` array persists with the device (part of `devices` array)
- Connection add/remove done via `updateDevice(id, { connections: [...] })`

## New Files

| File | Purpose |
|------|---------|
| `app/device/[id].tsx` | Route file — thin, renders DeviceDetailScreen |
| `app/device/_layout.tsx` | Stack layout for device routes |
| `src/components/DeviceDetailScreen.tsx` | Main screen component |
| `src/components/ConnectionSection.tsx` | Data connections section |
| `src/components/LinkConnectionSheet.tsx` | Bottom sheet for link/manual entry |
| `src/components/RenameDeviceModal.tsx` | Rename modal |

## Architecture Compliance

- Thin route file in `app/device/[id].tsx`
- Components in `src/components/`
- Hook bridge via existing `useDevices()` (already has `getDevice`, `removeDevice`, `updateDevice` via store)
- Types defined first in `services/device/types.ts`
- No direct native library imports in components
