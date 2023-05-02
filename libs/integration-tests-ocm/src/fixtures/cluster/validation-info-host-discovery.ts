/* eslint-disable @typescript-eslint/naming-convention */

import { clusterValidationsInfo as prevClusterValidationsInfo } from './validation-info-initial-cluster';
import { upgradeValidationsInfo } from './validations-info';

const operatorValidations = [
  {
    id: 'cnv-requirements-satisfied',
    status: 'success',
    message: 'cnv is disabled',
  },
  {
    id: 'lso-requirements-satisfied',
    status: 'success',
    message: 'lso is disabled',
  },
  {
    id: 'odf-requirements-satisfied',
    status: 'success',
    message: 'odf is disabled',
  },
  {
    id: 'lvm-requirements-satisfied',
    status: 'success',
    message: 'lvm is disabled',
  },
];

const hostValidationsInfo = {
  operators: operatorValidations,
  hardware: [
    {
      id: 'hostname-valid',
      status: 'failure',
      message: 'Hostname localhost is forbidden',
    },
  ],
  network: [
    {
      id: 'connected',
      status: 'success',
      message: 'Host is connected',
    },
  ],
};

const clusterValidationInfoPartial = {
  operators: operatorValidations,
  'hosts-data': [
    {
      id: 'sufficient-masters-count',
      status: 'success',
      message: 'The cluster has a sufficient number of master candidates.',
    },
  ],
};

const clusterValidationsInfo = upgradeValidationsInfo(prevClusterValidationsInfo, clusterValidationInfoPartial);

export { clusterValidationsInfo, hostValidationsInfo };
