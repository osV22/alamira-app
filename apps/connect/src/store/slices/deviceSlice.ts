import { StateCreator } from 'zustand';

import type { PairedDevice } from '../../services/device/types';

export interface DeviceSlice {
  devices: PairedDevice[];
  addDevice: (device: PairedDevice) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, updates: Partial<PairedDevice>) => void;
}

export const createDeviceSlice: StateCreator<DeviceSlice> = (set) => ({
  devices: [],

  addDevice: (device) =>
    set((state) => ({ devices: [...state.devices, device] })),

  removeDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    })),

  updateDevice: (id, updates) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
});
