# Alamira Simulator App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a test tool (Expo app) that pretends to be an Alamira instrument display so Connect's full onboarding flow can be exercised end-to-end against a real HTTP target.

**Architecture:** Third Expo app at `apps/simulator/` in the monorepo. Tiny HTTP server (`react-native-http-bridge`) responds to Connect's existing REST API. QR code on screen encodes the simulator's IP + port. Console view logs all incoming requests. In-memory state, no persistence.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, react-native-http-bridge, react-native-qrcode-svg, NativeWind, @alamira/ui

**Design Doc:** `.claude/plans/2026-02-14-simulator-app-design.md`

---

## Parallel Execution Map

```
         Group A (scaffold)
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
  Group B   Group C  Group F
 (services) (UI)    (Connect changes)
     │        │        │
     └────────┼────────┘
              ▼
         Group D (app routes)
              │
              ▼
         Group E (verify)
```

**Agents per phase:**
- Phase 1: **1 agent** — Group A (scaffold, must complete first)
- Phase 2: **3 agents** — Groups B + C + F in parallel (independent apps/files)
- Phase 3: **1 agent** — Group D (wires everything together)
- Phase 4: **1 agent** — Group E (install + verify)

**Max parallel agents: 3** (Phase 2). Total: 6 agents across all phases.

---

## Group A: Monorepo Scaffold (1 agent)

All files created in sequence by one agent since they're fast and share context.

### Task A1: Create `apps/simulator/package.json`

**Files:**
- Create: `apps/simulator/package.json`

```json
{
  "name": "alamira-simulator",
  "main": "expo-router/entry",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "expo start",
    "dev": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@alamira/ui": "*",
    "expo": "~54.0.33",
    "expo-constants": "~18.0.13",
    "expo-router": "~6.0.23",
    "expo-status-bar": "~3.0.9",
    "nativewind": "^4.2.1",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-http-bridge": "^0.6.1",
    "react-native-qrcode-svg": "^6.3.12",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "^15.15.3"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.2"
  }
}
```

### Task A2: Create `apps/simulator/app.json`

**Files:**
- Create: `apps/simulator/app.json`

```json
{
  "expo": {
    "name": "Alamira Simulator",
    "slug": "alamira-simulator",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "alamira-simulator",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.alamira.simulator"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0F1419"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.alamira.simulator"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### Task A3: Create `apps/simulator/tsconfig.json`

**Files:**
- Create: `apps/simulator/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

### Task A4: Create `apps/simulator/tailwind.config.ts`

**Files:**
- Create: `apps/simulator/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

### Task A5: Create `apps/simulator/global.css`

**Files:**
- Create: `apps/simulator/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Task A6: Create `apps/simulator/metro.config.js`

**Files:**
- Create: `apps/simulator/metro.config.js`

Reference Connect's metro config if it has one. Otherwise:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });
```

### Task A7: Create directory structure

**Directories to create:**
```
apps/simulator/app/
apps/simulator/src/services/
apps/simulator/src/components/
apps/simulator/assets/
```

Copy placeholder asset files from `apps/connect/assets/images/` if available, or create minimal placeholders.

### Task A8: Commit scaffold

```bash
git add apps/simulator/package.json apps/simulator/app.json apps/simulator/tsconfig.json apps/simulator/tailwind.config.ts apps/simulator/global.css apps/simulator/metro.config.js
git commit -m "feat(simulator): scaffold Expo app in monorepo"
```

---

## Group B: Service Layer (1 agent, parallel with C and F)

### Task B1: Create `apps/simulator/src/types.ts`

**Files:**
- Create: `apps/simulator/src/types.ts`

These types MUST match Connect's `WifiAdapter` expectations exactly.

```typescript
/** Matches Connect's DeviceInfo in apps/connect/src/services/wifi/types.ts */
export interface DeviceInfo {
  device_id: string;
  model: string;
  firmware_version: string;
  serial: string;
}

/** Matches Connect's WiFiNetwork */
export interface WiFiNetwork {
  ssid: string;
  rssi: number;
  security: 'Open' | 'WEP' | 'WPA' | 'WPA2' | 'WPA3';
}

/** Matches Connect's WifiScanResponse */
export interface WifiScanResponse {
  networks: WiFiNetwork[];
}

/** Matches Connect's ProvisionRequest */
export interface ProvisionRequest {
  ssid: string;
  password: string;
}

