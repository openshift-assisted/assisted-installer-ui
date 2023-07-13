import { test, describe, expect } from 'vitest';
import cloneDeep from 'lodash-es/cloneDeep';

import { Cluster, Host, ValidationsInfo } from '../../../common';
import {
  // ValidationGroup as HostValidationGroup,
  ValidationsInfo as HostValidationsInfo,
  Validation as HostValidation,
} from '../../../common/types/hosts';

import { canNextClusterDetails, canNextHostDiscovery, canNextStorage } from './wizardTransition';

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
      id: 'api-vips-defined',
      message: 'a validation unrelated to the canNextHostDiscovery',
      status: 'error',
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

// TODO: Add e2e happy flow test

describe('OCM wizard transitions', () => {
  test('canNextClusterDetails', () => {
    // based on clusterDetailsStepValidationsMap
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoClusterDetails);

    expect(canNextClusterDetails({ cluster })).toBe(false);

    cluster.status = 'ready';
    expect(canNextClusterDetails({ cluster })).toBe(true);

    cluster.status = clusterBase.status;
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextClusterDetails({ cluster })).toBe(false);

    // @ts-expect-error Known object content
    validationInfo.configuration[1].status = 'error';
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextClusterDetails({ cluster })).toBe(false);

    // @ts-expect-error Known object content
    validationInfo.configuration[1].status = 'success';
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextClusterDetails({ cluster })).toBe(true);
  });

  test('canNextHostDiscovery', () => {
    // based on hostDiscoveryStepValidationsMap
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoHostsDisovery);
    const hosts: Host[] = cloneDeep(hostsHostDiscovery);
    const host0ValidationInfo: HostValidationsInfo = cloneDeep(hostValidationInfoHostsDiscovery);
    const host0FlatValidationHostsDiscovery: HostValidation[] = cloneDeep(
      flatValidationHostsDiscovery,
    );

    expect(canNextHostDiscovery({ cluster })).toBe(false);

    cluster.status = 'ready';
    expect(canNextHostDiscovery({ cluster })).toBe(true);

    cluster.status = clusterBase.status;
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextHostDiscovery({ cluster })).toBe(true); // no hosts so far

    cluster.hosts = hosts;
    expect(canNextHostDiscovery({ cluster })).toBe(false);

    cluster.hosts[0].status = 'disabled';
    expect(canNextHostDiscovery({ cluster })).toBe(true);

    cluster.hosts[0].status = 'known';
    expect(canNextHostDiscovery({ cluster })).toBe(true);

    cluster.hosts[0].status = 'insufficient';
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextHostDiscovery({ cluster })).toBe(false);

    // @ts-expect-error Known object content
    host0ValidationInfo.hardware[1].status = 'success';
    host0ValidationInfo.operators = host0FlatValidationHostsDiscovery;
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextHostDiscovery({ cluster })).toBe(true);
  });

  test('canNextStorage', () => {
    // based on storageStepValidationsMap
    const cluster: Cluster = cloneDeep(clusterBase);
    const validationInfo = cloneDeep(validationInfoStorage);
    const hosts: Host[] = cloneDeep(hostsStorage);
    const host0ValidationInfo: HostValidationsInfo = cloneDeep(hostValidationInfoStorage);
    const host0FlatValidation: HostValidation[] = cloneDeep(flatValidationHostsStorage);

    expect(canNextStorage({ cluster })).toBe(false);

    cluster.status = 'ready';
    expect(canNextStorage({ cluster })).toBe(true);

    cluster.status = clusterBase.status;
    cluster.validationsInfo = JSON.stringify(validationInfo);
    expect(canNextStorage({ cluster })).toBe(true); // no hosts so far

    cluster.hosts = hosts;
    expect(canNextStorage({ cluster })).toBe(false);

    cluster.hosts[0].status = 'disabled';
    expect(canNextStorage({ cluster })).toBe(true);

    cluster.hosts[0].status = 'known';
    expect(canNextStorage({ cluster })).toBe(true);

    cluster.hosts[0].status = 'insufficient';
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextStorage({ cluster })).toBe(false);

    // @ts-expect-error Known object content
    host0ValidationInfo.hardware[1].status = 'success';
    host0ValidationInfo.operators = host0FlatValidation;
    cluster.hosts[0].validationsInfo = JSON.stringify(host0ValidationInfo);
    expect(canNextStorage({ cluster })).toBe(true);
  });
});
