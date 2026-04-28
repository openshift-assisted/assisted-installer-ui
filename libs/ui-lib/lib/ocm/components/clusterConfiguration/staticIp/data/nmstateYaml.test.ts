import { describe, it, expect } from 'vitest';
import { getNmstateProtocolConfig, getInterface } from './nmstateYaml';
import { ProtocolVersion, FormViewNetworkWideValues } from './dataTypes';
import { dump } from 'js-yaml';

describe('nmstateYaml', () => {
  describe('getNmstateProtocolConfig', () => {
    it('should create IPv4 config without autoconf field', () => {
      const config = getNmstateProtocolConfig('192.168.1.10', 24, ProtocolVersion.ipv4);

      expect(config).toEqual({
        address: [
          {
            ip: '192.168.1.10',
            'prefix-length': 24,
          },
        ],
        enabled: true,
        dhcp: false,
      });
      expect(config).not.toHaveProperty('autoconf');
    });

    it('should create IPv6 config with autoconf set to false', () => {
      const config = getNmstateProtocolConfig('2001:db8::1', 64, ProtocolVersion.ipv6);

      expect(config).toEqual({
        address: [
          {
            ip: '2001:db8::1',
            'prefix-length': 64,
          },
        ],
        enabled: true,
        dhcp: false,
        autoconf: false,
      });
    });
  });

  describe('getInterface', () => {
    it('should generate interface with autoconf: false for IPv6 in dual-stack config', () => {
      const networkWide: FormViewNetworkWideValues = {
        protocolType: 'dualStack',
        useVlan: false,
        vlanId: '',
        dns: '8.8.8.8',
        ipConfigs: {
          ipv4: {
            machineNetwork: { ip: '192.168.127.0', prefixLength: 24 },
            gateway: '192.168.127.1',
          },
          ipv6: {
            machineNetwork: { ip: '1001:db9::1e', prefixLength: 120 },
            gateway: '1001:db9::14',
          },
        },
      };

      const protocolConfigs = {
        ipv4: getNmstateProtocolConfig('192.168.127.30', 24, ProtocolVersion.ipv4),
        ipv6: getNmstateProtocolConfig('1001:db9::11', 120, ProtocolVersion.ipv6),
      };

      const iface = getInterface('eth0', protocolConfigs, networkWide);
      const yaml = dump(iface);

      expect(yaml).toContain('autoconf: false');
      expect(iface.ipv6?.autoconf).toBe(false);
      expect(iface.ipv4).not.toHaveProperty('autoconf');
    });
  });
});
