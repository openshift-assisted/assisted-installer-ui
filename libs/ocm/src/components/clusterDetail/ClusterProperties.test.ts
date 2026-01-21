import { test, describe, expect } from 'vitest';
import { getStackTypeLabel } from './ClusterProperties';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

const createCluster = (overrides: Partial<Cluster> = {}): Cluster =>
  ({
    id: 'test-cluster',
    name: 'test-cluster',
    kind: 'Cluster',
    href: '/api/assisted-install/v2/clusters/test-cluster',
    openshiftVersion: '4.11',
    status: 'ready',
    statusInfo: 'Cluster is ready',
    machineNetworks: [],
    clusterNetworks: [],
    serviceNetworks: [],
    ...overrides,
  } as Cluster);

const createMachineNetwork = (cidr: string) => ({ cidr, clusterId: 'test' });
const createClusterNetwork = (cidr: string, hostPrefix: number) => ({
  cidr,
  hostPrefix,
  clusterId: 'test',
});
const createServiceNetwork = (cidr: string) => ({ cidr, clusterId: 'test' });

describe('getStackTypeLabel', () => {
  describe('OCP < 4.12 (legacy behavior)', () => {
    test('returns "Dual-stack" for valid dual stack with IPv4 primary', () => {
      const cluster = createCluster({
        openshiftVersion: '4.11',
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

      expect(getStackTypeLabel(cluster)).toBe('Dual-stack');
    });

    test('returns "IPv4" for single stack', () => {
      const cluster = createCluster({
        openshiftVersion: '4.11',
        machineNetworks: [createMachineNetwork('192.168.1.0/24')],
        clusterNetworks: [createClusterNetwork('10.128.0.0/14', 23)],
        serviceNetworks: [createServiceNetwork('172.30.0.0/16')],
      });

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });

    test('returns "IPv4" for IPv6 primary (invalid for OCP < 4.12)', () => {
      const cluster = createCluster({
        openshiftVersion: '4.11',
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

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });
  });

  describe('OCP >= 4.12 (new behavior)', () => {
    test('returns "Dual-stack" for IPv4 primary and IPv6 secondary', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
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

      expect(getStackTypeLabel(cluster)).toBe('Dual-stack');
    });

    test('returns "Dual-stack" for IPv6 primary and IPv4 secondary', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
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

      expect(getStackTypeLabel(cluster)).toBe('Dual-stack');
    });

    test('returns "IPv4" for IPv6 primary and IPv6 secondary (not dual-stack)', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
        machineNetworks: [
          createMachineNetwork('2001:db8::/64'),
          createMachineNetwork('2001:db9::/64'),
        ],
        clusterNetworks: [
          createClusterNetwork('fd01::/48', 64),
          createClusterNetwork('fd02::/48', 64),
        ],
        serviceNetworks: [createServiceNetwork('fd03::/112'), createServiceNetwork('fd04::/112')],
      });

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });

    test('returns "IPv4" for IPv4 primary and IPv4 secondary (not dual-stack)', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
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
      });

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });

    test('returns "IPv4" for single stack', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
        machineNetworks: [createMachineNetwork('192.168.1.0/24')],
        clusterNetworks: [createClusterNetwork('10.128.0.0/14', 23)],
        serviceNetworks: [createServiceNetwork('172.30.0.0/16')],
      });

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });
  });

  describe('edge cases', () => {
    test('handles undefined openshiftVersion', () => {
      const cluster = createCluster({
        openshiftVersion: undefined,
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

      expect(getStackTypeLabel(cluster)).toBe('Dual-stack');
    });

    test('handles empty networks', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
        machineNetworks: [],
        clusterNetworks: [],
        serviceNetworks: [],
      });

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });

    test('handles undefined networks', () => {
      const cluster = createCluster({
        openshiftVersion: '4.12',
        machineNetworks: undefined,
        clusterNetworks: undefined,
        serviceNetworks: undefined,
      });

      expect(getStackTypeLabel(cluster)).toBe('IPv4');
    });
  });
});
