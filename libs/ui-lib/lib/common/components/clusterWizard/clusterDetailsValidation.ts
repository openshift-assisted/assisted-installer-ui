import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
  Cluster,
  DiskEncryption,
  ManagedDomain,
} from '@openshift-assisted/types/assisted-installer-service';
import { getDefaultCpuArchitecture, OpenshiftVersionOptionType } from '../../types';
import { TangServer } from '../clusterConfiguration/DiskEncryptionFields/DiskEncryptionValues';
import {
  baseDomainValidationSchema,
  dnsNameValidationSchema,
  getDefaultOpenShiftVersion,
  nameValidationSchema,
  pullSecretValidationSchema,
} from '../ui';
import { ClusterDetailsValues } from './types';

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
    enableDiskEncryptionOnMasters: ['all', 'masters'].includes(
      cluster?.diskEncryption?.enableOn ?? 'none',
    ),
    enableDiskEncryptionOnWorkers: ['all', 'workers'].includes(
      cluster?.diskEncryption?.enableOn ?? 'none',
    ),
    diskEncryptionMode: cluster?.diskEncryption?.mode ?? 'tpmv2',
    diskEncryptionTangServers: parseTangServers(cluster?.diskEncryption?.tangServers),
    diskEncryption: cluster?.diskEncryption ?? {},
    cpuArchitecture: cluster?.cpuArchitecture || getDefaultCpuArchitecture(),
    platform: cluster?.platform?.type || 'baremetal',
    customOpenshiftSelect: null,
    userManagedNetworking: cluster?.userManagedNetworking || false,
    enableDiskEncryptionOnArbiters: ['all', 'arbiters'].includes(
      cluster?.diskEncryption?.enableOn ?? 'none',
    ),
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
    const validateName = () =>
      nameValidationSchema(t, usedClusterNames, values.baseDnsDomain, validateUniqueName, isOcm);
    if (pullSecretSet) {
      return Yup.object({
        name: validateName(),
        baseDnsDomain: isOcm
          ? baseDomainValidationSchema.required('Required')
          : dnsNameValidationSchema.required('Required'),
      });
    }
    return Yup.object({
      name: validateName(),
      baseDnsDomain: isOcm
        ? baseDomainValidationSchema.required('Required')
        : dnsNameValidationSchema.required('Required'),
      pullSecret: pullSecretValidationSchema.required('Required.'),
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
                .required(t('ai:Required.')),
              thumbprint: Yup.string().required(t('ai:Required.')),
            }),
          ),
      }),
    });
  });