/** Matches Connect's ProvisionResponse */
export interface ProvisionResponse {
  success: boolean;
  ip: string;
}

/** Matches Connect's DeviceStatusResponse */
export interface DeviceStatusResponse {
  uptime: number;
  wifi_rssi: number;
  ip: string;
  ssid: string;
}

/** Simulator-only: message push from Connect */
export interface MessageRequest {
  message: string;
}

export interface MessageResponse {
  received: boolean;
}

/** QR payload — extends Connect's AlamiraQRPayload with `ip` field */
export interface SimulatorQRPayload {
  ap_ssid: string;
  ap_pass: string;
  device_id: string;
  api_port: number;
  ip: string;
}

/** Console log entry for display */
export interface LogEntry {
  timestamp: number;
  method: string;
  path: string;
  sourceIp?: string;
  body?: unknown;
  response?: unknown;
}
```

### Task B2: Create `apps/simulator/src/services/device-state.ts`

**Files:**
- Create: `apps/simulator/src/services/device-state.ts`

```typescript
import type { DeviceInfo, DeviceStatusResponse, SimulatorQRPayload } from '../types';

const DEVICE_ID = 'ALM-SIM-001';

interface DeviceState {
  device_id: string;
  model: string;
  firmware_version: string;
  serial: string;
  brightness: number;
  status: string;
  startTime: number;
  currentIp: string;
  provisionedSsid: string | null;
}

const state: DeviceState = {
  device_id: DEVICE_ID,
  model: 'Alamira Display Simulator',
  firmware_version: '1.0.0',
  serial: 'SIM-2026-001',
  brightness: 75,
  status: 'running',
  startTime: Date.now(),
  currentIp: '0.0.0.0',
  provisionedSsid: null,
};

export function setCurrentIp(ip: string): void {
  state.currentIp = ip;
}

export function provision(ssid: string): void {
  state.provisionedSsid = ssid;
}

export function getDeviceInfo(): DeviceInfo {
  return {
    device_id: state.device_id,
    model: state.model,
    firmware_version: state.firmware_version,
    serial: state.serial,
  };
}

export function getStatus(): DeviceStatusResponse {
  return {
    uptime: Math.floor((Date.now() - state.startTime) / 1000),
    wifi_rssi: -45,
    ip: state.currentIp,
    ssid: state.provisionedSsid ?? 'SimulatorAP',
  };
}

export function getQRPayload(port: number): SimulatorQRPayload {
  return {
    ap_ssid: 'ALAMIRA-SIM',
    ap_pass: 'simulator',
    device_id: state.device_id,
    api_port: port,
    ip: state.currentIp,
  };
}

export function getFullState() {
  return { ...state };
}
```

### Task B3: Create `apps/simulator/src/services/network.ts`

**Files:**
- Create: `apps/simulator/src/services/network.ts`

```typescript
import Constants from 'expo-constants';

/**
 * Get the device's IP on the local network.
 * In Expo dev mode, Constants.expoConfig.hostUri gives us "IP:PORT".
 */
export function getDeviceIp(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return '0.0.0.0';
}
```

### Task B4: Create `apps/simulator/src/services/server.ts`

**Files:**
- Create: `apps/simulator/src/services/server.ts`

```typescript
import httpBridge from 'react-native-http-bridge';
import * as deviceState from './device-state';
import type {
  ProvisionRequest,
  ProvisionResponse,
  WifiScanResponse,
  LogEntry,
} from '../types';

type LogCallback = (entry: LogEntry) => void;

let running = false;

export function startServer(port: number, onLog: LogCallback): void {
  if (running) return;

  httpBridge.start(port, 'alamira_sim', (request: any) => {
    const { requestId, type: method, url: path, postData } = request;

    let body: unknown = undefined;
    if (postData) {
      try {
        body = JSON.parse(postData);
      } catch {
        body = postData;
      }
    }

    const response = route(method, path, body);

    onLog({
      timestamp: Date.now(),
      method,
      path,
      body,
      response,
    });

    httpBridge.respond(
      requestId,
      200,
      'application/json',
      JSON.stringify(response),
    );
  });

  running = true;
}

export function stopServer(): void {
  if (!running) return;
  httpBridge.stop();
  running = false;
}

