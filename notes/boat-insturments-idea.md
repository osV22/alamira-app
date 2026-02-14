# Building a React Native Expo Marine Instrument App
## Reference Repos & Libraries — Client-Side Consumer Perspective

**Your setup:** Boat already has a Signal K server on a Raspberry Pi, NMEA 2000, NMEA 0183, and SeaTalk devices advertising over WiFi. You're building a React Native Expo mobile app that **consumes** data from these three input sources to visualize boat sensor data. Essentially, you're building an open-source WilhelmSK.

---

## The Honest Reality

There is **no existing open-source React Native app** that does what you want. The marine open-source ecosystem builds its front-ends as web apps (Angular, React DOM, plain HTML Canvas), not React Native. You'll be pioneering here, but you have excellent building blocks.

Your app needs to handle three distinct connection types, each with different protocols:

| Source | Transport | Protocol | JS Library |
|--------|-----------|----------|------------|
| **Signal K** | WebSocket + REST | JSON deltas | `@signalk/client` |
| **NMEA 0183** | TCP (port 10110 typically) | ASCII sentences | `nmea-simple` or `GPS.js` |
| **NMEA 2000** | Via gateway → TCP or Signal K | Binary PGNs → JSON | `@canboat/canboatjs` |

---

## Tier 1: Libraries You'll Directly `npm install`

### 1. @signalk/client (Signal K JavaScript Client SDK)
- **URL:** https://github.com/SignalK/signalk-js-client
- **npm:** `@signalk/client`
- **What it does:** The official JS SDK for Signal K. Handles WebSocket connection, REST API calls, mDNS/Bonjour server discovery, authentication, delta stream subscription, reconnection logic, and keepalive.
- **Why it's critical:** This is your primary data pipe. When your user selects "Signal K" as their connection type, this library does the heavy lifting. It handles the entire Signal K subscription protocol — you subscribe to paths like `navigation.speedOverGround` and get real-time JSON deltas pushed over WebSocket.
- **React Native compatibility:** Uses standard WebSocket API under the hood, which React Native supports natively. The Bonjour/mDNS discovery part will need a React Native mDNS library (like `react-native-zeroconf`) since it uses Node.js `bonjour` by default.
- **Key code pattern:**
```javascript
import Client from '@signalk/client'
const client = new Client({
  hostname: '192.168.1.100',  // boat's SK server IP
  port: 3000,
  useTLS: false,
  reconnect: true,
  deltaStreamBehaviour: 'self',  // only own vessel data
})
client.on('delta', (delta) => {
  // delta.updates[].values[] contains { path, value } pairs
  // e.g. { path: 'navigation.speedOverGround', value: 3.5 }
})
client.connect()
```

