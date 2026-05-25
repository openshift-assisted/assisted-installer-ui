import { test, describe, expect } from 'vitest';
import cloneDeep from 'lodash-es/cloneDeep';

import { ValidationsInfo } from '../../../common';
import {
  // ValidationGroup as HostValidationGroup,
  ValidationsInfo as HostValidationsInfo,
  Validation as HostValidation,
} from '../../../common/types/hosts';

import {
  canNextClusterDetails,
  canNextHostDiscovery,
  canNextStorage,
  isNetworkingStepAwaitingValidations,
} from './wizardTransition';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';

const clusterBase: Cluster = {
  kind: 'Cluster',
  id: 'test-cluster-uuid',
  href: 'test-cluster-href',
  name: 'test-cluster',
  openshiftVersion: '4.12',
  imageInfo: {},
  status: 'insufficient',
  statusInfo: '{}',
  hosts: [],
};

const validationInfoClusterDetails: ValidationsInfo = {
  configuration: [
    {
      id: 'pull-secret-set',
      message: 'pull-secret-set message',
      status: 'success',
    },
    {
      id: 'dns-domain-defined',
      message: 'dns-domain-defined message',
      status: 'pending',
    },
  ],
};

const validationInfoHostsDisovery: ValidationsInfo = {
  configuration: [
    {
      id: 'dns-domain-defined',
      message: 'unrelated cluster validation',
      status: 'error',
    },
  ],
  'hosts-data': [
    {
      id: 'sufficient-masters-count',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'lso-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'odf-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'lvm-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'cnv-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'nvidia-gpu-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'openshift-ai-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'osc-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'api-vips-defined',
      message: 'a validation unrelated to the canNextHostDiscovery',
      status: 'error',
    },
    {
      id: 'amd-gpu-requirements-satisfied',
      message: 'a validation message',
      status: 'success',
    },
  ],
};

const validationInfoStorage: ValidationsInfo = {
  configuration: [
    {
      id: 'dns-domain-defined',
      message: 'unrelated cluster validation',
      status: 'error',
    },
  ],
  'hosts-data': [
    {
      id: 'sufficient-masters-count',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'api-vips-defined',
      message: 'a validation unrelated to the canNextStorage',
      status: 'error',
    },
  ],
};

const hostsHostDiscovery: Host[] = [
  {
    kind: 'Host',
    id: 'host-0-uuid',
    href: 'host-0-href',
    clusterId: clusterBase.id,
    status: 'discovering',
    statusInfo: 'host status info',
    validationsInfo: '{}',
  },
];
const hostsStorage = hostsHostDiscovery;

const hostValidationInfoHostsDiscovery: HostValidationsInfo = {
  infrastructure: [
    {
      id: 'container-images-available',
      message: 'a dummy host validation unrelated to the canNextHostDiscovery',
      status: 'error',
    },
  ],
  hardware: [
    {
      id: 'hostname-unique',
      message: 'a validation message',
      status: 'success',
    },
    {
      id: 'hostname-valid',
      message: 'a validation message',
      status: 'pending',
    },
  ],
};
const hostValidationInfoStorage = hostValidationInfoHostsDiscovery;

// For simplicity, let's put all required validations in a flat structure
const flatValidationHostsDiscovery: HostValidation[] = [
  {
    id: 'connected',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'media-connected',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'lso-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'odf-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'lvm-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'cnv-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'nvidia-gpu-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'openshift-ai-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'osc-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'mtu-valid',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'amd-gpu-requirements-satisfied',
    message: 'a host validation message',
    status: 'success',
  },
];

const flatValidationHostsStorage: HostValidation[] = [
  {
    id: 'connected',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'media-connected',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'no-skip-installation-disk',
    message: 'a host validation message',
    status: 'success',
  },
  {
    id: 'no-skip-missing-disk',
    message: 'a host validation message',
    status: 'success',
  },
];

