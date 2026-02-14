# Alamira Project Design

Date: 2026-02-14

---

## Problem

We're building two related products:

1. **A hardware marine instrument display** — a physical device (LVGL/C on ESP32) that connects to a boat's Signal K server or NMEA bus and shows real-time data (speed, depth, wind, etc.)
2. **A mobile app ecosystem** to support the hardware and grow a user base before the hardware ships.

The hardware is still in MVP / pre-production. We need a companion app ready for a manufacturer demo. Separately, we want a free instrument display app that acts as a lead generation / sales funnel — users get free boat instruments on their phone, discover Alamira, and eventually buy the hardware.

---

## Decisions Made

### Two apps, not one

- **Companion app** — pairs with Alamira hardware displays via BLE. Handles setup, config push, firmware updates. Only useful if you own an Alamira device.
- **Instrument display app** — free app for any boater. Connects to Signal K / NMEA sources and shows real-time boat data on the phone. Includes subtle Alamira branding and a newsletter signup to funnel users toward the hardware product.

Rationale: keeping them separate means each app has a focused purpose and clean UX. The sales funnel still works — the instrument app collects emails, we market the hardware via newsletter. Users who buy hardware download the companion app when they need it (high motivation at that point, so the second install is not a friction problem).

### Monorepo for the two React Native apps

```
alamira/                              ← Monorepo (Turborepo)
├── apps/
│   ├── companion/                    ← Hardware companion app (priority)
│   └── instruments/                  ← Free boat instrument display (phase 2)
├── packages/
│   ├── boat-data/                    ← Shared: Signal K client, NMEA parsers, types
│   ├── ui/                           ← Shared: common UI components, theme
│   └── assets/                       ← Shared: logos, fonts, brand assets
├── turbo.json
└── package.json
```

- Turborepo is used as a local build orchestration tool only. No Vercel cloud services (no remote caching, no Vercel hosting, no Vercel deployment).
- The two apps share a data layer (`packages/boat-data/`) since both need to understand Signal K paths and boat data types.
- Shared UI components and brand assets avoid duplication.

### Firmware stays in a separate repo

The hardware firmware (`lv_web_emscripten`) is C/LVGL with CMake/Emscripten. Different language, different build toolchain, almost no shared code with the TypeScript apps. Keeping it separate avoids unnecessary complexity in the monorepo.

---

## Phase 1: Companion App (Manufacturer Demo)

### Purpose

Demonstrate to manufacturers that the Alamira hardware display has a polished companion app. The demo needs to show two flows: pairing a device and pushing a configuration to it.

### Scope

**Pairing flow:**
1. BLE scan for nearby Alamira displays (filtered by service UUID)
2. User selects their device from the discovered list
3. Establish BLE connection, read device info (name, firmware version, hardware revision)
4. User names the device for easy identification
5. Device saved to local registry (persisted in AsyncStorage)

**Config push flow:**
1. Select a paired device from the device list
2. Load or edit a YAML configuration (display layout, data source selection, themes)
3. Validate the config against a schema before sending
4. Push the config to the device over WiFi HTTP
5. Confirm the device received and applied the config

### Stack

Follows the existing architecture guide (`notes/architecture-guide.md`):

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo (SDK 54) |
| Routing | Expo Router v5 |
| State | Zustand (slices pattern) |
| BLE | react-native-ble-plx behind adapter pattern |
| WiFi / HTTP | react-native-wifi-reborn + fetch |
| Config parsing | js-yaml |
| Logging | react-native-logs |
| Build | EAS Build + Dev Client (required for BLE native modules) |

### Architecture

The companion app follows the architecture guide's patterns:

- **Services have no React dependency.** BLE, network, config, device management are plain TypeScript.
- **Adapter pattern for BLE.** Only `adapter.ts` imports react-native-ble-plx.
- **Hooks bridge services to UI.** Components never import services directly.
- **Thin route files.** `app/` directory contains only routing wrappers.
- **Zustand slices** for domain state (BLE, devices, network, app).

### App structure (companion)

```
apps/companion/
├── app/                              ← Expo Router routes
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                 ← Dashboard / home
│   │   ├── devices.tsx               ← Paired devices list
│   │   └── settings.tsx
│   ├── device/
│   │   └── [deviceId].tsx            ← Device detail
│   └── onboarding/
│       └── pair.tsx                  ← Pairing wizard
├── src/
│   ├── components/
│   ├── services/
│   │   ├── ble/                      ← BLE scanning, connection, communication
│   │   ├── network/                  ← mDNS discovery, HTTP client
│   │   ├── device/                   ← Device manager, registry
│   │   ├── config/                   ← YAML validation, config push
│   │   └── logger/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   └── utils/
├── app.json
└── package.json
```

---

## Phase 2: Instrument Display App (Future)

### Purpose

Free app for any boater. Connects to the boat's Signal K server (or NMEA 0183/2000 gateways directly) and displays real-time instrument data on the phone. Acts as a lead generation tool — users sign up for the Alamira newsletter and eventually convert to hardware customers.

### Scope (high level, to be detailed when we build it)

- Connect to Signal K server via WebSocket (auto-discovery via mDNS)
- Connect to NMEA 0183 via TCP socket
- Connect to NMEA 2000 via gateway → TCP
- Normalize all data to Signal K-style paths in a unified data store
- Customizable dashboard with gauge widgets (speed, depth, wind, compass, etc.)
- Day/night/red theme switching
- Newsletter signup during onboarding (subtle, non-blocking)
- Alamira branding with "hardware coming soon" hints

### Shared code (via packages/)

- `packages/boat-data/` — Signal K client wrapper, NMEA parsers, boat data types, unit conversion
- `packages/ui/` — shared theme, brand colors, common components
- `packages/assets/` — logos, fonts

---

## Email Collection Strategy

Both apps include a non-blocking newsletter signup during onboarding:

- Appears as a screen in the onboarding flow (not a popup, not a paywall)
- Messaging: "Alamira is building next-gen marine instrument displays. Want early access? Drop your email."
- Users can skip it entirely
- Backend: simple API endpoint (Supabase deferred; can start with any basic email collection service)
- Collected emails are used for product announcements and hardware launch marketing

---

## Constraints

- **No Vercel cloud services.** Turborepo local tool only. No Vercel hosting, remote caching, or deployment.
- **EAS Build for native binaries.** Free tier is sufficient for now. Can build locally as alternative.
- **No Supabase for MVP.** Auth and cloud sync are deferred. Everything persists locally (AsyncStorage) for now.
- **Expo SDK 54.** Not 55. SDK 54 is battle-tested and all dependencies are confirmed compatible.
- **Apps ship via App Store / Google Play.** Normal native app distribution. No web hosting needed for the apps themselves.
