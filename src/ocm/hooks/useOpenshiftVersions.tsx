import React from 'react';
import {
  CpuArchitecture,
  ImportClusterParams,
  OpenshiftVersion,
  OpenshiftVersionOptionType,
} from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import { SupportedOpenshiftVersionsAPI } from '../services/apis';

type UseOpenshiftVersionsType = {
  versions: OpenshiftVersionOptionType[];
  normalizeClusterVersion: (version?: string) => ImportClusterParams['openshiftVersion'];
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

export default function useOpenshiftVersions(): UseOpenshiftVersionsType {
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>();
  const [error, setError] = React.useState<UseOpenshiftVersionsType['error']>();

  const doAsync = React.useCallback(async () => {
    try {
      const { data } = await SupportedOpenshiftVersionsAPI.list();
      const versions: OpenshiftVersionOptionType[] = Object.keys(data).map((key) => {
        const versionItem = data[key] as OpenshiftVersion;
        const version = versionItem.displayName;
        return {
          label: `OpenShift ${version || key}`,
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

  React.useEffect(() => {
    doAsync();
  }, [doAsync, setVersions]);

  const normalizeClusterVersion = React.useCallback(
    (version = ''): string =>
      versions?.map((obj) => obj.value).find((normalized) => version.startsWith(normalized)) ||
      version,
    [versions],
  );

  return {
    error,
    loading: !error && !versions,
    versions: versions || [],
    normalizeClusterVersion,
  };
}