// based on clusterDetailsStepValidationsMap
describe('OCM wizard transition of Cluster Details', () => {
  test('is disabled for initial cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    expect(canNextClusterDetails({ cluster })).toBe(false);
  });

  test('is enabled for a Ready cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    cluster.status = 'ready';
    expect(canNextClusterDetails({ cluster })).toBe(true);
  });

  test('is disabled for a pending required validation', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoClusterDetails);
    cluster.status = clusterBase.status;
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextClusterDetails({ cluster })).toBe(false);
  });

  test('is disabled for a failing required validation', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoClusterDetails);
    validationInfo.configuration[1].status = 'error';
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextClusterDetails({ cluster })).toBe(false);
  });

  test('is enabled when all required validations are successful', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoClusterDetails);
    validationInfo.configuration[1].status = 'success';
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextClusterDetails({ cluster })).toBe(true);
  });
});

// based on hostDiscoveryStepValidationsMap
describe('OCM wizard transition of Host Discovery', () => {
  test('is disabled for initial cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    expect(canNextHostDiscovery({ cluster })).toBe(false);
  });

  test('is enabled for a Ready cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    cluster.status = 'ready';
    expect(canNextHostDiscovery({ cluster })).toBe(true);
  });

  test('is enabled for a no-host cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    cluster.status = clusterBase.status;
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextHostDiscovery({ cluster })).toBe(true); // no hosts so far
  });

  test('is disabled when a host is with missing validation', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    const hosts: Host[] = cloneDeep(hostsHostDiscovery);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    expect(canNextHostDiscovery({ cluster })).toBe(false);
  });

  test('is disabled when a host is with missing validation but the host is disabled', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    const hosts: Host[] = cloneDeep(hostsHostDiscovery);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    cluster.hosts[0].status = 'disabled';
    expect(canNextHostDiscovery({ cluster })).toBe(true);
  });

  test('is enabled when all hosts are Known', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    const hosts: Host[] = cloneDeep(hostsHostDiscovery);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    cluster.hosts[0].status = 'known';
    expect(canNextHostDiscovery({ cluster })).toBe(true);
  });

  test('is disabled when a host is with a failing required validation', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    const hosts: Host[] = cloneDeep(hostsHostDiscovery);
    const host0ValidationInfo: HostValidationsInfo = cloneDeep(hostValidationInfoHostsDiscovery);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;

    cluster.hosts[0].status = 'insufficient';
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextHostDiscovery({ cluster })).toBe(false);
  });

  test('is enabled when all hosts are passing required validations but a host is insufficient', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    const hosts: Host[] = cloneDeep(hostsHostDiscovery);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    const host0ValidationInfo: HostValidationsInfo = cloneDeep(hostValidationInfoHostsDiscovery);
    const host0FlatValidationHostsDiscovery: HostValidation[] = cloneDeep(
      flatValidationHostsDiscovery,
    );

    cluster.hosts[0].status = 'insufficient';

    host0ValidationInfo.hardware[1].status = 'success';
    host0ValidationInfo.operators = host0FlatValidationHostsDiscovery;
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextHostDiscovery({ cluster })).toBe(true);
  });
});

