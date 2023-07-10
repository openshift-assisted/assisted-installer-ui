/* eslint-disable @typescript-eslint/naming-convention */

import {
  hostValidationsInfo as prevHostValidationsInfo,
  clusterValidationsInfo,
} from './validation-info-host-discovery';
import { upgradeValidationsInfo } from './validations-info';

const readyHostValidationsInfoPartial = (hostName) => ({
  hardware: [
    {
      id: 'hostname-unique',
      status: 'success',
      message: `Hostname ${hostName} is unique in cluster`,
    },
    {
      id: 'hostname-valid',
      status: 'success',
      message: `Hostname ${hostName} is allowed`,
    },
    {
      id: 'no-skip-installation-disk',
      status: 'success',
      message: 'No request to skip formatting of the installation disk',
    },
    {
      id: 'no-skip-missing-disk',
      status: 'success',
      message: 'All disks that have skipped formatting are present in the host inventory',
    },
  ],
});

const hostValidationsInfo = (hostName) =>
  upgradeValidationsInfo(prevHostValidationsInfo, readyHostValidationsInfoPartial(hostName));

export { clusterValidationsInfo, hostValidationsInfo };
