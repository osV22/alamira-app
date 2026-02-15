# Alamira Simulator App — Design Document

**Date:** 2026-02-14
**Status:** Approved

## Purpose

A test tool that pretends to be an Alamira instrument display so we can exercise the full Alamira Connect onboarding and device management flow against a real HTTP target. The simulator is a dumb responder — the value is proving Connect works end-to-end.

## Goals

1. Connect scans QR code → finds the simulator → pairs it → adds to paired devices list
2. Connect reads device info from the simulator (firmware, brightness, serial, etc.)
3. Connect pushes a string/config to the simulator → simulator displays it in a console
4. Bidirectional: Connect reads state, Connect writes state — both work

## Non-Goals

- No WiFi AP creation (React Native can't do it). Both devices on same network.
- No persistence. Fresh state every launch.
- No fancy UI. QR code + console log.
- No WebSockets. Pure HTTP request/response.
- No network scanning endpoint — unnecessary for this flow.

## Architecture

### Where it lives

```
apps/simulator/     # Third Expo app in the monorepo
```

Registered in `turbo.json` so `turbo dev --filter=simulator` works.

### How it works

```
SIMULATOR (tablet/second phone)          CONNECT (your phone)
─────────────────────────────           ─────────────────────
1. Launch app
2. Start HTTP server on :8080
3. Detect own IP on network
4. Show QR code with IP/port
   + device info on 760x330 screen
                                        5. Open QR scanner
                                        6. Scan QR → gets IP + port
                                        7. GET /api/info
8. Return device info  ──────────►      9. Show device details
                                        10. Pair → add to devices list
                                        11. POST /api/message "hello"
12. Show "hello" in console ◄────
```

### Screen layout (760x330 simulated display + console)

```
┌──────────────────────────────────────┐
│          ALAMIRA SIMULATOR           │
│                                      │
│    ┌──────────┐  Device: ALM-SIM-001 │
│    │ QR CODE  │  FW: 1.0.0           │
│    │          │  IP: 192.168.x.x     │
│    │          │  Port: 8080          │
│    └──────────┘  Status: Running     │
│                                      │
├──────────────────────────────────────┤
│ CONSOLE                     [CLEAR]  │
│ 12:01:00 Server started on :8080     │
│ 12:01:05 GET /api/info ← 192.168.1.5│
│ 12:01:06 POST /api/message "hello"   │
│ 12:01:06   → rendered to console     │
└──────────────────────────────────────┘
```

### QR code payload

Same format Connect already parses:

```json
{
  "ap_ssid": "ALAMIRA-SIM",
  "ap_pass": "simulator",
  "device_id": "ALM-SIM-001",
  "api_port": 8080
}
```

Note: `ap_ssid` and `ap_pass` are included for format compatibility but ignored (no real AP). Connect uses `api_port` and derives the IP from the QR scan context or the provision response.

### API endpoints

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/info` | GET | — | `{device_id, model, firmware_version, serial, brightness, status}` |
| `/api/provision` | POST | `{ssid, password}` | `{success: true, ip: "<simulator's real IP>"}` |
| `/api/status` | GET | — | `{uptime, rssi: -45, ssid: "SimNetwork", ip: "<real IP>"}` |
| `/api/message` | POST | `{message: "any string"}` | `{received: true}` |

All responses are `application/json`.

### In-memory device state

```typescript
const deviceState = {
  device_id: "ALM-SIM-001",
  model: "Alamira Display Simulator",
  firmware_version: "1.0.0",
  serial: "SIM-2026-001",
  brightness: 75,
  status: "running",
  uptime: 0,           // incremented by a 1s interval
};
```

No persistence. Fresh values on every app launch.

### Dependencies

| Package | Purpose |
|---------|---------|
| `react-native-http-bridge` | Tiny HTTP server inside the app |
| `react-native-qrcode-svg` | Render QR code on screen |
| `react-native-svg` | Required peer dep for QR code |
| `@alamira/ui` | Shared theme tokens (colors, fonts) |

### File structure

```
apps/simulator/
├── app/
│   ├── _layout.tsx              # Root layout (single screen, no tabs)
│   └── index.tsx                # Main screen — QR + console
├── src/
│   ├── services/
│   │   ├── server.ts            # HTTP server setup + request routing
│   │   ├── device-state.ts      # In-memory device state + getters/setters
│   │   └── network.ts           # Get device's real IP on the network
│   ├── components/
│   │   ├── DeviceDisplay.tsx    # 760x330 area with QR + device info
│   │   └── Console.tsx          # Scrollable log of requests/messages
│   └── types.ts                 # Shared types
├── app.json
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Connect App Changes

Minimal or none. The simulator implements the same HTTP API that Connect's `WifiAdapter` already calls. The flow should work as-is:

1. `scan.tsx` scans QR → `parseQRPayload()` extracts IP/port
2. `connecting.tsx` calls `WifiProvisioningService.connectToDevice()` → hits `/api/info`
3. Device gets added to paired devices list via `DeviceManager`
4. Future: device detail screen can `POST /api/message` to push strings

The only potential change is skipping the "join AP" step since both devices are already on the same network. If Connect's onboarding flow tries to switch WiFi networks (using the `ap_ssid` from the QR code), we may need a "simulator mode" flag or just manually skip that step during testing.

## Metrics — Files Touched Often

These files will be modified frequently during implementation:

| File | Reason |
|------|--------|
| `apps/simulator/src/services/server.ts` | Adding/modifying API endpoints |
| `apps/simulator/app/index.tsx` | Main screen layout adjustments |
| `apps/simulator/src/services/device-state.ts` | Adding new state fields |
| `apps/simulator/src/components/Console.tsx` | Console formatting/display |
| `apps/connect/src/services/wifi/adapter.ts` | If any adapter changes needed |
| `apps/connect/src/hooks/useOnboarding.ts` | If onboarding flow needs tweaks |
| `turbo.json` | Registering simulator in pipeline |
| Root `package.json` | Workspace registration |
