import { test, describe, expect } from 'vitest';
import { isDualStack } from './utils';
import {
  MachineNetwork,
  ClusterNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/assisted-installer-service';

describe('isDualStack', () => {
  const createMachineNetwork = (cidr: string): MachineNetwork => ({ cidr, clusterId: 'test' });
  const createClusterNetwork = (cidr: string, hostPrefix: number): ClusterNetwork => ({
    cidr,
    hostPrefix,
    clusterId: 'test',
  });
  const createServiceNetwork = (cidr: string): ServiceNetwork => ({ cidr, clusterId: 'test' });

  describe('OCP < 4.12 (legacy behavior)', () => {
    test('returns true for valid dual stack with IPv4 primary', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('192.168.1.0/24'),
          createMachineNetwork('2001:db8::/64'),
        ],
        clusterNetworks: [
          createClusterNetwork('10.128.0.0/14', 23),
          createClusterNetwork('fd01::/48', 64),
        ],
        serviceNetworks: [
          createServiceNetwork('172.30.0.0/16'),
          createServiceNetwork('fd02::/112'),
        ],
        openshiftVersion: '4.11',
      });

      expect(result).toBe(true);
    });

    test('returns false for IPv6 primary in OCP < 4.12', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('2001:db8::/64'),
          createMachineNetwork('192.168.1.0/24'),
        ],
        clusterNetworks: [
          createClusterNetwork('fd01::/48', 64),
          createClusterNetwork('10.128.0.0/14', 23),
        ],
        serviceNetworks: [
          createServiceNetwork('fd02::/112'),
          createServiceNetwork('172.30.0.0/16'),
        ],
        openshiftVersion: '4.11',
      });

      expect(result).toBe(false);
    });

    test('returns false for single stack', () => {
      const result = isDualStack({
        machineNetworks: [createMachineNetwork('192.168.1.0/24')],
        clusterNetworks: [createClusterNetwork('10.128.0.0/14', 23)],
        serviceNetworks: [createServiceNetwork('172.30.0.0/16')],
        openshiftVersion: '4.11',
      });

      expect(result).toBe(false);
    });

    test('returns false for empty networks', () => {
      const result = isDualStack({
        machineNetworks: [],
        clusterNetworks: [],
        serviceNetworks: [],
        openshiftVersion: '4.11',
      });

      expect(result).toBe(false);
    });
  });

  describe('OCP >= 4.12 (new behavior)', () => {
    test('returns true for IPv4 primary and IPv6 secondary', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('192.168.1.0/24'),
          createMachineNetwork('2001:db8::/64'),
        ],
        clusterNetworks: [
          createClusterNetwork('10.128.0.0/14', 23),
          createClusterNetwork('fd01::/48', 64),
        ],
        serviceNetworks: [
          createServiceNetwork('172.30.0.0/16'),
          createServiceNetwork('fd02::/112'),
        ],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(true);
    });

    test('returns true for IPv6 primary and IPv4 secondary', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('2001:db8::/64'),
          createMachineNetwork('192.168.1.0/24'),
        ],
        clusterNetworks: [
          createClusterNetwork('fd01::/48', 64),
          createClusterNetwork('10.128.0.0/14', 23),
        ],
        serviceNetworks: [
          createServiceNetwork('fd02::/112'),
          createServiceNetwork('172.30.0.0/16'),
        ],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(true);
    });

    test('returns false for IPv6 primary and IPv6 secondary (not dual-stack)', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('2001:db8::/64'),
          createMachineNetwork('2001:db9::/64'),
        ],
        clusterNetworks: [
          createClusterNetwork('fd01::/48', 64),
          createClusterNetwork('fd02::/48', 64),
        ],
        serviceNetworks: [createServiceNetwork('fd03::/112'), createServiceNetwork('fd04::/112')],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });

    test('returns false for IPv4 primary and IPv4 secondary (not dual-stack)', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('192.168.1.0/24'),
          createMachineNetwork('10.0.0.0/24'),
        ],
        clusterNetworks: [
          createClusterNetwork('10.128.0.0/14', 23),
          createClusterNetwork('172.16.0.0/14', 23),
        ],
        serviceNetworks: [
          createServiceNetwork('172.30.0.0/16'),
          createServiceNetwork('172.31.0.0/16'),
        ],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });

    test('returns false for single stack', () => {
      const result = isDualStack({
        machineNetworks: [createMachineNetwork('192.168.1.0/24')],
        clusterNetworks: [createClusterNetwork('10.128.0.0/14', 23)],
        serviceNetworks: [createServiceNetwork('172.30.0.0/16')],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });

    test('returns false if any network type is not dual stack', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('192.168.1.0/24'),
          createMachineNetwork('2001:db8::/64'),
        ],
        clusterNetworks: [createClusterNetwork('10.128.0.0/14', 23)], // Single stack
        serviceNetworks: [
          createServiceNetwork('172.30.0.0/16'),
          createServiceNetwork('fd02::/112'),
        ],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });
  });

  describe('no version specified (defaults to legacy behavior)', () => {
    test('returns true for IPv4 primary and IPv6 secondary', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('192.168.1.0/24'),
          createMachineNetwork('2001:db8::/64'),
        ],
        clusterNetworks: [
          createClusterNetwork('10.128.0.0/14', 23),
          createClusterNetwork('fd01::/48', 64),
        ],
        serviceNetworks: [
          createServiceNetwork('172.30.0.0/16'),
          createServiceNetwork('fd02::/112'),
        ],
      });

      expect(result).toBe(true);
    });

    test('returns false for IPv6 primary when no version specified', () => {
      const result = isDualStack({
        machineNetworks: [
          createMachineNetwork('2001:db8::/64'),
          createMachineNetwork('192.168.1.0/24'),
        ],
        clusterNetworks: [
          createClusterNetwork('fd01::/48', 64),
          createClusterNetwork('10.128.0.0/14', 23),
        ],
        serviceNetworks: [
          createServiceNetwork('fd02::/112'),
          createServiceNetwork('172.30.0.0/16'),
        ],
      });

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('handles undefined networks', () => {
      const result = isDualStack({
        machineNetworks: undefined,
        clusterNetworks: undefined,
        serviceNetworks: undefined,
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });

    test('handles networks with empty CIDRs', () => {
      const result = isDualStack({
        machineNetworks: [
          { cidr: '', clusterId: 'test' },
          { cidr: '', clusterId: 'test' },
        ],
        clusterNetworks: [
          { cidr: '', hostPrefix: 23, clusterId: 'test' },
          { cidr: '', hostPrefix: 64, clusterId: 'test' },
        ],
        serviceNetworks: [
          { cidr: '', clusterId: 'test' },
          { cidr: '', clusterId: 'test' },
        ],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });

    test('handles invalid CIDRs', () => {
      const result = isDualStack({
        machineNetworks: [createMachineNetwork('invalid'), createMachineNetwork('also-invalid')],
        clusterNetworks: [
          createClusterNetwork('invalid', 23),
          createClusterNetwork('also-invalid', 64),
        ],
        serviceNetworks: [createServiceNetwork('invalid'), createServiceNetwork('also-invalid')],
        openshiftVersion: '4.12',
      });

      expect(result).toBe(false);
    });
  });
});
