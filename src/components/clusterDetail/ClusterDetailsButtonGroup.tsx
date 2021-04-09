import { Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';
import { Cluster } from '../../api';
import { canDownloadClusterLogs } from '../hosts/utils';
import { EventsModalButton } from '../ui/eventsModal';
import KubeconfigDownload from './KubeconfigDownload';
import { downloadClusterInstallationLogs } from './utils';
import { AlertsContext } from '../AlertsContextProvider';

type ClusterDetailsButtonGroupProps = {
  cluster: Cluster;
};

const getID = (suffix: string) => `cluster-detail-${suffix}`;

const ClusterDetailsButtonGroup: React.FC<ClusterDetailsButtonGroupProps> = ({ cluster }) => {
  const { addAlert } = React.useContext(AlertsContext);
  return (
    <Flex
      className="assisted-ui-vertical-margin"
      spaceItems={{ default: 'spaceItemsSm' }}
      direction={{ default: 'row' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
    >
      <FlexItem>
        <KubeconfigDownload
          status={cluster.status}
          clusterId={cluster.id}
          data-testid={getID('button-download-kubeconfig')}
        />
      </FlexItem>
      <FlexItem>
        <Button
          data-testid="cluster-installation-logs-button"
          variant={ButtonVariant.link}
          onClick={() => downloadClusterInstallationLogs(addAlert, cluster.id)}
          isDisabled={!canDownloadClusterLogs(cluster)}
        >
          Download Installation Logs
        </Button>
      </FlexItem>
      <FlexItem>
        <EventsModalButton
          data-testid="cluster-events-button"
          entityKind="cluster"
          cluster={cluster}
          title="Cluster Events"
          variant={ButtonVariant.link}
        >
          View Cluster Events
        </EventsModalButton>
      </FlexItem>
    </Flex>
  );
};

export default ClusterDetailsButtonGroup;