// based on storageStepValidationsMap
describe('OCM wizard transition of Storage', () => {
  test('is disabled for initial cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    expect(canNextStorage({ cluster })).toBe(false);
  });

  test('is enabled for a Ready cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    cluster.status = 'ready';
    expect(canNextStorage({ cluster })).toBe(true);
  });

  test('is enabled for a no-host cluster', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    cluster.status = clusterBase.status;
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextStorage({ cluster })).toBe(true); // no hosts so far
  });

  test('is disabled when a host is with missing validation', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    const hosts: Host[] = cloneDeep(hostsStorage);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    expect(canNextStorage({ cluster })).toBe(false);
  });

  test('is disabled when a host is with missing validation but the host is disabled', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    const hosts: Host[] = cloneDeep(hostsStorage);
    cluster.validationsInfo = JSON.stringify(validationInfo);

    cluster.hosts = hosts;
    cluster.hosts[0].status = 'disabled';
    expect(canNextStorage({ cluster })).toBe(true);
  });

  test('is enabled when all hosts are Known', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    const hosts: Host[] = cloneDeep(hostsStorage);
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    cluster.hosts[0].status = 'known';
    expect(canNextStorage({ cluster })).toBe(true);
  });

  test('is disabled when a host is with a failing required validation', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    const hosts: Host[] = cloneDeep(hostsStorage);
    const host0ValidationInfo: HostValidationsInfo = cloneDeep(hostValidationInfoStorage);

    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    cluster.hosts[0].status = 'insufficient';
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextStorage({ cluster })).toBe(false);
  });

  test('is enabled when all hosts are passing required validations but a host is insufficient', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    const hosts: Host[] = cloneDeep(hostsStorage);
    const host0ValidationInfo: HostValidationsInfo = cloneDeep(hostValidationInfoStorage);
    const host0FlatValidation: HostValidation[] = cloneDeep(flatValidationHostsStorage);

    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = hosts;
    cluster.hosts[0].status = 'insufficient';
    host0ValidationInfo.hardware[1].status = 'success';
    host0ValidationInfo.operators = host0FlatValidation;
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextStorage({ cluster })).toBe(true);
  });
});

const validationInfoNetworkingReady: ValidationsInfo = {
  network: [
    {
      id: 'api-vips-defined',
      message: 'API virtual IPs are defined.',
      status: 'success',
    },
    {
      id: 'api-vips-valid',
      message: 'API VIP is valid.',
      status: 'success',
    },
    {
      id: 'cluster-cidr-defined',
      message: 'Cluster Network CIDR is defined.',
      status: 'success',
    },
    {
      id: 'dns-domain-defined',
      message: 'Base domain is defined.',
      status: 'success',
    },
    {
      id: 'ingress-vips-defined',
      message: 'Ingress virtual IPs are defined.',
      status: 'success',
    },
    {
      id: 'ingress-vips-valid',
      message: 'Ingress VIP is valid.',
      status: 'success',
    },
  ],
};

const hostNetworkValidationReady: HostValidationsInfo = {
  network: [
    {
      id: 'belongs-to-machine-cidr',
      message: 'Host belongs to machine CIDR.',
      status: 'success',
    },
    {
      id: 'connected',
      message: 'Host is connected.',
      status: 'success',
    },
    {
      id: 'ntp-synced',
      message: 'NTP is synced.',
      status: 'success',
    },
  ],
};

const hostNetworkingBase: Host = {
  kind: 'Host',
  id: 'host-networking-uuid',
  href: 'host-networking-href',
  clusterId: clusterBase.id,
  status: 'known',
  statusInfo: 'host status info',
  validationsInfo: JSON.stringify(hostNetworkValidationReady),
};

