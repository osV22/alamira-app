# Changelog

## 0.4.0 - February 14, 2026
### Added
- Device onboarding flow (scan, WiFi setup, verify, name, complete)
- Device management with Zustand store and paired device list
- QR code scanning via expo-camera for device discovery
- Centralized logger via react-native-logs

### Changed
- Theme.ts is now single source of truth for all colors
- Tailwind configs import from theme.ts instead of hardcoding values
- TabBar and TextInput use theme tokens instead of inline color values
- Dashboard shows paired device status dynamically

### Removed
- Legacy boilerplate components (EditScreenInfo, StyledText, Themed, Colors.ts)

## 0.3.0 - February 14, 2026
### Added
- WiFi provisioning & device onboarding design doc (soft-AP approach, no BLE)
- BLE scanner design docs (superseded by WiFi-only approach, kept for reference)

### Changed
- Connect app iOS/Android scripts use `expo run` for dev client builds
- Connect app.json adds iOS bundle identifier
