import React from 'react';
import { AddHostsClusterCreateParams, getOpenshiftVersions, handleApiError } from '../api';
import { DEFAULT_OPENSHIFT_VERSION } from '../config';
import { OpenshiftVersionOptionType } from '../types/versions';

export type OpenshiftVersionsContextType = {
  versions: OpenshiftVersionOptionType[];

  // Assumption: AddHostsClusterCreateParams['openshiftVersion'] is a subset of OpenshiftVersionOptionType['value'] and contains the latest supported versions
  // In case this assumption is wrong, let's pass the "wrong" value to the Day 2 API and let it fail on server validation.
  getDefaultVersion: () => AddHostsClusterCreateParams['openshiftVersion'];
  normalizeClusterVersion: (version?: string) => AddHostsClusterCreateParams['openshiftVersion'];
};

export const OpenshiftVersionsContext = React.createContext<OpenshiftVersionsContextType>({
  versions: [],
  getDefaultVersion: () => '',
  normalizeClusterVersion: () => '',
});

export const OpenshiftVersionsContextProvider: React.FC = ({ children }) => {
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>([
    // TODO(mlibra): provide empty array when /openshift_version API endpoint is deployed to production
    DEFAULT_OPENSHIFT_VERSION,
  ]);
  React.useEffect(() => {
    const doAsync = async () => {
      try {
        const { data } = await getOpenshiftVersions();
        const versions: OpenshiftVersionOptionType[] = Object.keys(data)
          .sort()
          .map((key) => ({
            label: `OpenShift ${data[key].displayName || key}`,
            value: key,
            supportLevel: data[key].supportLevel,
          }));
        setVersions(versions);
      } catch (e) {
        return handleApiError(e);
        // keep using the default hardcoded versions
      }
    };
    doAsync();
  }, [setVersions]);

  const normalizeClusterVersion = React.useCallback(
    (version = ''): string =>
      versions.map((obj) => obj.value).find((normalized) => version.startsWith(normalized)) ||
      version,
    [versions],
  );

  const getDefaultVersion = React.useCallback(
    () => versions[0]?.value || DEFAULT_OPENSHIFT_VERSION.value,
    [versions],
  );

  return (
    <OpenshiftVersionsContext.Provider
      value={{ versions, normalizeClusterVersion, getDefaultVersion }}
    >
      {children}
    </OpenshiftVersionsContext.Provider>
  );
};
