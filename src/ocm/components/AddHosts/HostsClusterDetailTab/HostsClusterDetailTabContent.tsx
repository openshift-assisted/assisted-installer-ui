import React, { ReactNode } from 'react';
import { useStateSafely } from '../../../../common/hooks';
import {
  AddHostsContextProvider,
  Cluster,
  ErrorState,
  LoadingState,
  POLLING_INTERVAL,
  InlineLink,
} from '../../../../common';
import { useOpenshiftVersions, usePullSecret } from '../../../hooks';
import { EmptyStateVariant } from '@patternfly/react-core';
import Day2ClusterService from '../../../services/Day2ClusterService';
import { handleApiError } from '../../../api';
import { isApiError } from '../../../api/types';
import { FeatureSupportLevelProvider } from '../../featureSupportLevels';
import AddHosts from '../AddHosts';
import { HostsClusterDetailTabProps } from './types';

export const HostsClusterDetailTabContent: React.FC<HostsClusterDetailTabProps> = ({
  cluster,
  isVisible,
  openModal,
}) => {
  const [error, setError] = React.useState<ReactNode>();
  const [day2Cluster, setDay2Cluster] = useStateSafely<Cluster | null | undefined>(undefined);
  const pullSecret = usePullSecret();
  const { normalizeClusterVersion } = useOpenshiftVersions();

  const handleClickTryAgainLink = React.useCallback(() => {
    setError(undefined);
    setDay2Cluster(undefined);
  }, [setDay2Cluster]);

  const handleClickMissingApiUrlLink = React.useCallback(
    () => openModal?.('edit-console-url', cluster),
    [cluster, openModal],
  );

  React.useEffect(() => {
    if (!isVisible && day2Cluster) {
      // the tab is not visible, stop polling
      setDay2Cluster(undefined);
    }
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(cluster);

    if (isVisible && day2Cluster === undefined && cluster && openshiftClusterId && pullSecret) {
      // ensure exclusive run
      setDay2Cluster(null);

      const openshiftVersion = normalizeClusterVersion(cluster.openshift_version);
      if (!openshiftVersion) {
        setError(
          <>
            Unsupported OpenShift cluster version: ${cluster.openshift_version}.
            <br />
            Check your connection and{' '}
            <InlineLink onClick={handleClickTryAgainLink}>try again</InlineLink>.
          </>,
        );
        return;
      }

      let apiVipDnsname = '';
      // Format of cluster.api.url: protocol://domain:port
      if (cluster.api?.url) {
        try {
          const apiVipUrl = new URL(cluster.api.url);
          apiVipDnsname = apiVipUrl.hostname; // just domain is needed
        } catch {
          setError(
            <>
              Cluster API URL is not valid (${cluster.api.url}), you can{' '}
              <InlineLink onClick={handleClickTryAgainLink}>try again</InlineLink>.
            </>,
          );
          return;
        }
      } else if (cluster.console?.url) {
        // Try to guess API URL from Console URL.
        // Assumption: the cluster is originated by Assisted Installer, so console URL format should be of a fixed format.
        try {
          // protocol://console-openshift-console.apps.[CLUSTER_NAME].[BASE_DOMAIN]"
          const consoleUrlHostname = new URL(cluster.console.url).hostname;
          const APPS = '.apps.';
          apiVipDnsname =
            'api.' + consoleUrlHostname.substring(consoleUrlHostname.indexOf(APPS) + APPS.length);
        } catch {
          setError(
            <>
              Cluster Console URL is not valid (${cluster.console?.url}), you can{' '}
              <InlineLink onClick={handleClickTryAgainLink}>try again</InlineLink>.
            </>,
          );
          return;
        }
      }

      if (!apiVipDnsname) {
        setError(
          <>
            Neither API nor Console URL has been reported by the cluster yet.
            {openModal && (
              <>
                <br />
                Please hold on and{' '}
                <InlineLink onClick={handleClickTryAgainLink}>try again</InlineLink> later or{' '}
                <InlineLink onClick={handleClickMissingApiUrlLink}>add console URL</InlineLink>{' '}
                manually.
              </>
            )}
          </>,
        );

        return;
      }

      const doItAsync = async () => {
        try {
          const day2Cluster = await Day2ClusterService.fetchCluster(
            cluster,
            pullSecret,
            openshiftVersion,
          );
          setDay2Cluster(day2Cluster);
        } catch (e) {
          handleApiError(e);
          if (isApiError(e)) {
            const isImport = e.config.url?.includes('/import');
            setError(
              <>
                {isImport
                  ? 'Failed to create wrapping cluster for adding new hosts.'
                  : 'Failed to fetch cluster for adding new hosts.'}
                <br />
                Check your connection and{' '}
                <InlineLink onClick={handleClickTryAgainLink}>try again</InlineLink>.
              </>,
            );
          }
          return;
        }
      };

      void doItAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cluster,
    openModal,
    pullSecret,
    day2Cluster,
    setDay2Cluster,
    isVisible,
    normalizeClusterVersion,
  ]);

  const resetCluster = React.useCallback(async () => {
    if (day2Cluster) {
      try {
        const cluster = await Day2ClusterService.fetchClusterById(day2Cluster.id);
        setDay2Cluster(cluster);
      } catch (e) {
        handleApiError(e);
        setError(
          <>
            Failed to reload cluster data.
            <br />
            Check your connection and{' '}
            <InlineLink onClick={handleClickTryAgainLink}>try again</InlineLink>.
          </>,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day2Cluster, setDay2Cluster]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      const doItAsync = async () => {
        await resetCluster();
      };
      void doItAsync();
    }, POLLING_INTERVAL);
    return () => clearTimeout(id);
  }, [resetCluster]);

  if (error) {
    return (
      <ErrorState
        variant={EmptyStateVariant.large}
        content={error}
        title="Failed to prepare the cluster for adding hosts."
      />
    );
  }

  if (!day2Cluster) {
    return <LoadingState content="Preparing cluster for adding hosts..." />;
  }

  return (
    <AddHostsContextProvider
      cluster={day2Cluster}
      resetCluster={resetCluster}
      ocpConsoleUrl={cluster?.console?.url}
    >
      <FeatureSupportLevelProvider loadingUi={<LoadingState />} cluster={day2Cluster}>
        <AddHosts />
      </FeatureSupportLevelProvider>
    </AddHostsContextProvider>
  );
};
