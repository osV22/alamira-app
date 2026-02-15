import type {
  WifiAdapterInterface,
  DeviceInfo,
  WiFiNetwork,
  ProvisionResponse,
} from './types';
import type { AlamiraQRPayload } from '../qr/types';
import { wifiLog } from '../logger/logger';

const DEFAULT_AP_HOST = '192.168.4.1';

export class WifiProvisioningService {
  constructor(private adapter: WifiAdapterInterface) {}

  async connectToDevice(qrData: AlamiraQRPayload): Promise<DeviceInfo> {
    const host = qrData.ip ?? DEFAULT_AP_HOST;

    wifiLog.info(
      `Connecting to device AP ${qrData.ap_ssid} at ${host}:${qrData.api_port}`,
    );

    const deviceInfo = await this.adapter.getDeviceInfo(
      host,
      qrData.api_port,
    );

    wifiLog.info(
      `Connected to device ${deviceInfo.device_id} (${deviceInfo.model} v${deviceInfo.firmware_version})`,
    );

    return deviceInfo;
  }

  async scanNetworks(host: string, port: number): Promise<WiFiNetwork[]> {
    wifiLog.info(`Scanning for WiFi networks via ${host}:${port}`);

    const networks = await this.adapter.scanNetworks(host, port);

    wifiLog.info(`Found ${networks.length} networks`);

    return networks;
  }

  async provision(
    host: string,
    port: number,
    ssid: string,
    password: string,
  ): Promise<ProvisionResponse> {
    wifiLog.info(`Provisioning device at ${host}:${port} for network "${ssid}"`);

    const response = await this.adapter.provision(host, port, {
      ssid,
      password,
    });

    if (response.success) {
      wifiLog.info(`Provisioning succeeded, device IP: ${response.ip}`);
    } else {
      wifiLog.warn(`Provisioning failed for network "${ssid}"`);
    }

    return response;
  }

  async verifyConnection(host: string, port: number): Promise<DeviceInfo> {
    wifiLog.info(`Verifying device reachable at ${host}:${port}`);

    const deviceInfo = await this.adapter.getDeviceInfo(host, port);

    wifiLog.info(
      `Device ${deviceInfo.device_id} verified on network at ${host}`,
    );

    return deviceInfo;
  }
}
