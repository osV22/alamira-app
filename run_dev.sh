#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'

# ─── Preflight ────────────────────────────────────────────────────────
if ! command -v gum &>/dev/null; then
  echo "gum is required but not installed."
  echo "Install it with: brew install gum"
  exit 1
fi

MONOREPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# ─── Step 1: Pick an app ─────────────────────────────────────────────
echo -e "\n${BOLD}${CYAN}Alamira Dev Launcher${RESET}\n"

APP=$(gum choose --header "Which app?" \
  "connect    — Hardware companion app" \
  "simulator  — Device simulator" \
  "sk         — Boat instrument display")

# Extract just the app name (first word)
APP_NAME=$(echo "$APP" | awk '{print $1}')
APP_DIR="$MONOREPO_ROOT/apps/$APP_NAME"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found: $APP_DIR"
  exit 1
fi

# ─── Step 2: Discover targets ────────────────────────────────────────
TARGETS=()

# Physical iOS devices (via xctrace, excluding simulators)
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  TARGETS+=("$line")
done < <(xcrun xctrace list devices 2>/dev/null \
  | grep -iv "simulator" \
  | grep -iE "iphone|ipad" \
  | sed 's/^/📱 /' || true)

# iOS Simulators
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  TARGETS+=("$line")
done < <(xcrun simctl list devices available 2>/dev/null \
  | grep -iE "iphone|ipad" \
  | sed 's/^[[:space:]]*/🖥  /' || true)

# Android devices (if adb is available)
if command -v adb &>/dev/null; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    serial=$(echo "$line" | awk '{print $1}')
    model=$(adb -s "$serial" shell getprop ro.product.model 2>/dev/null || echo "$serial")
    TARGETS+=("🤖 $model ($serial)")
  done < <(adb devices 2>/dev/null | tail -n +2 | grep -v "^$" || true)
fi

# Always add Expo Go at the bottom
TARGETS+=("🌐 Expo Go (QR code / browser)")

# ─── Step 3: Pick a target ───────────────────────────────────────────
TARGET=$(printf '%s\n' "${TARGETS[@]}" | gum choose --header "Run on which device?")

# ─── Step 4: Build the command ────────────────────────────────────────
# expo start  → dev server only (Expo Go / QR code)
# expo run:ios -d <device> → build + run on specific device or simulator
# expo run:android -d <device> → build + run on Android device

EXPO_CMD="start"
EXPO_ARGS=()

case "$TARGET" in
  📱*)
    # Physical iOS device — extract UDID from parentheses
    UDID=$(echo "$TARGET" | grep -oE '\([A-F0-9-]{20,}\)' | tr -d '()')
    EXPO_CMD="run:ios"
    if [[ -n "$UDID" ]]; then
      EXPO_ARGS+=(-d "$UDID")
    else
      EXPO_ARGS+=(-d)
    fi
    ;;
  🖥*)
    # iOS Simulator — extract UDID
    SIM_UDID=$(echo "$TARGET" | grep -oE '\([A-F0-9-]{20,}\)' | tr -d '()')
    EXPO_CMD="run:ios"
    if [[ -n "$SIM_UDID" ]]; then
      EXPO_ARGS+=(-d "$SIM_UDID")
    else
      EXPO_ARGS+=(-d)
    fi
    ;;
  🤖*)
    # Android device
    SERIAL=$(echo "$TARGET" | grep -oE '\([^ )]+\)$' | tr -d '()')
    export ANDROID_SERIAL="$SERIAL"
    EXPO_CMD="run:android"
    EXPO_ARGS+=(-d "$SERIAL")
    ;;
  🌐*)
    # Expo Go — just start the dev server with QR code
    EXPO_CMD="start"
    EXPO_ARGS+=(--go)
    ;;
esac

# ─── Step 5: Launch ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}▶ Starting ${APP_NAME}${RESET}"
echo -e "${DIM}  cd apps/${APP_NAME} && npx expo ${EXPO_CMD} ${EXPO_ARGS[*]}${RESET}"
echo ""

cd "$APP_DIR"
exec npx expo "$EXPO_CMD" "${EXPO_ARGS[@]}"