### 2. nmea-simple (NMEA 0183 Parser)
- **URL:** https://github.com/101100/nmea-simple
- **npm:** `nmea-simple`
- **Stars:** ~100+ | **Language:** TypeScript
- **What it does:** Pure JavaScript NMEA 0183 sentence parser and encoder. Supports GGA, RMC, GSA, GSV, VTG, GLL, HDT, MWV (wind), DBT/DPT (depth), and more. Extensible with custom/proprietary sentences.
- **Why it's critical:** When your user connects directly to an NMEA 0183 WiFi gateway (like a Digital Yacht or Vesper), the data comes as raw ASCII sentences over TCP. This library parses `$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,...` into structured objects.
- **React Native compatibility:** Pure JS, no native dependencies. Works anywhere.
- **Alternative:** `GPS.js` (https://github.com/infusion/GPS.js) — ~250 stars, also pure JS, recommended by the react-native-nmea-library project.

### 3. @canboat/canboatjs (NMEA 2000 Parser)
- **URL:** https://github.com/canboat/canboatjs
- **npm:** `@canboat/canboatjs`
- **Stars:** ~80+ | **Language:** TypeScript
- **What it does:** Parses and encodes NMEA 2000 PGN messages. Supports Actisense, iKonvert, Yacht Devices, and SocketCAN formats. Outputs structured JSON compatible with Signal K.
- **Why it matters:** If a user has an NMEA 2000 WiFi gateway (like a Yacht Devices YDWG-02) that streams raw N2K data over TCP, this is how you decode it. In practice though, most users will go through Signal K Server which already uses canboatjs internally — so this is more of a "direct N2K connection" option.
- **React Native compatibility:** TypeScript, should work but the serial/hardware parts won't apply. The parsing functions are pure JS.

---

## Tier 2: Front-End Architecture References (Study the Patterns, Not the Framework)

### 4. SignalK/instrumentpanel — **Your #1 Architecture Reference**
- **URL:** https://github.com/SignalK/instrumentpanel
- **Stars:** ~50+ | **Forks:** ~30+ | **Language:** React (JavaScript)
- **License:** Apache 2.0
- **Why it's your best reference:** It's **React**. Not React Native, but the component patterns, state management, and Signal K data flow translate almost 1:1. This is a draggable/resizable grid of instrument widgets that auto-discovers Signal K data paths and creates appropriate gauge types.
- **Key patterns to extract:**
  - **WebSocket delta handler** → how it receives Signal K deltas and routes them to the right widget
  - **Widget type selection** → how it picks the right gauge type (compass, numeric, indicator) based on the Signal K path metadata
  - **Auto-discovery** → how it discovers all available data paths from the server and lets users pick what to display
  - **Grid layout** → draggable/resizable widget grid (you'd use something like `react-native-draggable-grid` instead)
  - **Unit conversion** → how it handles Signal K's SI units → display units (m/s → knots, radians → degrees, Kelvin → °F)

### 5. mxtommy/Kip — **Your UI/UX Feature Spec**
- **URL:** https://github.com/mxtommy/Kip
- **Stars:** ~100+ | **Language:** Angular/TypeScript
- **License:** MIT | **Status:** Very active (v4.x in 2025)
- **Why it matters:** KIP is the most feature-complete Signal K instrument panel. It's Angular, so you can't reuse the code, but it's your **feature roadmap** and **gauge design reference**. Every widget type you'd want to build is here.
- **Widget types to replicate:**
  - Radial gauge (speed, RPM, wind speed)
  - Compass gauge (heading, bearing, wind angle)
  - Wind steering display (the classic sailboat wind gauge)
  - Level gauge (heel/pitch indicator)
  - Boolean control panel (switches, pumps)
  - Data chart (time-series trends)
  - AIS radar display
  - Autopilot head (mode control + heading adjust)
  - Zone state panel (multi-sensor health monitoring)
- **Key patterns:**
  - Signal K path subscription with zone-based alerting (alarm/warn/nominal)
  - Day/night/red theme switching
  - Dashboard profiles (different layouts for different roles/screens)
  - Kiosk mode (fullscreen, no chrome)

### 6. ieb/sailinstruments — **Gauge Rendering Reference**
- **URL:** https://github.com/ieb/sailinstruments
- **Stars:** ~17 | **Language:** JavaScript (HTML5 Canvas)
- **Why it matters:** Pure Canvas-based instrument rendering. Shows exactly how to draw a marine compass rose, wind angle indicator, VMG target markers, and polar performance displays. The rendering logic translates well to React Native's `react-native-canvas` or `react-native-svg`.
- **Key insight from the author:** He switched from SVG to Canvas because SVG was too CPU-heavy on tablets. You'll face the same decision in React Native — SVG (via `react-native-svg`) vs Canvas vs Skia (via `@shopify/react-native-skia`).

---

## Tier 3: Mobile App References (Closest to Your Use Case)

### 7. itemir/signalk_mobile — **The Mobile Blueprint**
- **URL:** https://github.com/itemir/signalk_mobile
- **Stars:** ~30+ | **Language:** TypeScript (Ionic 2/Cordova)
- **License:** Apache 2.0
- **Why it matters despite being Ionic:** This is the only open-source mobile app purpose-built for Signal K. The TypeScript code shows exactly the mobile-specific challenges you'll face:
  - **mDNS server discovery** on a local network (finding the Signal K server automatically)
  - **Connection state management** (connected/disconnected/reconnecting with a boat WiFi that drops constantly)
  - **Google Maps integration** with AIS vessel overlay
  - **Sensor display organization** (depth, speed, course, wind, environmental)
- **Connection handling code** is particularly valuable — boats have unreliable WiFi and your app needs robust reconnection.

### 8. WilhelmSK (Closed Source — Your Competitive Benchmark)
- **Website:** https://www.wilhelmsk.com
- **Setup repo:** https://github.com/sbender9/wilhelmsk-node-server-setup
- **Dashboard examples:** https://github.com/gregsyoung/WilhelmSK-SignalK
- **Price:** $20 on App Store | **Platform:** Native iOS (Swift)
- **Why it's essential to study:** This IS the app you're building, just closed-source and iOS-only. Buy it, use it on your boat, and reverse-engineer the UX. The developer (Scott Bender) is also the primary maintainer of signalk-server itself.
- **Feature list = your product spec:**
  - Multi-page customizable gauge layouts
  - Signal K WebSocket + NMEA 0183 direct + Raymarine WiFi connections
  - Navionics chart integration
  - AIS vessel display with TCPA/CPA
  - Autopilot control (Raymarine, Garmin, B&G)
  - Fusion stereo control
  - Anchor alarm with push notifications (even when off-boat WiFi)
  - Apple Watch companion
  - Victron device monitoring
  - Custom gauge templates (shareable via AirDrop)
  - Siri shortcuts ("Drop the anchor in WilhelmSK")
  - Day/Night/Red themes

---

## Tier 4: Signal K Data Model & Specification

### 9. SignalK/specification — **Your Data Dictionary**
- **URL:** https://github.com/SignalK/specification
- **Stars:** ~97 | **Language:** JSON Schema
- **Why it's essential:** Defines every possible data path your app will consume. When you build a "Add Gauge" screen, you'll query the Signal K server for available paths and this spec tells you what they mean.
- **Key path categories for your app:**
  - `navigation.*` — position, COG, SOG, heading, attitude (pitch/roll)
  - `environment.wind.*` — speedApparent, speedTrue, angleApparent, angleTrue
  - `environment.water.*` — temperature
  - `environment.depth.*` — belowTransducer, belowKeel, belowSurface
  - `electrical.batteries.*` — voltage, current, temperature, capacity
  - `tanks.*` — fuel, freshWater, blackWater levels
  - `propulsion.*` — RPM, temperature, oil pressure, hours
  - `steering.rudderAngle`
  - `navigation.courseGreatCircle.*` — active route info

### 10. signalk-server REST API — **What You'll Actually Call**
- **URL:** https://github.com/SignalK/signalk-server
- **Docs:** https://demo.signalk.org/documentation/
- **Key endpoints your app will use:**
  - `GET /signalk/v1/api/vessels/self` — full state snapshot
  - `WS /signalk/v1/stream?subscribe=self` — real-time delta stream
  - `GET /signalk/v1/api/vessels/self/navigation/position` — specific path
  - `PUT /signalk/v1/api/vessels/self/steering/autopilot/state` — send commands
  - `GET /signalk/v2/api/resources/routes` — routes/waypoints
- **Demo server:** `demo.signalk.org` — use this for development without being on your boat!

---

## Tier 5: TCP/Network Libraries for React Native Expo

### 11. react-native-tcp-socket
- **URL:** https://github.com/nicklockwood/react-native-tcp-socket (or Roto93's fork)
- **npm:** `react-native-tcp-socket`
- **What it does:** TCP client/server for React Native. You need this for direct NMEA 0183 connections (most NMEA WiFi gateways expose a TCP server on port 10110).
- **Why it matters:** For the "NMEA 0183" connection type in your app, you'll open a TCP socket to the gateway IP:port, receive raw NMEA sentences line-by-line, and pipe them through `nmea-simple` for parsing.
- **Expo compatibility:** Requires a dev client / custom build (not Expo Go compatible). You'll need `expo-dev-client`.

### 12. react-native-zeroconf
- **URL:** https://github.com/nicklockwood/react-native-zeroconf (or Balthazar's)
- **npm:** `react-native-zeroconf`
- **What it does:** mDNS/Bonjour service discovery for React Native. Signal K servers advertise themselves via mDNS as `_signalk-http._tcp` and `_signalk-ws._tcp`.
- **Why it matters:** Auto-discovery. When the user opens your app on the boat WiFi, it should automatically find the Signal K server without manual IP entry. This is how WilhelmSK and the Signal K mobile app do it.

---

## Recommended App Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 YOUR REACT NATIVE EXPO APP                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Connection Manager                       │   │
│  │                                                       │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │   │
│  │  │ Signal K    │ │ NMEA 0183    │ │ NMEA 2000    │  │   │
│  │  │ Provider    │ │ Provider     │ │ Provider     │  │   │
│  │  │             │ │              │ │              │  │   │
│  │  │ @signalk/   │ │ TCP socket + │ │ TCP socket + │  │   │
│  │  │ client      │ │ nmea-simple  │ │ canboatjs    │  │   │
│  │  │ (WebSocket) │ │ (port 10110) │ │ (gateway)    │  │   │
│  │  └──────┬──────┘ └──────┬───────┘ └──────┬───────┘  │   │
│  │         │               │                │           │   │
│  │         └───────────────┼────────────────┘           │   │
│  │                         ▼                             │   │
│  │              Unified Data Store                       │   │
│  │         (normalized to Signal K paths)                │   │
│  │     e.g. Zustand / Redux / Context + useReducer      │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              Visualization Layer                       │   │
│  │                                                       │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │Compass │ │ Wind   │ │ Depth  │ │Battery │       │   │
│  │  │Gauge   │ │ Rose   │ │ Gauge  │ │Monitor │       │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │  Map/  │ │ Engine │ │ Tank   │ │Autopilot│      │   │
│  │  │  AIS   │ │  RPM   │ │ Levels │ │  Head  │       │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**The key architectural insight:** Regardless of whether data comes in via Signal K WebSocket, raw NMEA 0183 TCP, or NMEA 2000 gateway, you normalize everything into Signal K-style paths in your unified data store. Your gauge components only know about Signal K paths — they don't care about the source. This is exactly how Signal K Server itself works, and it's how KIP, instrumentpanel, and WilhelmSK all work.

---

## Priority Study Order

| # | Repo | What to Extract |
|---|------|----------------|
| 1 | **SignalK/instrumentpanel** | React component patterns, WebSocket delta handling, widget auto-discovery |
| 2 | **@signalk/client** source | Connection management, auth flow, subscription protocol, reconnection |
| 3 | **itemir/signalk_mobile** | Mobile-specific: mDNS discovery, connection UX, offline handling |
| 4 | **mxtommy/Kip** | Widget architecture, gauge config system, zone alerting, themes |
| 5 | **ieb/sailinstruments** | Canvas-based gauge rendering, VMG calculations, polar displays |
| 6 | **nmea-simple** source | NMEA 0183 sentence parsing patterns for your TCP provider |
| 7 | **SignalK/specification** | Data model paths — what data is available and what format it's in |
| 8 | **WilhelmSK** (buy + use it) | UX patterns, feature expectations, what users actually want |

---

## Expo-Specific Gotchas

1. **TCP sockets** (`react-native-tcp-socket`) require a custom dev client — you can't use Expo Go for NMEA 0183 direct connections.
2. **mDNS** (`react-native-zeroconf`) also requires native modules — same deal with dev client.
3. **WebSocket** (for Signal K) works out of the box in Expo Go — no native module needed.
4. **For development**, use `demo.signalk.org` as your Signal K server. It streams real boat data and you don't need to be on your boat.
5. **Gauge rendering**: Consider `react-native-svg` for simple gauges, `@shopify/react-native-skia` for high-performance canvas-style rendering (compass roses, wind indicators).
6. The `@signalk/client` library uses Node.js `bonjour` for mDNS which won't work in RN — you'll need to swap that for `react-native-zeroconf` and handle discovery separately.