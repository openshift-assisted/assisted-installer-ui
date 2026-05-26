import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
  Cluster,
  DiskEncryption,
  ManagedDomain,
} from '@openshift-assisted/types/assisted-installer-service';
import { getDefaultCpuArchitecture, OpenshiftVersionOptionType } from '../../types';
import { TangServer } from '../clusterConfiguration/DiskEncryptionFields/DiskEncryptionValues';
import { getDefaultOpenShiftVersion } from '../ui';
import {
  baseDomainValidationSchema,
  isValidFullClusterAddress,
  nameValidationSchema,
  pullSecretValidationSchema,
} from '../../validationSchemas';
import { ClusterDetailsValues } from './types';

const fullClusterAddressTest = (t: TFunction) => ({
  name: 'full-cluster-address',
  message: t(
    'ai:The full cluster address [Cluster name].[Base domain] must be a valid DNS name (e.g. mycluster.example.com).',
  ),
  test: (values: { name?: string; baseDnsDomain?: string } | undefined) => {
    const name = values?.name?.trim() ?? '';
    const base = values?.baseDnsDomain?.trim() ?? '';
    if (!name || !base) return true;
    return isValidFullClusterAddress(`${name}.${base}`);
  },
});

const emptyTangServers = (): TangServer[] => {
  return [
    {
      url: '',
      thumbprint: '',
    },
  ];
};

export const parseTangServers = (tangServersString?: string): TangServer[] => {
  if (!tangServersString) {
    return emptyTangServers();
  }

  try {
    return JSON.parse(tangServersString) as TangServer[];
  } catch (e) {
    // console.warn('Tang Servers can not be parsed');
  }
  return emptyTangServers();
};

const parseDiskEncryption = (diskEncryption: Cluster['diskEncryption']) => {
  const enableOn = {
    enableDiskEncryptionOnMasters: false,
    enableDiskEncryptionOnWorkers: false,
    enableDiskEncryptionOnArbiters: false,
  };

  if (diskEncryption?.enableOn === 'all') {
    enableOn.enableDiskEncryptionOnMasters = true;
    enableOn.enableDiskEncryptionOnWorkers = true;
    enableOn.enableDiskEncryptionOnArbiters = true;
  } else {
    const types = diskEncryption?.enableOn?.split(',');

    types?.forEach((type) => {
      switch (type) {
        case 'masters':
          enableOn.enableDiskEncryptionOnMasters = true;
          break;
        case 'workers':
          enableOn.enableDiskEncryptionOnWorkers = true;
          break;
        case 'arbiters':
          enableOn.enableDiskEncryptionOnArbiters = true;
          break;
      }
    });
  }

  return enableOn;
};

export const getClusterDetailsInitialValues = ({
  cluster,
  pullSecret,
  managedDomains,
  ocpVersions,
  baseDomain,
}: {
  cluster?: Cluster;
  pullSecret?: string;
  managedDomains: ManagedDomain[];
  ocpVersions: OpenshiftVersionOptionType[];
  baseDomain?: string;
}): ClusterDetailsValues => {
  const {
    name = '',
    baseDnsDomain = baseDomain || '',
    openshiftVersion = getDefaultOpenShiftVersion(ocpVersions),
    controlPlaneCount = 3,
  } = cluster || {};

  return {
    name,
    openshiftVersion,
    pullSecret: pullSecret || '',
    baseDnsDomain,
    controlPlaneCount,
    useRedHatDnsService:
      !!baseDnsDomain && managedDomains.map((d) => d.domain).includes(baseDnsDomain),
    cpuArchitecture: cluster?.cpuArchitecture || getDefaultCpuArchitecture(),
    platform: cluster?.platform?.type || 'baremetal',
    customOpenshiftSelect: null,
    userManagedNetworking: cluster?.userManagedNetworking || false,

    diskEncryptionMode: cluster?.diskEncryption?.mode ?? 'tpmv2',
    diskEncryptionTangServers: parseTangServers(cluster?.diskEncryption?.tangServers),
    diskEncryption: cluster?.diskEncryption ?? {},
    ...parseDiskEncryption(cluster?.diskEncryption),
  };
};

export const getClusterDetailsValidationSchema = ({
  usedClusterNames,
  pullSecretSet,
  validateUniqueName,
  isOcm,
  t,
}: {
  usedClusterNames: string[];
  pullSecretSet?: boolean;
  validateUniqueName?: boolean;
  isOcm?: boolean;
  t: TFunction;
}) =>
  Yup.lazy((values: { baseDnsDomain: string; isSNODevPreview: boolean }) => {
    const fullAddressTest = fullClusterAddressTest(t);
    if (pullSecretSet) {
      return Yup.object({
        name: nameValidationSchema(
          t,
          usedClusterNames,
          values.baseDnsDomain,
          validateUniqueName,
          isOcm,
        ),
        baseDnsDomain: baseDomainValidationSchema(t).required(t('ai:Required field')),
      }).test(fullAddressTest.name, fullAddressTest.message, fullAddressTest.test);
    }
    return Yup.object({
      name: nameValidationSchema(
        t,
        usedClusterNames,
        values.baseDnsDomain,
        validateUniqueName,
        isOcm,
      ),
      baseDnsDomain: baseDomainValidationSchema(t).required(t('ai:Required field')),
      pullSecret: pullSecretValidationSchema(t).required(t('ai:Required field')),
      diskEncryptionTangServers: Yup.array().when('diskEncryptionMode', {
        is: (diskEncryptionMode: DiskEncryption['mode']) => {
          return diskEncryptionMode === 'tang';
        },
        then: () =>
          Yup.array().of(
            Yup.object().shape({
              url: Yup.string()
                .url(
                  t('ai:Tang Server URL must be a valid URL starting with "http://" or "https://"'),
                )
                .required(t('ai:Required field')),
              thumbprint: Yup.string().required(t('ai:Required field')),
            }),
          ),
      }),
    }).test(fullAddressTest.name, fullAddressTest.message, fullAddressTest.test);
  });
