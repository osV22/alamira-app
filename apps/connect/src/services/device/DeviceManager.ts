import { loadDevices, saveDevices } from './registry';
import { deviceLog } from '../logger/logger';
import type { PairedDevice } from './types';

export class DeviceManager {
  async getDevices(): Promise<PairedDevice[]> {
    deviceLog.info('Loading all paired devices');
    return loadDevices();
  }

  async addDevice(device: PairedDevice): Promise<void> {
    deviceLog.info(`Adding device: ${device.name} (${device.id})`);
    const devices = await loadDevices();
    devices.push(device);
    await saveDevices(devices);
  }

  async removeDevice(id: string): Promise<void> {
    deviceLog.info(`Removing device: ${id}`);
    const devices = await loadDevices();
    const filtered = devices.filter((d) => d.id !== id);
    await saveDevices(filtered);
  }

  async getDevice(id: string): Promise<PairedDevice | undefined> {
    deviceLog.info(`Looking up device: ${id}`);
    const devices = await loadDevices();
    return devices.find((d) => d.id === id);
  }
}
