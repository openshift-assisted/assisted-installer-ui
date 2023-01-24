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
import Day2ClusterService, { getApiVipDnsName } from '../../services/Day2ClusterService';
import { handleApiError } from '../../api';
import { isApiError } from '../../api/types';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import { AddHosts } from '../AddHosts';
import { HostsClusterDetailTabProps } from './types';

export const HostsClusterDetailTabContent = ({
  cluster: ocmCluster,
  extraInfo,
  isVisible,
}: HostsClusterDetailTabProps) => {
  const [error, setError] = React.useState<ReactNode>();
  const [day2Cluster, setDay2Cluster] = useStateSafely<Cluster | null | undefined>(undefined);
  const pullSecret = usePullSecret();
  const { normalizeClusterVersion } = useOpenshiftVersions();

  const handleClickTryAgainLink = React.useCallback(() => {
    setError(undefined);
    setDay2Cluster(undefined);
  }, [setDay2Cluster]);

  React.useEffect(() => {
    if (!isVisible && day2Cluster) {
      // the tab is not visible, stop polling
      setDay2Cluster(undefined);
    }
    const day1ClusterHostCount = ocmCluster?.metrics?.nodes?.total || 0;
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(ocmCluster);
    if (day1ClusterHostCount === 0 || !openshiftClusterId) {
      setError(
        <>
          Temporarily unable to add hosts
          <br />
          We're waiting for your recently installed cluster to report its metrics.{' '}
          <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
            Try again
          </Button>{' '}
          in a few minutes.
        </>,
      );
    }

    if (isVisible && day2Cluster === undefined && pullSecret) {
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

      const { apiVipDnsname, errorType } = getApiVipDnsName(ocmCluster);
      if (errorType) {
        const wrongUrlMessage =
          errorType === 'console'
            ? `Cluster Console URL is not valid (${ocmCluster.console?.url || ''})`
            : `Cluster API URL is not valid (${ocmCluster.api?.url || ''})`;
        setError(
          <>
            {wrongUrlMessage}, you can{' '}
            <Button variant={'link'} isInline onClick={handleClickTryAgainLink}>
              try again
            </Button>
            .
          </>,
        );
        return;
      }

      if (!apiVipDnsname) {
        setError(<>Neither API nor Console URL has been reported by the cluster yet.</>);
        return;
      }

      const doItAsync = async () => {
        try {
          const day2Cluster = await Day2ClusterService.fetchCluster(
            ocmCluster,
            pullSecret,
            normalizedVersion,
            extraInfo,
          );
          setDay2Cluster(
            Day2ClusterService.completeAiClusterWithOcmCluster(day2Cluster, ocmCluster, extraInfo),
          );
        } catch (e) {
          handleApiError(e);
          if (isApiError(e)) {
            const isImport = e.config?.url?.includes('/import');
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
  }, [
    ocmCluster,
    extraInfo,
    pullSecret,
    day2Cluster,
    setDay2Cluster,
    isVisible,
    normalizeClusterVersion,
    handleClickTryAgainLink,
  ]);

  const resetCluster = React.useCallback(async () => {
    if (!day2Cluster?.id) {
      return;
    }
    try {
      const updatedDay2Cluster = await Day2ClusterService.fetchClusterById(day2Cluster.id);
      setDay2Cluster(
        Day2ClusterService.completeAiClusterWithOcmCluster(
          updatedDay2Cluster,
          ocmCluster,
          extraInfo,
        ),
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
  }, [day2Cluster?.id, handleClickTryAgainLink, ocmCluster, extraInfo, setDay2Cluster]);

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
