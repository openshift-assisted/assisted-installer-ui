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
      status: 'pending',
      message: 'Missing inventory or machine network CIDR',
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
  ],
};

const clusterValidationsInfo = upgradeValidationsInfo(
  prevClusterValidationsInfo,
  clusterValidationInfoPartial,
);

export { clusterValidationsInfo, hostValidationsInfo };
