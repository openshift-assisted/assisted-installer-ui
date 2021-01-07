import React from 'react';
import {
  AddHostsClusterCreateParams,
  getErrorMessage,
  getOpenshiftVersions,
  handleApiError,
} from '../../api';
import { OpenshiftVersionOptionType } from '../../types/versions';

type useOpenshiftVersionsType = {
  versions?: OpenshiftVersionOptionType[];
  getDefaultVersion: () => AddHostsClusterCreateParams['openshiftVersion'];
  normalizeClusterVersion: (version?: string) => AddHostsClusterCreateParams['openshiftVersion'];
  error?: { title: string; message: string };
  loading: boolean;
};

export const useOpenshiftVersions = (): useOpenshiftVersionsType => {
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>();
  const [error, setError] = React.useState<useOpenshiftVersionsType['error']>();

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
        return handleApiError(e, (e) => {
          setError({
            title: 'Failed to retrieve list of supported OpenShift versions.',
            message: getErrorMessage(e),
          });
        });
      }
    };
    doAsync();
  }, [setVersions]);

  const normalizeClusterVersion = React.useCallback(
    (version = ''): string =>
      versions?.map((obj) => obj.value).find((normalized) => version.startsWith(normalized)) ||
      version,
    [versions],
  );

  const getDefaultVersion = React.useCallback(
    () => (versions && versions[0]?.value) || '', // let validation fail if versions are not loaded
    [versions],
  );

  return {
    error,
    loading: !error && !versions,
    versions,
    normalizeClusterVersion,
    getDefaultVersion,
  };
};
