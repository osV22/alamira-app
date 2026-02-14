#!/bin/bash
# Run Alamira Connect on a physical iOS device
# Usage: ./run-device.sh

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

cd "$(dirname "$0")"

echo "Scanning for connected devices..."
echo ""

# Get physical devices from xctrace (between "== Devices ==" and next "==")
# Filter out Mac, offline, and simulators
raw=$(xcrun xctrace list devices 2>&1 | sed -n '/^== Devices ==$/,/^== /p' | grep -v "^==" | grep -v "MacBook\|Mac Studio\|Mac Pro\|Mac mini\|iMac" | grep -v "^$")

devices=()
udids=()

while IFS= read -r line; do
  [ -z "$line" ] && continue
  # Extract UDID: last parenthesized value on the line
  udid=$(echo "$line" | grep -oE '\([A-F0-9-]{20,}\)' | tr -d '()')
  [ -z "$udid" ] && continue
  # Device name is everything before the UDID portion
  name=$(echo "$line" | sed "s/ ($udid)//" | sed 's/ *$//')
  devices+=("$name")
  udids+=("$udid")
done <<< "$raw"

if [ ${#devices[@]} -eq 0 ]; then
  echo "No physical devices found. Connect a device via USB and try again."
  exit 1
fi

if [ ${#devices[@]} -eq 1 ]; then
  selected=0
  echo "Found: ${devices[0]}"
else
  echo "Available devices:"
  echo ""
  for i in "${!devices[@]}"; do
    echo "  $((i + 1))) ${devices[$i]}"
  done
  echo ""

  while true; do
    read -rp "Select device [1-${#devices[@]}]: " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#devices[@]} ]; then
      selected=$((choice - 1))
      break
    fi
    echo "Invalid choice. Try again."
  done
fi

echo ""
echo "Building for: ${devices[$selected]}"
echo "UDID: ${udids[$selected]}"
echo ""

npx expo run:ios --device "${udids[$selected]}"