function route(method: string, path: string, body: unknown): unknown {
  if (method === 'GET' && path === '/api/info') {
    return deviceState.getDeviceInfo();
  }

  if (method === 'GET' && path === '/api/wifi/scan') {
    return handleWifiScan();
  }

  if (method === 'POST' && path === '/api/provision') {
    return handleProvision(body as ProvisionRequest);
  }

  if (method === 'GET' && path === '/api/status') {
    return deviceState.getStatus();
  }

  if (method === 'POST' && path === '/api/message') {
    return { received: true };
  }

  return { error: 'Not Found', path };
}

function handleWifiScan(): WifiScanResponse {
  return {
    networks: [
      { ssid: 'HomeNetwork', rssi: -42, security: 'WPA2' },
      { ssid: 'Marina_WiFi', rssi: -58, security: 'WPA2' },
      { ssid: 'Guest_Open', rssi: -71, security: 'Open' },
    ],
  };
}

function handleProvision(req: ProvisionRequest): ProvisionResponse {
  if (!req?.ssid) {
    return { success: false, ip: '' };
  }
  deviceState.provision(req.ssid);
  return {
    success: true,
    ip: deviceState.getStatus().ip,
  };
}
```

### Task B5: Commit service layer

```bash
git add apps/simulator/src/
git commit -m "feat(simulator): add service layer — HTTP server, device state, network util"
```

---

## Group C: UI Components (1 agent, parallel with B and F)

### Task C1: Create `apps/simulator/src/components/DeviceDisplay.tsx`

**Files:**
- Create: `apps/simulator/src/components/DeviceDisplay.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { SimulatorQRPayload } from '../types';

interface Props {
  qrPayload: SimulatorQRPayload;
  serverRunning: boolean;
}

export function DeviceDisplay({ qrPayload, serverRunning }: Props) {
  const qrValue = JSON.stringify(qrPayload);

  return (
    <View
      style={{ width: 760, height: 330 }}
      className="bg-[#1A1A2E] border border-gray-700 rounded-lg flex-row items-center px-8"
    >
      {/* QR Code */}
      <View className="items-center justify-center mr-8">
        <QRCode
          value={qrValue}
          size={220}
          backgroundColor="#1A1A2E"
          color="#FFFFFF"
        />
      </View>

      {/* Device Info */}
      <View className="flex-1 justify-center">
        <Text className="text-white text-xl font-bold mb-4">
          ALAMIRA SIMULATOR
        </Text>

        <InfoLine label="Device" value={qrPayload.device_id} />
        <InfoLine label="FW" value="1.0.0" />
        <InfoLine label="IP" value={qrPayload.ip} />
        <InfoLine label="Port" value={String(qrPayload.api_port)} />
        <InfoLine
          label="Status"
          value={serverRunning ? 'Running' : 'Starting...'}
          valueColor={serverRunning ? '#4ADE80' : '#FBBF24'}
        />
      </View>
    </View>
  );
}

function InfoLine({
  label,
  value,
  valueColor = '#E8ECF0',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center mb-1">
      <Text className="text-gray-400 text-sm w-16">{label}</Text>
      <Text style={{ color: valueColor }} className="text-sm font-mono">
        {value}
      </Text>
    </View>
  );
}
```

### Task C2: Create `apps/simulator/src/components/Console.tsx`

**Files:**
- Create: `apps/simulator/src/components/Console.tsx`

```typescript
import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

