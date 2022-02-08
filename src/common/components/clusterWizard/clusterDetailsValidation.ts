import * as Yup from 'yup';
import { Cluster, ManagedDomain } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { FeatureSupportLevelData } from '../featureSupportLevels';
import {
  dnsNameValidationSchema,
  getDefaultOpenShiftVersion,
  nameValidationSchema,
  pullSecretValidationSchema,
} from '../ui';
import { ClusterDetailsValues } from './types';

const emptyTangServers = () => {
  return [
    {
      url: '',
      thumbprint: '',
    },
  ];
};

const parseTangServers = (tangServersString?: string) => {
  if (!tangServersString) {
    return emptyTangServers();
  }

  let parsedTangServers = emptyTangServers();
  try {
    parsedTangServers = JSON.parse(tangServersString);
  } catch (e) {
    console.warn('Tang Servers can not be parsed');
  }

  return parsedTangServers;
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
    highAvailabilityMode = 'Full',
    baseDnsDomain = baseDomain || '',
    openshiftVersion = getDefaultOpenShiftVersion(ocpVersions),
  } = cluster || {};

  return {
    name,
    highAvailabilityMode,
    openshiftVersion,
    pullSecret: pullSecret || '',
    baseDnsDomain,
    SNODisclaimer: highAvailabilityMode === 'None',
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
  };
};

export const getClusterDetailsValidationSchema = (
  usedClusterNames: string[],
  featureSupportLevels: FeatureSupportLevelData,
  cluster?: Cluster,
  ocpVersions?: OpenshiftVersionOptionType[],
) =>
  Yup.lazy<{ baseDnsDomain: string }>((values) => {
    if (cluster?.pullSecretSet) {
      return Yup.object({
        name: nameValidationSchema(usedClusterNames, values.baseDnsDomain),
        baseDnsDomain: dnsNameValidationSchema.required('Required'),
      });
    }
    return Yup.object({
      name: nameValidationSchema(usedClusterNames, values.baseDnsDomain),
      baseDnsDomain: dnsNameValidationSchema.required('Required'),
      pullSecret: pullSecretValidationSchema.required('Required.'),
      SNODisclaimer: Yup.boolean().when(['highAvailabilityMode', 'openshiftVersion'], {
        // The disclaimer is required only if SNO is enabled and SNO feature is not fully supported in that version
        is: (highAvailabilityMode, openshiftVersion) => {
          const selectedVersion = (ocpVersions || []).find((v) => v.value === openshiftVersion);
          return (
            highAvailabilityMode === 'None' &&
            selectedVersion &&
            featureSupportLevels.getFeatureSupportLevel(selectedVersion.value, 'SNO') ===
              'dev-preview'
          );
        },
        then: Yup.bool().oneOf([true], 'Confirm the Single Node OpenShift disclaimer to continue.'),
      }),
      diskEncryptionTangServers: Yup.array().when('diskEncryptionMode', {
        is: (diskEncryptionMode) => {
          return diskEncryptionMode == 'tang';
        },
        then: Yup.array().of(
          Yup.object().shape({
            url: Yup.string().url('Tang Server URL must be a valid URL').required('Required.'),
            thumbprint: Yup.string().required('Required.'),
          }),
        ),
      }),
    });
  });
