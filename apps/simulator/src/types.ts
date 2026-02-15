/** Matches Connect's DeviceInfo in apps/connect/src/services/wifi/types.ts */
export interface DeviceInfo {
  device_id: string;
  model: string;
  firmware_version: string;
  serial: string;
}

/** Matches Connect's WiFiNetwork */
export interface WiFiNetwork {
  ssid: string;
  rssi: number;
  security: 'Open' | 'WEP' | 'WPA' | 'WPA2' | 'WPA3';
}

/** Matches Connect's WifiScanResponse */
export interface WifiScanResponse {
  networks: WiFiNetwork[];
}

/** Matches Connect's ProvisionRequest */
export interface ProvisionRequest {
  ssid: string;
  password: string;
}

/** Matches Connect's ProvisionResponse */
export interface ProvisionResponse {
  success: boolean;
  ip: string;
}

/** Matches Connect's DeviceStatusResponse */
export interface DeviceStatusResponse {
  uptime: number;
  wifi_rssi: number;
  ip: string;
  ssid: string;
}

/** Simulator-only: message push from Connect */
export interface MessageRequest {
  message: string;
}

export interface MessageResponse {
  received: boolean;
}

/** QR payload — extends Connect's AlamiraQRPayload with `ip` field */
export interface SimulatorQRPayload {
  ap_ssid: string;
  ap_pass: string;
  device_id: string;
  api_port: number;
  ip: string;
}

/** Console log entry for display */
export interface LogEntry {
  timestamp: number;
  method: string;
  path: string;
  sourceIp?: string;
  body?: unknown;
  response?: unknown;
}
