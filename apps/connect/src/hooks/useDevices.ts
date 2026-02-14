import { useCallback } from 'react';

import type { PairedDevice } from '../services/device/types';
import { useStore } from '../store';

export function useDevices() {
  const devices = useStore((s) => s.devices);
  const addDeviceAction = useStore((s) => s.addDevice);
  const removeDeviceAction = useStore((s) => s.removeDevice);

  const addDevice = useCallback(
    (device: PairedDevice) => addDeviceAction(device),
    [addDeviceAction]
  );

  const removeDevice = useCallback(
    (id: string) => removeDeviceAction(id),
    [removeDeviceAction]
  );

  const getDevice = useCallback(
    (id: string): PairedDevice | undefined =>
      devices.find((d) => d.id === id),
    [devices]
  );

  return { devices, addDevice, removeDevice, getDevice };
}
