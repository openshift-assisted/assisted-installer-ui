import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { normalizeClusterVersion } from '../../config';
import { OcmClusterType } from './types';
import { AddHostsClusterCreateParams, Cluster, getCluster, handleApiError } from '../../api';
import RedirectToCluster from '../ui/RedirectToCluster';
import { getOcmClusterId } from './utils';
import { usePullSecretFetch } from '../fetching/pullSecret';
import { ErrorState, LoadingState } from '../ui';
import { addHostsClusters } from '../../api/addHostsClusters';

const AddBareMetalHostsDialog: React.FC<{
  isOpen: boolean;
  closeModal: () => {};
  cluster: OcmClusterType;
}> = ({ isOpen, cluster, closeModal }) => {
  const [error, setError] = React.useState<string>();
  const [redirect, setRedirect] = React.useState<Cluster['id']>();
  const pullSecret = usePullSecretFetch();

  React.useEffect(() => {
    if (isOpen && pullSecret) {
      // validate input
      const openshiftVersion = normalizeClusterVersion(cluster.openshift_version);
      if (!openshiftVersion) {
        setError(`Unsupported OpenShift cluster version: ${cluster.openshift_version}`);
        return;
      }

      let apiVipDnsname = '';
      // Format of cluster.api.url: protocol://domain:port
      if (cluster.api?.url) {
        try {
          const apiVipUrl = new URL(cluster.api.url);
          apiVipDnsname = apiVipUrl.hostname; // just domain is needed
        } catch {
          setError('Cluster API URL is not valid.');
          return;
        }
      } else if (cluster.console?.url) {
        // Try to guess API URL from Console URL.
        // Assumption: the cluster is originated by Assisted Installer, so console URL format should be fixed.
        try {
          // protocol://console-openshift-console.apps.[CLUSTER_NAME].[BASE_DOMAIN]"
          const consoleUrlHostname = new URL(cluster.console.url).hostname;
          const APPS = '.apps.';
          apiVipDnsname =
            'api.' + consoleUrlHostname.substring(consoleUrlHostname.indexOf(APPS) + APPS.length);
        } catch {
          setError('Cluster Console URL is not valid.');
          return;
        }
      }

      if (!apiVipDnsname) {
        setError('Missing API URL');
        return;
      }

      const clusterId = getOcmClusterId(cluster);

      const doItAsync = async () => {
        let dayTwoClusterExists = false;
        // try to find Day 2 cluster (can be missing)
        try {
          // Assumption: recently Day 2 assisted-installer cluster ID is equal to the OCM cluster ID (as passed via the addHostsClusters() call bellow).
          // The AI cluster _will_ be enhanced for openshift_cluster_id . Once this is available, we should rather search based on this new field.
          const { data } = await getCluster(clusterId);
          setRedirect(data.id);
          dayTwoClusterExists = true;
        } catch (e) {
          if (e.response?.status !== 404) {
            handleApiError(e);
            setError('Failed to read cluster details.');
            return;
          }
        }

        if (!dayTwoClusterExists) {
          try {
            // Optionally create Day 2 cluster
            const { data } = await addHostsClusters({
              id: clusterId,
              name: `scale-up-${cluster.display_name || cluster.name || clusterId}`, // both cluster.name and cluster.display-name contain just UUID which fails AI validation (k8s naming conventions)
              openshiftVersion,
              apiVipDnsname,
            });
            // all set, we can refirect
            setRedirect(data.id);
          } catch (e) {
            handleApiError<AddHostsClusterCreateParams>(e);
            setError('Failed to create wrapping cluster for adding new hosts.');
          }
        }
      };

      doItAsync();
    }
  }, [isOpen, cluster, pullSecret]);

  if (!isOpen) {
    return null;
  }

  if (redirect) {
    return <RedirectToCluster id={redirect} />;
  }

  return (
    <Modal
      aria-label="Add Bare Metal Hosts dialog"
      title="Add Bare Metal Hosts"
      isOpen={true}
      onClose={closeModal}
      variant={ModalVariant.small}
    >
      {error ? (
        <ErrorState content={error} title="Failed to prepare the cluster for adding hosts." />
      ) : (
        <LoadingState content="Preparing cluster for adding hosts. You will be redirected to OpenShift Cluster Manager ..." />
      )}
    </Modal>
  );
};

export default AddBareMetalHostsDialog;
