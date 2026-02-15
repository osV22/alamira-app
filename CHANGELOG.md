# Changelog

## 0.6.0 - February 15, 2026
### Added
- Simulator stub mode with in-app dev toggle for UI development without hardware
- Product info screen showing device model, serial, and firmware details
- Firmware update screen with version comparison, release notes, and progress bar
- Device-centric home screen with paired device cards, status indicators, and FAB
- SimulatorService as pure data factory for mock device data

### Changed
- Onboarding flow now routes through product-info and firmware-update screens
- Sim mode skips WiFi/verifying/configure steps, goes straight to naming

### Removed
- Old plan docs from docs/plans/ (moved to .claude/plans/)

## 0.5.0 - February 15, 2026
### Added
- Simulator app scaffold for testing without physical hardware
- Optional `ip` field in QR payload for custom device addresses

### Changed
- Device IP sourced from QR code instead of hardcoded AP host

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
