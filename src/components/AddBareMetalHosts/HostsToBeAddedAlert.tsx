import React from 'react';
import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { getCluster } from '../../api';
import { isKnownHost } from '../hosts/utils';
import { OcmClusterType } from './types';
import { redirectToCluster } from '../ui/RedirectToCluster';
import { getOcmClusterId } from './utils';
import { useHistory } from 'react-router-dom';

const HostsToBeAddedAlert: React.FC<{ cluster: OcmClusterType }> = ({ cluster: ocmCluster }) => {
  const [isVisible, setVisible] = React.useState(false);
  const history = useHistory();

  React.useEffect(() => {
    const doItAsync = async () => {
      try {
        const { data: cluster } = await getCluster(getOcmClusterId(ocmCluster));
        if (cluster.kind === 'AddHostsCluster' && isKnownHost(cluster)) {
          setVisible(true);
        }
        // so far no polling here
      } catch (e) {
        // silently ignore error in this case
      }
    };
    doItAsync();
  }, [ocmCluster]);

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      variant={AlertVariant.success}
      title="Bare Metal Hosts have been discovered"
      actionLinks={
        <AlertActionLink
          id="install-discovered-hosts"
          onClick={() => redirectToCluster(history, getOcmClusterId(ocmCluster))}
        >
          Add Hosts
        </AlertActionLink>
      }
      isInline
    >
      There are hosts discovered for adding to this cluster.
    </Alert>
  );
};

export default HostsToBeAddedAlert;
