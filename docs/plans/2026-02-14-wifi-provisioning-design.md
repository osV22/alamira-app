# WiFi Provisioning & Device Onboarding Design

**Date:** 2026-02-14
**Status:** Approved
**App:** Alamira Connect

## Decision: WiFi-Only (No BLE)

All device communication uses WiFi. No Bluetooth at all.

**Rationale:**
- Daily communication (config push, firmware updates, status) is WiFi/HTTP anyway
- One transport = simpler firmware, simpler app, fewer permissions to explain to users
- The display hardware (Allwinner + OpenWrt) has a full Linux networking stack — hostapd, uhttpd, mDNS are all standard packages
- BLE can be added later as an alternative provisioning method if needed (adapter pattern supports it)

## Hardware Context

- **Device:** Allwinner SoC running OpenWrt (Linux)
- **WiFi:** Full AP + client mode support via hostapd
- **No BLE required** on the firmware side for MVP
- **QR code:** Printed/displayed on the device, encodes connection info

## Provisioning Flow

```
User scans QR → Phone joins device AP → App sends WiFi creds → Device joins real network → App discovers device → Done
```

### Detailed Steps

1. Device boots into soft-AP mode (e.g., `Alamira-A3F2`)
2. QR code on device encodes: `{ ap_ssid, ap_pass, device_id, api_port }`
3. App scans QR with `expo-camera`, parses + validates payload
4. App programmatically joins device's AP (iOS: `NEHotspotConfiguration`, Android: `WifiNetworkSuggestion`)
5. App confirms connection: `GET http://192.168.4.1:{port}/api/info`
6. App fetches available networks: `GET /api/wifi/scan`
7. User picks their WiFi network, enters password
8. App sends credentials: `POST /api/provision { ssid, password }`
9. Device joins real network, drops AP
10. Phone reconnects to its own WiFi automatically
11. App discovers device via mDNS (`_alamira._tcp`) or falls back to IP from device response
12. App confirms: `GET http://{device_ip}:{port}/api/info`

**Smooth UX:** Steps 4-5 and 9-12 are masked by full-screen animations so the user never sees the WiFi switching.

## 7-Step Onboarding Wizard

Modal flow — slides up over the tab navigator, cannot be swiped away.

| Step | Screen | What happens |
|------|--------|-------------|
| 1 | Scan QR Code | Camera viewfinder, parse QR payload |
| 2 | Connecting | Animation. Phone joins device AP, fetches device info |
| 3 | WiFi Setup | Show networks from device scan, user picks + enters password |
| 4 | Verifying | Animation. Device joins real network, app rediscovers device |
| 5 | Name Device | Text input with sensible default |
| 6 | Configure | Placeholder for MVP ("Using default configuration") |
| 7 | Complete | Success screen, device saved to paired list |

### Route Structure

```
app/
  (tabs)/
    devices.tsx              # Paired devices list + "Add Device" button
  onboarding/
    _layout.tsx              # Modal stack for wizard (no swipe dismiss)
    scan.tsx                 # Step 1
    connecting.tsx           # Step 2
    wifi-setup.tsx           # Step 3
    verifying.tsx            # Step 4
    name-device.tsx          # Step 5
    configure.tsx            # Step 6 (placeholder)
    complete.tsx             # Step 7
```

## Device HTTP API Contract

The app expects these REST endpoints from the device firmware.

### AP Mode Endpoints (device is running as hotspot)

**`GET /api/info`**
Returns device identity. Available in both AP mode and network mode.
```json
{
  "device_id": "ALM-2024-A3F2",
  "model": "Alamira Display 7",
  "firmware_version": "1.2.0",
  "serial": "SN-20240801-001"
}
```

**`GET /api/wifi/scan`**
Returns WiFi networks visible to the device.
```json
{
  "networks": [
    { "ssid": "BoatWiFi", "rssi": -45, "security": "WPA2" },
    { "ssid": "Marina-Guest", "rssi": -72, "security": "Open" }
  ]
}
```

**`POST /api/provision`**
Receives WiFi credentials. Device joins the specified network and drops AP.
```json
// Request
{ "ssid": "BoatWiFi", "password": "secret123" }

// Response (sent before AP drops)
{ "success": true, "ip": "192.168.1.42" }
```

### Network Mode Endpoints (device is on the real network)

**`GET /api/status`**
Health check.
```json
{
  "uptime": 3600,
  "wifi_rssi": -42,
  "ip": "192.168.1.42",
  "ssid": "BoatWiFi"
}
```

**`GET /api/config`** / **`POST /api/config`**
Read or push YAML configuration. (Deferred — not needed for MVP demo.)

**`GET /api/firmware`** / **`POST /api/firmware`**
Check firmware version or upload new binary. (Deferred.)

## App Architecture

### Service Layer

```
src/services/
├── wifi/
│   ├── types.ts                      # WiFiNetwork, ProvisionRequest, DeviceInfo
│   ├── adapter.ts                    # Real HTTP calls to device API
│   ├── mock-adapter.ts               # Fake responses for development
│   └── WifiProvisioningService.ts    # Orchestrates provisioning flow
├── device/
│   ├── types.ts                      # PairedDevice, DeviceStatus
│   ├── DeviceManager.ts              # Paired device CRUD, connection checks
│   └── registry.ts                   # AsyncStorage persistence
├── qr/
│   ├── types.ts                      # QR payload schema
│   └── parser.ts                     # Validate + parse QR JSON
└── logger/
    └── logger.ts                     # Centralized logging (react-native-logs)
```

**Mock-first development:** `mock-adapter.ts` returns realistic fake data with simulated delays. Swap to `adapter.ts` when testing against real hardware or the simulator. Controlled by a dev settings toggle or environment variable.

### Zustand Store

```
src/store/
├── index.ts
└── slices/
    ├── onboardingSlice.ts    # Wizard state: current step, QR data, progress (NOT persisted)
    ├── deviceSlice.ts        # Paired devices list (persisted via AsyncStorage)
    └── appSlice.ts           # Preferences (persisted)
```

### Hooks

```
src/hooks/
├── useOnboarding.ts          # Wizard step transitions, provisioning actions
├── useDevices.ts             # Read/add/remove paired devices
└── useDeviceConnection.ts    # Check if paired device is reachable
```

### Data Flow

```
Component → Hook → Zustand Action → Service → Adapter → Device HTTP API
```

Components never import services or adapters directly.

## QR Code Payload Schema

```typescript
interface AlamiraQRPayload {
  ap_ssid: string;      // Device's soft-AP SSID (e.g., "Alamira-A3F2")
  ap_pass: string;      // Device's soft-AP password
  device_id: string;    // Unique device identifier (e.g., "ALM-2024-A3F2")
  api_port: number;     // Port the device API listens on (e.g., 8080)
}
```

## Development Strategy

### Phase 1: App with Mocks (current)
Build the full onboarding UI and service layer against mock adapters. No real networking. Testable in Expo Go or dev client on iPad.

### Phase 2: Device Simulator
Build a simple Node.js HTTP server (`tools/simulator/`) that implements the device API contract. Runs on your computer, generates a QR code in the browser. Test real HTTP communication between the app and simulator on the same WiFi network.

### Phase 3: Real Hardware
Swap mock adapter for real adapter. Work with manufacturer to implement the API endpoints on the OpenWrt device. Test end-to-end.

## Not Building Yet

- Config push UI (Step 6 is a placeholder)
- Firmware update flow
- Device simulator (Phase 2)
- mDNS discovery (can use IP from provision response for now)
- Multiple device management (one device is enough for demo)
