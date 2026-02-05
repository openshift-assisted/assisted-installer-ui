import React, { createContext } from 'react';
import { CpuArchitecture, OpenshiftVersionOptionType } from '../../../common';
import { getApiErrorMessage, handleApiError } from '../../../common/api';
import { SupportedOpenshiftVersionsAPI } from '../../services/apis';
import { Cluster, OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import { getKeys } from '../../../common/utils';

const supportedVersionLevels = ['production', 'maintenance'];

type OpenShiftVersion = Cluster['openshiftVersion'];
type OpenShiftVersionsContextType = {
  allVersions: OpenshiftVersionOptionType[];
  latestVersions: OpenshiftVersionOptionType[];
  isSupportedOpenShiftVersion: (version: OpenShiftVersion) => boolean;
  getCpuArchitectures: (version: OpenShiftVersion) => CpuArchitecture[];
  error?: { title: string; message: string };
  loading: boolean;
};

const OpenShiftVersionsContext = createContext<OpenShiftVersionsContextType | null>(null);

export const OpenShiftVersionsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [allVersions, setAllVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [latestVersions, setLatestVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [error, setError] = React.useState<{ title: string; message: string }>();
  const [isLoading, setIsLoading] = React.useState(true);

  const sortVersions = (versions: OpenshiftVersionOptionType[]) => {
    return versions.sort((version1, version2) =>
      version1.value.localeCompare(version2.value, undefined, { numeric: true }),
    );
  };

  React.useEffect(() => {
    const getVersions = async (
      latest: boolean,
      setVersions: (versions: OpenshiftVersionOptionType[]) => void,
    ) => {
      try {
        const { data } = await SupportedOpenshiftVersionsAPI.list(latest);

        const versions = getKeys(data).map((key) => {
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
        }) as OpenshiftVersionOptionType[];

        const sorted = sortVersions(versions);
        setVersions(sorted);

        if (!latest && sorted.length === 0) {
          setError({
            title: 'Failed to retrieve list of supported OpenShift versions.',
            message: 'No OpenShift versions available.',
          });
        }
      } catch (e) {
        handleApiError(e, (e) => {
          setError({
            title: 'Failed to retrieve list of supported OpenShift versions.',
            message: getApiErrorMessage(e),
          });
        });
      }
    };

    void Promise.allSettled([
      getVersions(false, setAllVersions),
      getVersions(true, setLatestVersions),
    ]).finally(() => setIsLoading(false));
  }, []);

  const findVersionItemByVersion = React.useCallback(
    (version: OpenShiftVersion) => {
      return allVersions?.find(({ value: versionKey }) => {
        // For version 4.10 match 4.10, 4.10.3, not 4.1, 4.1.5
        const versionNameMatch = new RegExp(`^${versionKey}(\\..+)?$`);
        return versionNameMatch.test(version || '');
      });
    },
    [allVersions],
  );

  const isSupportedOpenShiftVersion = React.useCallback(
    (version: OpenShiftVersion) => {
      if (allVersions?.length === 0) {
        // Till the data are loaded
        return true;
      }
      const selectedVersion = findVersionItemByVersion(version);
      return supportedVersionLevels.includes(selectedVersion?.supportLevel || '');
    },
    [findVersionItemByVersion, allVersions],
  );

  const getCpuArchitectures = React.useCallback(
    (version: OpenShiftVersion) => {
      // TODO (multi-arch) confirm this is correctly retrieving the associated version
      const matchingVersion = findVersionItemByVersion(version);
      return matchingVersion?.cpuArchitectures ?? [];
    },
    [findVersionItemByVersion],
  );

  return (
    <OpenShiftVersionsContext.Provider
      value={{
        allVersions,
        latestVersions,
        loading: !error && isLoading,
        error,
        isSupportedOpenShiftVersion,
        getCpuArchitectures,
      }}
    >
      {children}
    </OpenShiftVersionsContext.Provider>
  );
};

export const useOpenShiftVersionsContext = () => {
  const context = React.useContext(OpenShiftVersionsContext);
  if (!context) {
    throw new Error('useOpenShiftVersionsContext must be used within OpenShiftVersionsContext');
  }
  return context;
};
