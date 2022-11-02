import React, { ReactNode } from 'react';
import { useStateSafely } from '../../../common/hooks';
import {
  AddHostsContextProvider,
  Cluster,
  ErrorState,
  LoadingState,
  POLLING_INTERVAL,
} from '../../../common';
import { useOpenshiftVersions, usePullSecret } from '../../hooks';
import { Button, EmptyStateVariant } from '@patternfly/react-core';
import Day2ClusterService from '../../services/Day2ClusterService';
import { handleApiError } from '../../api';
import { isApiError } from '../../api/types';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import { AddHosts } from '../AddHosts';
import { HostsClusterDetailTabProps } from './types';

export const HostsClusterDetailTabContent = ({
  cluster: ocmCluster,
  isVisible,
  openModal,
}: HostsClusterDetailTabProps) => {
  const [error, setError] = React.useState<ReactNode>();
  const [day2Cluster, setDay2Cluster] = useStateSafely<Cluster | null | undefined>(undefined);
  const pullSecret = usePullSecret();
  const { normalizeClusterVersion } = useOpenshiftVersions();

  const handleClickTryAgainLink = React.useCallback(() => {
    setError(undefined);
    setDay2Cluster(undefined);
  }, [setDay2Cluster]);

  const handleClickMissingApiUrlLink = React.useCallback(
    () => openModal?.('edit-console-url', ocmCluster),
    [ocmCluster, openModal],
  );

  React.useEffect(() => {
    if (!isVisible && day2Cluster) {
      // the tab is not visible, stop polling
      setDay2Cluster(undefined);
    }
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(ocmCluster);

    if (isVisible && day2Cluster === undefined && ocmCluster && openshiftClusterId && pullSecret) {
      // ensure exclusive run
      setDay2Cluster(null);

      const normalizedVersion = normalizeClusterVersion(ocmCluster.openshift_version);
      if (!normalizedVersion) {
        setError(
          <>
            Unsupported OpenShift cluster version: {ocmCluster.openshift_version || 'N/A'}.
            <br />
            Check your connection and{' '}
            <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
              try again
            </Button>
            .
          </>,
        );
        return;
      }

      let apiVipDnsname = '';
      // Format of cluster.api.url: protocol://domain:port
      if (ocmCluster.api?.url) {
        try {
          const apiVipUrl = new URL(ocmCluster.api.url);
          apiVipDnsname = apiVipUrl.hostname; // just domain is needed
        } catch {
          setError(
            <>
              Cluster API URL is not valid (${ocmCluster.api.url}), you can{' '}
              <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
                try again
              </Button>
              .
            </>,
          );
          return;
        }
      } else if (ocmCluster.console?.url) {
        // Try to guess API URL from Console URL.
        // Assumption: the cluster is originated by Assisted Installer, so console URL format should be of a fixed format.
        try {
          // protocol://console-openshift-console.apps.[CLUSTER_NAME].[BASE_DOMAIN]"
          const consoleUrlHostname = new URL(ocmCluster.console.url).hostname;
          const APPS = '.apps.';
          apiVipDnsname =
            'api.' + consoleUrlHostname.substring(consoleUrlHostname.indexOf(APPS) + APPS.length);
        } catch {
          setError(
            <>
              Cluster Console URL is not valid (${ocmCluster.console?.url}), you can{' '}
              <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
                try again
              </Button>
              .
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
                <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
                  try again
                </Button>{' '}
                later or{' '}
                <Button variant={'link'} isInline onClick={handleClickMissingApiUrlLink}>
                  add console URL
                </Button>{' '}
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
            ocmCluster,
            pullSecret,
            normalizedVersion,
          );
          setDay2Cluster(
            Day2ClusterService.completeAiClusterWithOcmCluster(day2Cluster, ocmCluster),
          );
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
                <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
                  try again
                </Button>
                .
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
    ocmCluster,
    openModal,
    pullSecret,
    day2Cluster,
    setDay2Cluster,
    isVisible,
    normalizeClusterVersion,
  ]);

  const resetCluster = React.useCallback(async () => {
    if (!day2Cluster) {
      return;
    }
    try {
      const updatedDay2Cluster = await Day2ClusterService.fetchClusterById(day2Cluster.id);
      setDay2Cluster(
        Day2ClusterService.completeAiClusterWithOcmCluster(updatedDay2Cluster, ocmCluster),
      );
    } catch (e) {
      handleApiError(e);
      setError(
        <>
          Failed to reload cluster data.
          <br />
          Check your connection and{' '}
          <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
            try again
          </Button>
          .
        </>,
      );
    }
  }, [day2Cluster, handleClickTryAgainLink, ocmCluster, setDay2Cluster]);

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
      ocpConsoleUrl={ocmCluster?.console?.url}
    >
      <FeatureSupportLevelProvider loadingUi={<LoadingState />} cluster={day2Cluster}>
        <AddHosts />
      </FeatureSupportLevelProvider>
    </AddHostsContextProvider>
  );
};