describe('OCM wizard transition of Networking - Next button loader', () => {
  test('returns false when cluster and hosts are ready', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    cluster.status = 'ready';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [cloneDeep(hostNetworkingBase)];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(false);
  });

  test('returns true when host network validation is pending only', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const hostValidations: HostValidationsInfo = {
      network: [
        {
          id: 'belongs-to-machine-cidr',
          message: 'Host belongs to machine CIDR.',
          status: 'pending',
        },
        { id: 'connected', message: 'Host is connected.', status: 'success' },
        { id: 'ntp-synced', message: 'NTP is synced.', status: 'success' },
      ],
    };
    cluster.status = 'pending-for-input';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [
      {
        ...cloneDeep(hostNetworkingBase),
        status: 'pending-for-input',
        validationsInfo: JSON.stringify(hostValidations),
      },
    ];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(true);
  });

  test('returns false when host network validation failed', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const hostValidations: HostValidationsInfo = {
      network: [
        {
          id: 'belongs-to-machine-cidr',
          message: 'Host belongs to machine CIDR.',
          status: 'failure',
        },
        { id: 'connected', message: 'Host is connected.', status: 'success' },
        { id: 'ntp-synced', message: 'NTP is synced.', status: 'success' },
      ],
    };
    cluster.status = 'insufficient';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [
      {
        ...cloneDeep(hostNetworkingBase),
        status: 'insufficient',
        validationsInfo: JSON.stringify(hostValidations),
      },
    ];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(false);
  });

  test('returns false when host is disconnected', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    cluster.status = 'insufficient';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [{ ...cloneDeep(hostNetworkingBase), status: 'disconnected' }];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(false);
  });

  test('returns true when host is discovering', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    cluster.status = 'insufficient';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [{ ...cloneDeep(hostNetworkingBase), status: 'discovering' }];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(true);
  });

  test('returns false when cluster network validation failed', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo: ValidationsInfo = {
      network: [
        { id: 'api-vips-defined', message: 'API virtual IPs are defined.', status: 'success' },
        { id: 'api-vips-valid', message: 'API VIP is valid.', status: 'failure' },
        {
          id: 'cluster-cidr-defined',
          message: 'Cluster Network CIDR is defined.',
          status: 'success',
        },
        { id: 'dns-domain-defined', message: 'Base domain is defined.', status: 'success' },
        {
          id: 'ingress-vips-defined',
          message: 'Ingress virtual IPs are defined.',
          status: 'success',
        },
        { id: 'ingress-vips-valid', message: 'Ingress VIP is valid.', status: 'success' },
      ],
    };
    cluster.status = 'insufficient';
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = [cloneDeep(hostNetworkingBase)];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(false);
  });

  test('returns true when cluster network validation is pending only', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo: ValidationsInfo = {
      network: [
        { id: 'api-vips-defined', message: 'API virtual IPs are defined.', status: 'pending' },
        { id: 'api-vips-valid', message: 'API VIP is valid.', status: 'success' },
        {
          id: 'cluster-cidr-defined',
          message: 'Cluster Network CIDR is defined.',
          status: 'success',
        },
        { id: 'dns-domain-defined', message: 'Base domain is defined.', status: 'success' },
        {
          id: 'ingress-vips-defined',
          message: 'Ingress virtual IPs are defined.',
          status: 'success',
        },
        { id: 'ingress-vips-valid', message: 'Ingress VIP is valid.', status: 'success' },
      ],
    };
    cluster.status = 'pending-for-input';
    cluster.validationsInfo = JSON.stringify(validationInfo);
    cluster.hosts = [cloneDeep(hostNetworkingBase)];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(true);
  });

  test('returns false when only soft validation failed and nothing is pending', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const hostValidations: HostValidationsInfo = {
      network: [
        {
          id: 'belongs-to-machine-cidr',
          message: 'Host belongs to machine CIDR.',
          status: 'success',
        },
        { id: 'connected', message: 'Host is connected.', status: 'success' },
        { id: 'ntp-synced', message: 'NTP is synced.', status: 'failure' },
      ],
    };
    cluster.status = 'ready';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [
      {
        ...cloneDeep(hostNetworkingBase),
        validationsInfo: JSON.stringify(hostValidations),
      },
    ];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(false);
  });

  test('returns true when soft validation failed and another validation is pending', () => {
    const cluster: Cluster = cloneDeep(clusterBase);
    const hostValidations: HostValidationsInfo = {
      network: [
        {
          id: 'belongs-to-machine-cidr',
          message: 'Host belongs to machine CIDR.',
          status: 'pending',
        },
        { id: 'connected', message: 'Host is connected.', status: 'success' },
        { id: 'ntp-synced', message: 'NTP is synced.', status: 'failure' },
      ],
    };
    cluster.status = 'pending-for-input';
    cluster.validationsInfo = JSON.stringify(validationInfoNetworkingReady);
    cluster.hosts = [
      {
        ...cloneDeep(hostNetworkingBase),
        status: 'pending-for-input',
        validationsInfo: JSON.stringify(hostValidations),
      },
    ];
    expect(isNetworkingStepAwaitingValidations({ cluster })).toBe(true);
  });
});
