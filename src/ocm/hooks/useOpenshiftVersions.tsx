import React from 'react';
import {
  Cluster,
  CpuArchitecture,
  ImportClusterParams,
  OpenshiftVersion,
  OpenshiftVersionOptionType,
} from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import { SupportedOpenshiftVersionsAPI } from '../services/apis';

type UseOpenshiftVersionsType = {
  versions: OpenshiftVersionOptionType[];
  normalizeClusterVersion: (version: string) => ImportClusterParams['openshiftVersion'];
  isSupportedOpenShiftVersion: (version: string) => boolean;
  getCpuArchitectures: (version: string) => CpuArchitecture[];
  isMultiCpuArchSupported: (version: string) => boolean;
  error?: { title: string; message: string };
  loading: boolean;
};

const sortVersions = (versions: OpenshiftVersionOptionType[]) => {
  return versions
    .sort((version1, version2) =>
      version1.label.localeCompare(version2.label, undefined, { numeric: true }),
    )
    .reverse();
};

const supportedVersionLevels = ['production', 'maintenance'];

export default function useOpenshiftVersions(): UseOpenshiftVersionsType {
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [error, setError] = React.useState<UseOpenshiftVersionsType['error']>();

  const findVersionItemByVersion = React.useCallback(
    (version: string) => {
      return versions.find(({ value: versionKey }) => {
        // For version 4.10 match 4.10, 4.10.3, not 4.1, 4.1.5
        const versionNameMatch = new RegExp(`^${versionKey}(\\..+)?$`);
        return versionNameMatch.test(version);
      });
    },
    [versions],
  );

  const fetchOpenshiftVersions = React.useCallback(async () => {
    try {
      const { data } = await SupportedOpenshiftVersionsAPI.list();

      const versions: OpenshiftVersionOptionType[] = Object.keys(data).map((key) => {
        const versionItem = data[key] as OpenshiftVersion;
        const version = versionItem.displayName;
        return {
          label: `OpenShift ${version}`,
          value: key,
          version,
          default: Boolean(versionItem.default),
          supportLevel: versionItem.supportLevel,
          cpuArchitectures: versionItem.cpuArchitectures as CpuArchitecture[],
        };
      });
      setVersions(sortVersions(versions));
    } catch (e) {
      handleApiError(e, (e) => {
        setError({
          title: 'Failed to retrieve list of supported OpenShift versions.',
          message: getApiErrorMessage(e),
        });
      });
    }
  }, []);

  const normalizeClusterVersion = React.useCallback(
    (version: string) => {
      const matchingVersion = findVersionItemByVersion(version);
      return matchingVersion?.value || version;
    },
    [findVersionItemByVersion],
  );

  // cluster version
  const isSupportedOpenShiftVersion = React.useCallback(
    (version: string) => {
      const selectedVersion = findVersionItemByVersion(version);
      return supportedVersionLevels.includes(selectedVersion?.supportLevel || '');
    },
    [findVersionItemByVersion],
  );

  const isMultiCpuArchSupported = React.useCallback((version: string) => {
    // TODO (multi-arch) check with existing versions list and check the cpuArchitectures length
    return /-multi*/.test(version);
  }, []);

  const getCpuArchitectures = React.useCallback(
    (version: string) => {
      // TODO (multi-arch) confirm this is correctly retrieving the associated version
      const matchingVersion = findVersionItemByVersion(version);
      return matchingVersion?.cpuArchitectures ?? [];
    },
    [findVersionItemByVersion],
  );

  React.useEffect(() => {
    void fetchOpenshiftVersions();
  }, [fetchOpenshiftVersions]);

  return {
    error,
    loading: !error && versions.length === 0,
    versions,
    normalizeClusterVersion,
    isSupportedOpenShiftVersion,
    getCpuArchitectures,
    isMultiCpuArchSupported,
  };
}