export function Console({ logs, onClear }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [logs.length]);

  return (
    <View className="flex-1 bg-black border border-gray-700 rounded-lg mt-4 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-800">
        <Text className="text-green-400 font-mono text-xs font-bold">
          CONSOLE ({logs.length})
        </Text>
        <Pressable onPress={onClear}>
          <Text className="text-gray-500 text-xs font-mono">CLEAR</Text>
        </Pressable>
      </View>

      {/* Log entries */}
      <ScrollView ref={scrollRef} className="flex-1 px-4 py-2">
        {logs.length === 0 ? (
          <Text className="text-gray-600 font-mono text-xs">
            Waiting for requests...
          </Text>
        ) : (
          logs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
      </ScrollView>
    </View>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const methodColor =
    entry.method === 'POST' ? 'text-yellow-400' : 'text-cyan-400';

  return (
    <View className="mb-2">
      <Text className="font-mono text-xs">
        <Text className="text-gray-500">{time} </Text>
        <Text className={methodColor}>{entry.method} </Text>
        <Text className="text-white">{entry.path}</Text>
      </Text>
      {entry.body != null && (
        <Text className="text-gray-400 font-mono text-xs ml-4">
          &rarr; {JSON.stringify(entry.body)}
        </Text>
      )}
      {entry.response != null && (
        <Text className="text-green-400 font-mono text-xs ml-4">
          &larr; {JSON.stringify(entry.response)}
        </Text>
      )}
    </View>
  );
}
```

### Task C3: Commit UI components

```bash
git add apps/simulator/src/components/
git commit -m "feat(simulator): add DeviceDisplay and Console components"
```

---

## Group F: Connect App Changes (1 agent, parallel with B and C)

Minimal changes to make Connect work with simulator's QR payload (which includes an `ip` field).

### Task F1: Add optional `ip` field to QR types

**Files:**
- Modify: `apps/connect/src/services/qr/types.ts`

**Change:**
```typescript
// OLD
export interface AlamiraQRPayload {
  ap_ssid: string;
  ap_pass: string;
  device_id: string;
  api_port: number;
}

// NEW
export interface AlamiraQRPayload {
  ap_ssid: string;
  ap_pass: string;
  device_id: string;
  api_port: number;
  ip?: string;
}
```

### Task F2: Parse optional `ip` field in QR parser

**Files:**
- Modify: `apps/connect/src/services/qr/parser.ts`

**Change the return statement only:**
```typescript
// OLD
    return {
      ap_ssid: data.ap_ssid,
      ap_pass: data.ap_pass,
      device_id: data.device_id,
      api_port: data.api_port,
    };

// NEW
    return {
      ap_ssid: data.ap_ssid,
      ap_pass: data.ap_pass,
      device_id: data.device_id,
      api_port: data.api_port,
      ...(typeof data.ip === 'string' && { ip: data.ip }),
    };
```

### Task F3: Use dynamic IP in WifiProvisioningService

**Files:**
- Modify: `apps/connect/src/services/wifi/WifiProvisioningService.ts`

**Changes:**
```typescript
// OLD (line 10)
const DEVICE_AP_HOST = '192.168.4.1';

// NEW
const DEFAULT_AP_HOST = '192.168.4.1';
```

```typescript
// OLD (connectToDevice method)
  async connectToDevice(qrData: AlamiraQRPayload): Promise<DeviceInfo> {
    wifiLog.info(
      `Connecting to device AP ${qrData.ap_ssid} at ${DEVICE_AP_HOST}:${qrData.api_port}`,
    );
    const deviceInfo = await this.adapter.getDeviceInfo(
      DEVICE_AP_HOST,
      qrData.api_port,
    );

// NEW
  async connectToDevice(qrData: AlamiraQRPayload): Promise<DeviceInfo> {
    const host = qrData.ip ?? DEFAULT_AP_HOST;
    wifiLog.info(
      `Connecting to device AP ${qrData.ap_ssid} at ${host}:${qrData.api_port}`,
    );
    const deviceInfo = await this.adapter.getDeviceInfo(
      host,
      qrData.api_port,
    );
```

### Task F4: Use dynamic IP in useOnboarding hook

**Files:**
- Modify: `apps/connect/src/hooks/useOnboarding.ts`

**Changes:**

```typescript
// OLD (line 9)
const AP_HOST = '192.168.4.1';

// DELETE this line entirely
```

```typescript
// OLD (in handleQRScan, ~line 51)
      const scannedNetworks = await wifiService.scanNetworks(
        AP_HOST,
        parsed.api_port,
      );

// NEW
      const host = parsed.ip ?? '192.168.4.1';
      const scannedNetworks = await wifiService.scanNetworks(
        host,
        parsed.api_port,
      );
```

```typescript
// OLD (in sendCredentials, ~line 87-90)
        const response = await wifiService.provision(
          AP_HOST,
          currentQrData.api_port,
          ssid,
          password,
        );

// NEW
        const host = currentQrData.ip ?? '192.168.4.1';
        const response = await wifiService.provision(
          host,
          currentQrData.api_port,
          ssid,
          password,
        );
```

### Task F5: Commit Connect changes

```bash
git add apps/connect/src/services/qr/ apps/connect/src/services/wifi/WifiProvisioningService.ts apps/connect/src/hooks/useOnboarding.ts
git commit -m "feat(connect): support dynamic IP from QR payload for simulator compatibility"
```

---

## Group D: App Routes (1 agent, after B + C complete)

### Task D1: Create `apps/simulator/app/_layout.tsx`

**Files:**
- Create: `apps/simulator/app/_layout.tsx`

```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F1419' },
        }}
      />
    </>
  );
}
```

### Task D2: Create `apps/simulator/app/index.tsx`

**Files:**
- Create: `apps/simulator/app/index.tsx`

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { DeviceDisplay } from '../src/components/DeviceDisplay';
import { Console } from '../src/components/Console';
import { startServer, stopServer } from '../src/services/server';
import * as deviceStateService from '../src/services/device-state';
import { getDeviceIp } from '../src/services/network';
import type { LogEntry, SimulatorQRPayload } from '../src/types';

const SERVER_PORT = 5561;

export default function SimulatorScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [qrPayload, setQrPayload] = useState<SimulatorQRPayload | null>(null);
  const [serverRunning, setServerRunning] = useState(false);

  useEffect(() => {
    const ip = getDeviceIp();
    deviceStateService.setCurrentIp(ip);

    const payload = deviceStateService.getQRPayload(SERVER_PORT);
    setQrPayload(payload);

    startServer(SERVER_PORT, (entry) => {
      setLogs((prev) => [...prev, entry]);
    });
    setServerRunning(true);

    return () => {
      stopServer();
      setServerRunning(false);
    };
  }, []);

  const handleClear = useCallback(() => {
    setLogs([]);
  }, []);

  if (!qrPayload) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F1419] items-center justify-center">
        <Text className="text-white text-lg">Starting simulator...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F1419]">
      <View className="flex-1 px-4 py-4">
        {/* Simulated display area */}
        <View className="items-center">
          <DeviceDisplay
            qrPayload={qrPayload}
            serverRunning={serverRunning}
          />
        </View>

        {/* Console */}
        <Console logs={logs} onClear={handleClear} />
      </View>
    </SafeAreaView>
  );
}
```

