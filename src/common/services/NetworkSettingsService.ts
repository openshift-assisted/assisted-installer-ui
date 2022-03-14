import { NetworkConfigurationValues } from '../types/clusters';

type PersistDhcpConfig = Pick<
  NetworkConfigurationValues,
  'ingressVip' | 'apiVip' | 'vipDhcpAllocation'
>;

const STORAGE_KEY = 'network-dhcp-settings';

const NetworkSettingsService = {
  getPersistedDhcpConfig(): PersistDhcpConfig | null {
    const config = localStorage.getItem(STORAGE_KEY);
    if (config) {
      try {
        return JSON.parse(config) as PersistDhcpConfig;
      } catch {
        return null;
      }
    }
    return null;
  },

  persistDhcpConfig(dhcpConfig: PersistDhcpConfig) {
    return localStorage.setItem(STORAGE_KEY, JSON.stringify(dhcpConfig));
  },
  clearDhcpConfig() {
    return localStorage.removeItem(STORAGE_KEY);
  },
};

export default NetworkSettingsService;
