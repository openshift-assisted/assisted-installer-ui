import React, { ReactNode } from 'react';
import { useStateSafely } from '../../../common/hooks';
import {
  AddHostsContextProvider,
  CpuArchitecture,
  ErrorState,
  LoadingState,
  POLLING_INTERVAL,
} from '../../../common';
import { usePullSecret } from '../../hooks';
import { Button, EmptyStateVariant } from '@patternfly/react-core';
import Day2ClusterService, { getApiVipDnsName } from '../../services/Day2ClusterService';
import { handleApiError } from '../../api';
import { isApiError } from '../../../common/api/utils';
import { AddHosts } from '../AddHosts';
import { HostsClusterDetailTabProps } from './types';
import { NewFeatureSupportLevelProvider } from '../featureSupportLevels';
import {
  AddHostsApiError,
  ReloadFailedError,
  UnableToAddHostsError,
} from './HostsClusterDetailTabContentErrors';
import useInfraEnv from '../../hooks/useInfraEnv';
import { mapOcmArchToCpuArchitecture } from '../../services/CpuArchitectureService';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const HostsClusterDetailTabContent = ({
  cluster: ocmCluster,
  isVisible,
}: HostsClusterDetailTabProps) => {
  const [error, setError] = React.useState<ReactNode>();
  const [day2Cluster, setDay2Cluster] = useStateSafely<Cluster | null>(null);
  const pullSecret = usePullSecret();

  const handleClickTryAgainLink = React.useCallback(() => {
    setError(undefined);
    setDay2Cluster(null);
  }, [setDay2Cluster]);

  const { infraEnv } = useInfraEnv(
    ocmCluster.id || '',
    mapOcmArchToCpuArchitecture(ocmCluster.cpu_architecture) ||
      CpuArchitecture.USE_DAY1_ARCHITECTURE,
    ocmCluster.name,
    pullSecret,
    ocmCluster.openshift_version,
  );

  React.useEffect(() => {
    if (!isVisible) {
      // the tab is not visible, stop polling
      setDay2Cluster(null);
      return;
    }
    const day1ClusterHostCount = ocmCluster?.metrics?.nodes?.total || 0;
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(ocmCluster);
    if (day1ClusterHostCount === 0 || !openshiftClusterId) {
      setError(<UnableToAddHostsError onTryAgain={handleClickTryAgainLink} />);
    }

    if (!day2Cluster && pullSecret) {
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

      const loadDay2Cluster = async () => {
        try {
          const day2Cluster = await Day2ClusterService.fetchCluster(ocmCluster, pullSecret);

          const aiCluster = Day2ClusterService.completeAiClusterWithOcmCluster(
            day2Cluster,
            ocmCluster,
          );
          setDay2Cluster(aiCluster ?? null);
        } catch (e) {
          handleApiError(e);
          if (isApiError(e)) {
            const isImport = e.config?.url?.includes('/import');
            setError(
              <AddHostsApiError
                isImport={isImport || false}
                onTryAgain={handleClickTryAgainLink}
              />,
            );
          }
          return;
        }
      };

      void loadDay2Cluster();
    }
  }, [ocmCluster, pullSecret, day2Cluster, setDay2Cluster, isVisible, handleClickTryAgainLink]);

  const refreshCluster = React.useCallback(async () => {
    if (!day2Cluster?.id) {
      return;
    }
    try {
      const updatedDay2Cluster = await Day2ClusterService.fetchClusterById(day2Cluster.id);
      const aiCluster = Day2ClusterService.completeAiClusterWithOcmCluster(
        updatedDay2Cluster,
        ocmCluster,
      );
      setDay2Cluster(aiCluster ?? null);
    } catch (e) {
      handleApiError(e);
      setError(<ReloadFailedError onTryAgain={handleClickTryAgainLink} />);
    }
  }, [day2Cluster?.id, handleClickTryAgainLink, ocmCluster, setDay2Cluster]);

  React.useEffect(() => {
    const id = setInterval(() => {
      void refreshCluster();
    }, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [refreshCluster]);

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
      resetCluster={refreshCluster}
      ocpConsoleUrl={ocmCluster?.console?.url}
      canEdit={ocmCluster.canEdit}
    >
      <NewFeatureSupportLevelProvider
        loadingUi={<LoadingState />}
        cluster={day2Cluster}
        cpuArchitecture={infraEnv?.cpuArchitecture as CpuArchitecture}
        openshiftVersion={day2Cluster.openshiftVersion}
        platformType={day2Cluster.platform?.type}
      >
        <AddHosts />
      </NewFeatureSupportLevelProvider>
    </AddHostsContextProvider>
  );
};
