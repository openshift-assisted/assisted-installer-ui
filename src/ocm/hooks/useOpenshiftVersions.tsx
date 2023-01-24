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
import { getKeys } from '../../common/utils';

type OpenShiftVersion = Cluster['openshiftVersion'];

type UseOpenshiftVersionsType = {
  versions: OpenshiftVersionOptionType[];
  normalizeClusterVersion: (version: OpenShiftVersion) => ImportClusterParams['openshiftVersion'];
  isSupportedOpenShiftVersion: (version: OpenShiftVersion) => boolean;
  getCpuArchitectures: (version: OpenShiftVersion) => CpuArchitecture[];
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
    (version: OpenShiftVersion) => {
      return versions.find(({ value: versionKey }) => {
        // For version 4.10 match 4.10, 4.10.3, not 4.1, 4.1.5
        const versionNameMatch = new RegExp(`^${versionKey}(\\..+)?$`);
        return versionNameMatch.test(version || '');
      });
    },
    [versions],
  );

  const fetchOpenshiftVersions = React.useCallback(async () => {
    try {
      const { data } = await SupportedOpenshiftVersionsAPI.list();

      const versions: OpenshiftVersionOptionType[] = getKeys(data).map((key) => {
        const versionItem = data[key] as OpenshiftVersion;
        const version = versionItem.displayName;
        return {
          label: `OpenShift ${version}`,
          value: key as string,
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
    (version: OpenShiftVersion) => {
      const matchingVersion = findVersionItemByVersion(version);
      return matchingVersion?.value || version;
    },
    [findVersionItemByVersion],
  );

  const isSupportedOpenShiftVersion = React.useCallback(
    (version: OpenShiftVersion) => {
      const selectedVersion = findVersionItemByVersion(version);
      return supportedVersionLevels.includes(selectedVersion?.supportLevel || '');
    },
    [findVersionItemByVersion],
  );

  const getCpuArchitectures = React.useCallback(
    (version: OpenShiftVersion) => {
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
  };
}
