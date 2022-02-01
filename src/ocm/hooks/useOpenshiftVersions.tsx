import React from 'react';
import {
  AddHostsClusterCreateParams,
  CpuArchitecture,
  OpenshiftVersionOptionType,
} from '../../common';
import { getErrorMessage, handleApiError } from '../api';
import { SupportedOpenshiftVersionsAPI } from '../services/apis';

type UseOpenshiftVersionsType = {
  versions: OpenshiftVersionOptionType[];
  normalizeClusterVersion: (version?: string) => AddHostsClusterCreateParams['openshiftVersion'];
  error?: { title: string; message: string };
  loading: boolean;
};

const sortVersions = (versions: string[]) => {
  return versions
    .sort((version1, version2) => version1.localeCompare(version2, undefined, { numeric: true }))
    .reverse();
};

export default function useOpenshiftVersions(): UseOpenshiftVersionsType {
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>();
  const [error, setError] = React.useState<UseOpenshiftVersionsType['error']>();

  const doAsync = React.useCallback(async () => {
    try {
      const { data } = await SupportedOpenshiftVersionsAPI.list();
      const sortedVersionNames = sortVersions(Object.keys(data));
      const versions: OpenshiftVersionOptionType[] = sortedVersionNames.map((key) => ({
        label: `OpenShift ${data[key].display_name || key}`,
        value: key,
        version: data[key].display_name,
        default: Boolean(data[key].default),
        supportLevel: data[key].support_level,
        cpuArchitectures: data[key].cpu_architectures as CpuArchitecture[],
      }));

      setVersions(versions);
    } catch (e) {
      return handleApiError(e, (e) => {
        setError({
          title: 'Failed to retrieve list of supported OpenShift versions.',
          message: getErrorMessage(e),
        });
      });
    }
  }, []);

  React.useEffect(() => {
    doAsync();
  }, [doAsync, setVersions]);

  const normalizeClusterVersion = React.useCallback((version = '') => {
    if (!version) {
      return '';
    }
    const [major, minor] = version.split('.');
    return `${major}.${minor}`;
  }, []);

  return {
    error,
    loading: !error && !versions,
    versions: versions || [],
    normalizeClusterVersion,
  };
}
