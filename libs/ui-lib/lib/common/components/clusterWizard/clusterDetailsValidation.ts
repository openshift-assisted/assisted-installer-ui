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
import { FeatureSupportLevelData } from '../featureSupportLevels';
import toNumber from 'lodash-es/toNumber';

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
    SNODisclaimer: controlPlaneCount === 1,
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
    platform: cluster?.platform?.type || 'none',
    customOpenshiftSelect: null,
    userManagedNetworking: cluster?.userManagedNetworking || false,
    enableDiskEncryptionOnArbiters: ['all', 'arbiters'].includes(
      cluster?.diskEncryption?.enableOn ?? 'none',
    ),
  };
};

export const getClusterDetailsValidationSchema = ({
  usedClusterNames,
  featureSupportLevels,
  pullSecretSet,
  ocpVersions,
  validateUniqueName,
  isOcm,
  t,
}: {
  usedClusterNames: string[];
  featureSupportLevels?: FeatureSupportLevelData;
  pullSecretSet?: boolean;
  ocpVersions?: OpenshiftVersionOptionType[];
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
      SNODisclaimer: Yup.boolean().when(['controlPlaneCount', 'openshiftVersion'], {
        // The disclaimer is required only if SNO is enabled and SNO feature is not fully supported in that version
        is: (
          controlPlaneCount: Cluster['controlPlaneCount'],
          openshiftVersion: Cluster['openshiftVersion'],
        ) => {
          const selectedVersion = (ocpVersions || []).find((v) => v.value === openshiftVersion);
          const versionToUse = selectedVersion?.value ?? openshiftVersion;
          if (featureSupportLevels) {
            return toNumber(controlPlaneCount) === 1 && versionToUse && featureSupportLevels
              ? featureSupportLevels.getFeatureSupportLevel(versionToUse, 'SNO') === 'dev-preview'
              : false;
          } else {
            return toNumber(controlPlaneCount) === 1 && versionToUse && values.isSNODevPreview;
          }
        },
        then: () =>
          Yup.boolean().oneOf(
            [true],
            t('ai:Confirm the Single Node OpenShift disclaimer to continue.'),
          ),
      }),
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
