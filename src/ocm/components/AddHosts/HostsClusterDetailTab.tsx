import React, { ReactNode } from 'react';
import { Button, ButtonVariant, EmptyStateVariant } from '@patternfly/react-core';
import {
  Cluster,
  POLLING_INTERVAL,
  AddHostsContextProvider,
  AlertsContextProvider,
  ErrorState,
  LoadingState,
} from '../../../common';
import { usePullSecret } from '../../hooks';
import { AssistedUILibVersion } from '../ui';
import { useOpenshiftVersions } from '../../hooks';
import { handleApiError } from '../../api';
import AddHosts from './AddHosts';
import { OcmClusterType } from './types';
import { getOpenshiftClusterId } from './utils';
import { ClustersAPI } from '../../services/apis';
import { InfraEnvsService } from '../../services';

type OpenModalType = (modalName: string, cluster?: OcmClusterType) => void;

type HostsClusterDetailTabProps = {
  cluster?: OcmClusterType;
  isVisible: boolean;
  openModal?: OpenModalType;
};

const HostsClusterDetailTabContent: React.FC<HostsClusterDetailTabProps> = ({
  cluster,
  isVisible,
  openModal,
}) => {
  const [error, setError] = React.useState<ReactNode>();
  const [day2Cluster, setDay2Cluster] = React.useState<Cluster | null>();
  const pullSecret = usePullSecret();
  const { normalizeClusterVersion } = useOpenshiftVersions();

  const TryAgain = React.useCallback(
    () => (
      <Button
        onClick={() => {
          setError(undefined);
          setDay2Cluster(undefined);
        }}
        variant={ButtonVariant.link}
        isInline
      >
        try again
      </Button>
    ),
    [setError, setDay2Cluster],
  );

  const MissingApiUrl = React.useCallback(() => {
    return (
      <>
        Neither API nor Console URL has been reported by the cluster yet.
        {openModal && (
          <>
            {' '}
            <br />
            Please hold on and {<TryAgain />} later or{' '}
            <Button
              variant={ButtonVariant.link}
              isInline
              onClick={() => openModal('edit-console-url', cluster)}
            >
              add console URL
            </Button>{' '}
            manually.
          </>
        )}
      </>
    );
  }, [openModal, cluster]);

  React.useEffect(() => {
    if (!isVisible && day2Cluster) {
      // the tab is not visible, stop polling
      setDay2Cluster(undefined);
    }
    const openshiftClusterId = getOpenshiftClusterId(cluster);

    if (isVisible && day2Cluster === undefined && cluster && openshiftClusterId && pullSecret) {
      // ensure exclusive run
      setDay2Cluster(null);

      // validate input
      const openshiftVersion = normalizeClusterVersion(cluster.openshift_version);
      if (!openshiftVersion) {
        setError(
          <>
            Unsupported OpenShift cluster version: ${cluster.openshift_version}.
            <br />
            Check your connection and <TryAgain />.
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
              Cluster API URL is not valid (${cluster.api.url}), you can <TryAgain />.
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
              Cluster Console URL is not valid (${cluster.console?.url}), you can <TryAgain />.
            </>,
          );
          return;
        }
      }

      if (!apiVipDnsname) {
        setError(<MissingApiUrl />);
        return;
      }

      const doItAsync = async () => {
        let dayTwoClusterExists = false;
        // try to find Day 2 cluster (can be missing)
        try {
          const { data: clusters } = await ClustersAPI.listByOpenshiftId(openshiftClusterId);
          const day2Clusters = clusters.filter((cluster) => cluster.kind === 'AddHostsCluster');
          if (day2Clusters.length !== 0) {
            const { data } = await ClustersAPI.get(day2Clusters[0].id);
            setDay2Cluster(data);
            dayTwoClusterExists = true;
          }
        } catch (e) {
          if (Number(e?.response?.status) !== 404) {
            handleApiError(e);
            setError(
              <>
                Failed to read cluster details.
                <br />
                Check your connection and <TryAgain />.
              </>,
            );
            return;
          }
        }

        if (!dayTwoClusterExists) {
          try {
            // Optionally create Day 2 cluster
            // TODO(jkilzi): cannot move to v2 until https://issues.redhat.com/browse/MGMT-7915 is done
            const { data } = await ClustersAPI.registerAddHosts({
              openshiftClusterId, // used to both match OpenShift Cluster and as an assisted-installer ID
              name: `scale-up-${cluster.display_name || cluster.name || openshiftClusterId}`, // both cluster.name and cluster.display-name contain just UUID which fails AI validation (k8s naming conventions)
              openshiftVersion,
              apiVipDnsname,
            });

            await InfraEnvsService.create({
              name: `${data.name}_infra-env`,
              pullSecret,
              clusterId: data.id,
              // TODO(jkilzi): MGMT-7709 will deprecate the openshiftVersion field, remove the line below once it happens.
              openshiftVersion,
            });
            // all set, we can refirect
            setDay2Cluster(data);
          } catch (e) {
            handleApiError(e);
            setError(
              <>
                Failed to create wrapping cluster for adding new hosts.
                <br />
                Check your connection and <TryAgain />.
              </>,
            );
          }
        }
      };

      doItAsync();
    }
  }, [cluster, openModal, pullSecret, day2Cluster, isVisible, normalizeClusterVersion]);

  React.useEffect(() => {
    if (day2Cluster) {
      const id = setTimeout(() => {
        const doItAsync = async () => {
          try {
            const { data } = await ClustersAPI.get(day2Cluster.id);
            setDay2Cluster(data);
          } catch (e) {
            handleApiError(e);
            setError(
              <>
                Failed to reload cluster data.
                <br />
                Check your connection and <TryAgain />.
              </>,
            );
          }
        };
        doItAsync();
      }, POLLING_INTERVAL);
      return () => clearTimeout(id);
    }
  }, [day2Cluster]);

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
    <AddHostsContextProvider cluster={day2Cluster} ocpConsoleUrl={cluster?.console?.url}>
      <AddHosts />
    </AddHostsContextProvider>
  );
};

export const HostsClusterDetailTab: React.FC<HostsClusterDetailTabProps> = (props) => (
  <>
    <AssistedUILibVersion />
    <AlertsContextProvider>
      <HostsClusterDetailTabContent {...props} />
    </AlertsContextProvider>
  </>
);
