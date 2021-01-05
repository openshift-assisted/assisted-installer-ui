import React from 'react';
import { AddHostsClusterCreateParams, getOpenshiftVersions, handleApiError } from '../api';
import { DEFAULT_OPENSHIFT_VERSION } from '../config';
import { OpenshiftVersionOptionType } from '../types/versions';

const generateBugzillaLink = (version: string) =>
  `https://bugzilla.redhat.com/enter_bug.cgi?product=OpenShift%20Container%20Platform&Component=OpenShift%20Container%20Platform&component=assisted-installer&version=${version}`;

export type OpenshiftVersionsContextType = {
  versions: OpenshiftVersionOptionType[];

  // Assumption: AddHostsClusterCreateParams['openshiftVersion'] is a subset of OpenshiftVersionOptionType['value'] and contains the latest supported versions
  // In case this assumption is wrong, let's pass the "wrong" value to the Day 2 API and let it fail on server validation.
  getDefaultVersion: () => AddHostsClusterCreateParams['openshiftVersion'];
  normalizeClusterVersion: (version?: string) => AddHostsClusterCreateParams['openshiftVersion'];
  getBugzillaLink: (version?: OpenshiftVersionOptionType['value']) => string;
};

export const OpenshiftVersionsContext = React.createContext<OpenshiftVersionsContextType>({
  versions: [],
  getDefaultVersion: () => '',
  normalizeClusterVersion: () => '',
  getBugzillaLink: () => generateBugzillaLink(DEFAULT_OPENSHIFT_VERSION.value),
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
        const versions: OpenshiftVersionOptionType[] = Object.getOwnPropertyNames(data)
          .sort()
          .map((key) => ({
            label: `OpenShift ${data[key].displayName || key}`,
            // TODO(mlibra): Nasty hotfix to workaround bug on backend. Expected value: '4.6', received value: '4_6'
            value: key.replace('_', '.'),
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

  const getBugzillaLink = React.useCallback(
    (version: OpenshiftVersionOptionType['value'] = getDefaultVersion()) =>
      generateBugzillaLink(version),
    [getDefaultVersion],
  );

  return (
    <OpenshiftVersionsContext.Provider
      value={{ versions, normalizeClusterVersion, getBugzillaLink, getDefaultVersion }}
    >
      {children}
    </OpenshiftVersionsContext.Provider>
  );
};
