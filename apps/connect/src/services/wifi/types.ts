export interface WiFiNetwork {
  ssid: string;
  rssi: number;
  security: 'Open' | 'WEP' | 'WPA' | 'WPA2' | 'WPA3';
}

export interface DeviceInfo {
  device_id: string;
  model: string;
  firmware_version: string;
  serial: string;
}

export interface ProvisionRequest {
  ssid: string;
  password: string;
}

export interface ProvisionResponse {
  success: boolean;
  ip: string;
}

export interface WifiScanResponse {
  networks: WiFiNetwork[];
}

export interface DeviceStatusResponse {
  uptime: number;
  wifi_rssi: number;
  ip: string;
  ssid: string;
}

export interface WifiAdapterInterface {
  getDeviceInfo(host: string, port: number): Promise<DeviceInfo>;
  scanNetworks(host: string, port: number): Promise<WiFiNetwork[]>;
  provision(host: string, port: number, request: ProvisionRequest): Promise<ProvisionResponse>;
  getStatus(host: string, port: number): Promise<DeviceStatusResponse>;
}
