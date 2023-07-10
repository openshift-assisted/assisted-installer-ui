/* eslint-disable @typescript-eslint/naming-convention */

import { clusterValidationsInfo as prevClusterValidationsInfo } from './validation-info-host-renamed';
import { upgradeValidationsInfo } from './validations-info';

const hostValidationsInfo = {
  hardware: [
    {
      id: 'has-inventory',
      status: 'success',
      message: 'Valid inventory exists for the host',
    },
    {
      id: 'has-min-cpu-cores',
      status: 'success',
      message: 'Sufficient CPU cores',
    },
    {
      id: 'has-min-memory',
      status: 'success',
      message: 'Sufficient minimum RAM',
    },
    {
      id: 'has-min-valid-disks',
      status: 'success',
      message: 'Sufficient disk capacity',
    },
    {
      id: 'has-cpu-cores-for-role',
      status: 'success',
      message: 'Sufficient CPU cores for role master',
    },
    {
      id: 'has-memory-for-role',
      status: 'success',
      message: 'Sufficient RAM for role master',
    },
  ],
  network: [
    {
      id: 'machine-cidr-defined',
      status: 'success',
      message: 'No Machine Network CIDR needed: User Managed Networking',
    },
    {
      id: 'belongs-to-machine-cidr',
      status: 'success',
      message: 'Host belongs to all machine network CIDRs',
    },
    {
      id: 'belongs-to-majority-group',
      status: 'success',
      message: 'Host has connectivity to the majority of hosts in the cluster',
    },
    {
      id: 'valid-platform-network-settings',
      status: 'success',
      message: 'Platform KVM is allowed',
    },
    {
      id: 'ntp-synced',
      status: 'success',
      message: 'Host could synchronize with the NTP server.',
    },
  ],
};

const clusterValidationInfoPartial = {
  network: [
    {
      id: 'ntp-synced',
      status: 'success',
      message: 'Host could synchronize with the NTP server.',
    },
    {
      id: 'container-images-available',
      status: 'success',
      message:
        'All required container images were either pulled successfully or no attempt was made to pull them',
    },
    {
      id: 'api-vips-defined',
      status: 'success',
      message: 'API virtual IPs are defined.',
    },
    {
      id: 'api-vips-valid',
      status: 'success',
      message: 'api vips 192.168.122.10 belongs to the Machine CIDR and is not in use.',
    },
    {
      id: 'cluster-cidr-defined',
      status: 'success',
      message: 'The Cluster Network CIDR is defined.',
    },
    {
      id: 'ingress-vips-defined',
      status: 'success',
      message: 'Ingress virtual IPs are defined.',
    },
    {
      id: 'ingress-vips-valid',
      status: 'success',
      message: 'ingress vips 192.168.122.110 belongs to the Machine CIDR and is not in use.',
    },
    {
      id: 'machine-cidr-defined',
      status: 'success',
      message: 'The Machine Network CIDR is defined.',
    },
    {
      id: 'no-cidrs-overlapping',
      status: 'success',
      message: 'No CIDRS are overlapping.',
    },
  ],
  'hosts-data': [
    {
      id: 'sufficient-masters-count',
      status: 'success',
      message: 'The cluster has a sufficient number of master candidates.',
    },
    {
      id: 'all-hosts-are-ready-to-install',
      status: 'success',
      message: 'All hosts in the cluster are ready to install.',
    },
  ],
};

const clusterValidationsInfo = upgradeValidationsInfo(
  prevClusterValidationsInfo,
  clusterValidationInfoPartial,
);

export { clusterValidationsInfo, hostValidationsInfo };
