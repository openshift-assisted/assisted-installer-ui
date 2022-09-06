import React from 'react';
import {
  CpuArchitecture,
  ImportClusterParams,
  OpenshiftVersion,
  OpenshiftVersionOptionType,
} from '../../common';
import { handleApiError } from '../api';
import { SupportedOpenshiftVersionsAPI } from '../services/apis';
import { getApiErrorMessage } from '../../common/utils';

type UseOpenshiftVersionsType = {
  versions: OpenshiftVersionOptionType[];
  normalizeClusterVersion: (version?: string) => ImportClusterParams['openshiftVersion'];
  isSupportedOpenShiftVersion: (version?: string) => boolean;
  error?: { title: string; message: string };
  loading: boolean;
};

const supportedVersionLevels = ['production', 'maintenance'];

const sortVersions = (versions: OpenshiftVersionOptionType[]) => {
  return versions
    .sort((version1, version2) =>
      version1.label.localeCompare(version2.label, undefined, { numeric: true }),
    )
    .reverse();
};

export const findVersionItemByVersion = (
  versions: OpenshiftVersionOptionType[],
  version: string,
): OpenshiftVersionOptionType | undefined => {
  return versions.find(({ value: versionKey }) => {
    // For version 4.10 match 4.10, 4.10.3, not 4.1, 4.1.5
    const versionNameMatch = new RegExp(`^${versionKey}(\\..+)?$`);
    return versionNameMatch.test(version);
  });
};

export default function useOpenshiftVersions(): UseOpenshiftVersionsType {
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [error, setError] = React.useState<UseOpenshiftVersionsType['error']>();

  const doAsync = React.useCallback(async () => {
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

  React.useEffect(() => {
    void doAsync();
  }, [doAsync, setVersions]);

  const normalizeClusterVersion = React.useCallback(
    (version = ''): string => {
      const matchingVersion = findVersionItemByVersion(versions, version as string);
      return (matchingVersion?.value || version) as string;
    },
    [versions],
  );

  const isSupportedOpenShiftVersion = React.useCallback(
    (version = ''): boolean => {
      const selectedVersion = findVersionItemByVersion(versions, version);
      return supportedVersionLevels.includes(selectedVersion?.supportLevel || '');
    },
    [versions],
  );

  return {
    error,
    loading: !error && versions.length === 0,
    versions,
    normalizeClusterVersion,
    isSupportedOpenShiftVersion,
  };
}
