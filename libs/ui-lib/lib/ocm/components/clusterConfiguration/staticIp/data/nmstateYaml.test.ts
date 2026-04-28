import { describe, it, expect } from 'vitest';
import { getNmstateProtocolConfig } from './nmstateYaml';
import { ProtocolVersion } from './dataTypes';

describe('getNmstateProtocolConfig', () => {
  it('should include autoconf: false for IPv6 static configuration', () => {
    const result = getNmstateProtocolConfig('1001:db9::11', 120, ProtocolVersion.ipv6);

    expect(result).toEqual({
      address: [
        {
          ip: '1001:db9::11',
          'prefix-length': 120,
        },
      ],
      enabled: true,
      dhcp: false,
      autoconf: false,
    });
  });

  it('should not include autoconf field for IPv4 configuration', () => {
    const result = getNmstateProtocolConfig('192.168.127.30', 24, ProtocolVersion.ipv4);

    expect(result).toEqual({
      address: [
        {
          ip: '192.168.127.30',
          'prefix-length': 24,
        },
      ],
      enabled: true,
      dhcp: false,
    });
    expect(result).not.toHaveProperty('autoconf');
  });
});
