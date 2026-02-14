import { wifiLog } from '../logger/logger';
import type {
  DeviceInfo,
  DeviceStatusResponse,
  ProvisionRequest,
  ProvisionResponse,
  WiFiNetwork,
  WifiAdapterInterface,
  WifiScanResponse,
} from './types';

const REQUEST_TIMEOUT_MS = 10_000;

function buildUrl(host: string, port: number, path: string): string {
  return `http://${host}:${port}${path}`;
}

async function request<T>(method: 'GET' | 'POST', url: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const options: RequestInit = {
      method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text().catch(() => 'No response body');
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${method} ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class WifiAdapter implements WifiAdapterInterface {
  async getDeviceInfo(host: string, port: number): Promise<DeviceInfo> {
    const url = buildUrl(host, port, '/api/info');
    wifiLog.info(`GET ${url}`);

    try {
      const info = await request<DeviceInfo>('GET', url);
      wifiLog.info(`Device info received: ${info.model} (${info.device_id})`);
      return info;
    } catch (error) {
      wifiLog.error(`Failed to get device info from ${url}: ${error}`);
      throw new Error(`Failed to get device info: ${error}`);
    }
  }

  async scanNetworks(host: string, port: number): Promise<WiFiNetwork[]> {
    const url = buildUrl(host, port, '/api/wifi/scan');
    wifiLog.info(`GET ${url}`);

    try {
      const data = await request<WifiScanResponse>('GET', url);
      wifiLog.info(`Scan complete: found ${data.networks.length} networks`);
      return data.networks;
    } catch (error) {
      wifiLog.error(`Failed to scan networks from ${url}: ${error}`);
      throw new Error(`Failed to scan WiFi networks: ${error}`);
    }
  }

  async provision(
    host: string,
    port: number,
    req: ProvisionRequest,
  ): Promise<ProvisionResponse> {
    const url = buildUrl(host, port, '/api/provision');
    wifiLog.info(`POST ${url} (ssid: ${req.ssid})`);

    try {
      const result = await request<ProvisionResponse>('POST', url, req);
      if (result.success) {
        wifiLog.info(`Provisioned successfully — device IP: ${result.ip}`);
      } else {
        wifiLog.warn(`Provision returned success=false for ssid: ${req.ssid}`);
      }
      return result;
    } catch (error) {
      wifiLog.error(`Failed to provision ${req.ssid} via ${url}: ${error}`);
      throw new Error(`Failed to provision WiFi: ${error}`);
    }
  }

  async getStatus(host: string, port: number): Promise<DeviceStatusResponse> {
    const url = buildUrl(host, port, '/api/status');
    wifiLog.info(`GET ${url}`);

    try {
      const status = await request<DeviceStatusResponse>('GET', url);
      wifiLog.info(`Device status: ssid=${status.ssid}, ip=${status.ip}, rssi=${status.wifi_rssi}`);
      return status;
    } catch (error) {
      wifiLog.error(`Failed to get device status from ${url}: ${error}`);
      throw new Error(`Failed to get device status: ${error}`);
    }
  }
}
