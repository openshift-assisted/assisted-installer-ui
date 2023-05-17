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
  ],
});

const hostValidationsInfo = (hostName) =>
  upgradeValidationsInfo(prevHostValidationsInfo, readyHostValidationsInfoPartial(hostName));

export { clusterValidationsInfo, hostValidationsInfo };
