import { Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';
import {
  Cluster,
  canDownloadClusterLogs,
  useAlerts,
  EventsModalButton,
  KubeconfigDownload,
} from '../../../common';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { canAbortInstallation } from '../clusters/utils';
import { onFetchEvents } from '../fetching/fetchEvents';

type ClusterDetailsButtonGroupProps = {
  cluster: Cluster;
};

const getID = (suffix: string) => `cluster-detail-${suffix}`;

const ClusterDetailsButtonGroup: React.FC<ClusterDetailsButtonGroupProps> = ({ cluster }) => {
  const { addAlert } = useAlerts();
  const { cancelInstallationDialog } = useModalDialogsContext();

  return (
    <Flex
      className="assisted-ui-vertical-margin"
      spaceItems={{ default: 'spaceItemsSm' }}
      direction={{ default: 'row' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
    >
      <FlexItem>
        <Button
          data-testid="cluster-installation-abort-button"
          variant={ButtonVariant.danger}
          onClick={() => cancelInstallationDialog.open({ clusterId: cluster.id })}
          isDisabled={!canAbortInstallation(cluster)}
        >
          Abort Installation
        </Button>
      </FlexItem>
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
          onFetchEvents={onFetchEvents}
        >
          View Cluster Events
        </EventsModalButton>
      </FlexItem>
    </Flex>
  );
};

export default ClusterDetailsButtonGroup;
