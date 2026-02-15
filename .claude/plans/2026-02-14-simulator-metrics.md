# Simulator Implementation — File Metrics

Tracks files that will be touched frequently during implementation and ongoing development. Use this to understand blast radius of changes and identify merge conflicts between parallel agents.

## Hot Files (touched by multiple agents or modified frequently)

| File | Touch Count | Agents | Risk |
|------|-------------|--------|------|
| `apps/simulator/src/services/server.ts` | HIGH | B, D | Every new endpoint = change here |
| `apps/simulator/src/types.ts` | HIGH | B, C, D | Shared types, touched by all simulator code |
| `apps/simulator/app/index.tsx` | MEDIUM | D | Wires services + components, layout changes |
| `apps/simulator/src/services/device-state.ts` | MEDIUM | B, D | New state fields = change here |
| `apps/simulator/src/components/Console.tsx` | MEDIUM | C | Log formatting tweaks |
| `apps/connect/src/hooks/useOnboarding.ts` | LOW | F | One-time IP change |
| `apps/connect/src/services/wifi/WifiProvisioningService.ts` | LOW | F | One-time IP change |

## Conflict-Free Zones (safe for parallel work)

These files are touched by exactly one agent and will never conflict:

| File | Agent |
|------|-------|
| `apps/simulator/package.json` | A |
| `apps/simulator/app.json` | A |
| `apps/simulator/tsconfig.json` | A |
| `apps/simulator/metro.config.js` | A |
| `apps/simulator/src/services/network.ts` | B |
| `apps/simulator/src/components/DeviceDisplay.tsx` | C |
| `apps/connect/src/services/qr/types.ts` | F |
| `apps/connect/src/services/qr/parser.ts` | F |

## Cross-App Boundary

The only files where simulator and Connect code interact:

| Simulator File | Connect File | Shared Contract |
|---------------|-------------|-----------------|
| `src/types.ts` (DeviceInfo) | `services/wifi/types.ts` (DeviceInfo) | Must match field names exactly |
| `src/types.ts` (ProvisionResponse) | `services/wifi/types.ts` (ProvisionResponse) | `{success, ip}` |
| `src/types.ts` (DeviceStatusResponse) | `services/wifi/types.ts` (DeviceStatusResponse) | `{uptime, wifi_rssi, ip, ssid}` |
| `src/types.ts` (SimulatorQRPayload) | `services/qr/types.ts` (AlamiraQRPayload) | Same fields + optional `ip` |

**Rule:** If you change a type in Connect's `wifi/types.ts`, update the matching type in Simulator's `types.ts` and vice versa.

## Post-Implementation: Ongoing Development Hot Files

Once the simulator is built, these files will be modified most often as features are added:

1. **`server.ts`** — every new API endpoint
2. **`device-state.ts`** — every new device property (e.g., adding config storage)
3. **`types.ts`** — every new request/response shape
4. **`Console.tsx`** — log display improvements
5. **`index.tsx`** — screen layout changes
