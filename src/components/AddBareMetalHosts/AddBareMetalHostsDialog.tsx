import React from 'react';
import { Alert, AlertVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { normalizeClusterVersion } from '../../config';
import { OcmClusterType } from './types';
import { AddHostsClusterCreateParams, Cluster, getCluster, handleApiError } from '../../api';
import RedirectToCluster from '../ui/RedirectToCluster';
import { getOcmClusterId } from './utils';
import { usePullSecretFetch } from '../fetching/pullSecret';
import { LoadingState } from '../ui';
import { addHostsClusters } from '../../api/addHostsCluster';

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
              name: cluster.name,
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
      {error && (
        <Alert isInline variant={AlertVariant.danger} title="Add Bare Metal Hosts failed">
          {error}
        </Alert>
      )}
      <LoadingState content="About to redirect to OpenShift Cluster Manager." />
    </Modal>
  );
};

export default AddBareMetalHostsDialog;
