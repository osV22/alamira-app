export type OnboardingStep =
  | 'scan'
  | 'connecting'
  | 'product-info'
  | 'firmware-update'
  | 'wifi-setup'
  | 'verifying'
  | 'name'
  | 'configure'
  | 'complete';

export interface FirmwareUpdateInfo {
  currentVersion: string;
  availableVersion: string;
  updateAvailable: boolean;
  releaseNotes: string;
}

export interface DataConnection {
  id: string;
  type: 'signalk' | 'nmea2000' | 'nmea0183';
  host: string;
  port: number;
  name?: string;
  linked_at: number;
}

export interface PairedDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  model: string;
  firmware_version: string;
  serial: string;
  paired_at: number;
  connections: DataConnection[];
}

export interface DeviceStatus {
  online: boolean;
  uptime: number;
  wifi_rssi: number;
  ip: string;
  ssid: string;
}