### Task D3: Commit app routes

```bash
git add apps/simulator/app/
git commit -m "feat(simulator): add root layout and main screen wiring services to UI"
```

---

## Group E: Install & Verify (1 agent, after D)

### Task E1: Install dependencies

```bash
cd /Users/ahmedg/code/github/alamira-app && yarn install
```

This will pick up the new `apps/simulator/` workspace and install all deps including `react-native-http-bridge` and `react-native-qrcode-svg`.

### Task E2: Typecheck

```bash
cd /Users/ahmedg/code/github/alamira-app && turbo typecheck --filter=@alamira/simulator
```

Fix any type errors. Likely issues:
- `react-native-http-bridge` may not have types — add a `src/types/react-native-http-bridge.d.ts` declaration file if needed:

```typescript
declare module 'react-native-http-bridge' {
  interface HttpRequest {
    requestId: string;
    type: string;
    url: string;
    postData?: string;
  }
  export function start(port: number, serviceName: string, callback: (request: HttpRequest) => void): void;
  export function stop(): void;
  export function respond(requestId: string, code: number, type: string, body: string): void;
}
```

### Task E3: Verify turbo filters work

```bash
turbo dev --filter=simulator
```

Confirm Expo dev server starts for the simulator app.

### Task E4: Final commit

```bash
git add -A apps/simulator/
git commit -m "feat(simulator): install deps, add type declarations, verify build"
```

---

## Summary

| Group | Agent | Tasks | Depends On | Files |
|-------|-------|-------|------------|-------|
| A | 1 | A1–A8 | — | Scaffold: package.json, app.json, tsconfig, tailwind, metro, global.css |
| B | 2 | B1–B5 | A | Services: types.ts, device-state.ts, network.ts, server.ts |
| C | 3 | C1–C3 | A | Components: DeviceDisplay.tsx, Console.tsx |
| F | 4 | F1–F5 | A | Connect: qr/types.ts, qr/parser.ts, WifiProvisioningService.ts, useOnboarding.ts |
| D | 5 | D1–D3 | B, C | Routes: _layout.tsx, index.tsx |
| E | 6 | E1–E4 | D, F | Install, typecheck, verify |

**Total: 6 agents, 24 tasks, 4 phases.**
