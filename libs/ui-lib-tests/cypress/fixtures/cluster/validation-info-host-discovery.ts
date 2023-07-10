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
    {
      id: 'media-connected',
      status: 'success',
      message: 'Media device is connected',
    },
    {
      id: 'machine-cidr-defined',
      status: 'failure',
      message:
        'Machine Network CIDR is undefined; the Machine Network CIDR can be defined by setting either the API or Ingress virtual IPs',
    },
    {
      id: 'belongs-to-machine-cidr',
      status: 'pending',
      message: 'Missing inventory or machine network CIDR',
    },
    {
      id: 'belongs-to-majority-group',
      status: 'pending',
      message: 'Not enough information to calculate host majority groups',
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
    {
      id: 'all-hosts-are-ready-to-install',
      status: 'failure',
      message: 'The cluster has hosts that are not ready to install.',
    },
  ],
  network: [
    {
      id: 'api-vips-defined',
      status: 'failure',
      message: 'API virtual IPs are undefined and must be provided.',
    },
    {
      id: 'cluster-cidr-defined',
      status: 'success',
      message: 'The Cluster Network CIDR is defined.',
    },
    {
      id: 'api-vips-valid',
      status: 'pending',
      message: 'API virtual IPs are undefined.',
    },
    {
      id: 'ingress-vips-defined',
      status: 'failure',
      message: 'Ingress virtual IPs are undefined and must be provided.',
    },
    {
      id: 'ingress-vips-valid',
      status: 'pending',
      message: 'Ingress virtual IPs are undefined.',
    },
    {
      id: 'machine-cidr-defined',
      status: 'failure',
      message:
        'The Machine Network CIDR is undefined; the Machine Network CIDR can be defined by setting either the API or Ingress virtual IPs.',
    },
    {
      id: 'machine-cidr-equals-to-calculated-cidr',
      status: 'pending',
      message: 'The Machine Network CIDR, API virtual IPs, or Ingress virtual IPs are undefined.',
    },
    {
      id: 'networks-same-address-families',
      status: 'pending',
      message:
        'At least one of the CIDRs (Machine Network, Cluster Network, Service Network) is undefined.',
    },
    {
      id: 'no-cidrs-overlapping',
      status: 'pending',
      message:
        'At least one of the CIDRs (Machine Network, Cluster Network, Service Network) is undefined.',
    },
  ],
};

const clusterValidationsInfo = upgradeValidationsInfo(
  prevClusterValidationsInfo,
  clusterValidationInfoPartial,
);

export { clusterValidationsInfo, hostValidationsInfo };
