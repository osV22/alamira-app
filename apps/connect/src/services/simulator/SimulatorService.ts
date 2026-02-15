import { simLog } from '../logger/logger';
import type { SimulatedDevice } from './types';

const SIMULATED_DEVICE: SimulatedDevice = {
  qrPayload: {
    ap_ssid: 'ALAMIRA-SIM',
    ap_pass: 'simulator',
    device_id: 'ALM-DEMO-001',
    api_port: 8080,
    ip: '192.168.1.100',
  },
  deviceInfo: {
    device_id: 'ALM-DEMO-001',
    model: 'Alamira MFD-7',
    firmware_version: '1.2.0',
    serial: 'ALM-2026-DEMO-001',
  },
  firmwareUpdate: {
    currentVersion: '1.2.0',
    availableVersion: '1.3.0',
    updateAvailable: true,
    releaseNotes: 'Improved NMEA 2000 parsing, night mode, bug fixes.',
  },
};

export class SimulatorService {
  getSimulatedDevice(): SimulatedDevice {
    simLog.info('Generating simulated device data');
    return { ...SIMULATED_DEVICE };
  }

  getSimulatedQRPayload() {
    return { ...SIMULATED_DEVICE.qrPayload };
  }

  getSimulatedDeviceInfo() {
    return { ...SIMULATED_DEVICE.deviceInfo };
  }

  getSimulatedFirmwareUpdate() {
    return { ...SIMULATED_DEVICE.firmwareUpdate };
  }
}
