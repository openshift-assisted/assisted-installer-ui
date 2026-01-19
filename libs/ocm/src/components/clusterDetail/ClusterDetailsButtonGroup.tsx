import { Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';
import {
  canDownloadClusterLogs,
  useAlerts,
  KubeconfigDownload,
  RenderIf,
  canOpenConsole,
} from '@openshift-assisted/common';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { canAbortInstallation } from '../clusters/utils';
import { onFetchEvents } from '../fetching/fetchEvents';
import ViewClusterEventsButton from '@openshift-assisted/common/components/ui/ViewClusterEventsButton';
import { LaunchOpenshiftConsoleButton } from '@openshift-assisted/common/components/clusterDetail/ConsoleModal';
import { Cluster, Credentials } from '@openshift-assisted/types/assisted-installer-service';

import './ClusterDetailsButtonGroup.css';

type ClusterDetailsButtonGroupProps = {
  cluster: Cluster;
  credentials?: Credentials;
  credentialsError: string;
  showKubeConfig?: boolean;
};

const getID = (suffix: string) => `cluster-detail-${suffix}`;

const ClusterDetailsButtonGroup: React.FC<ClusterDetailsButtonGroupProps> = ({
  cluster,
  credentials,
  credentialsError,
  showKubeConfig = true,
}) => {
  const { addAlert, clearAlerts } = useAlerts();
  const { cancelInstallationDialog, resetClusterDialog } = useModalDialogsContext();
  const hasConsoleUrlAndNoError = credentials?.consoleUrl !== undefined && !credentialsError;

  return (
    <Flex
      className="assisted-ui-vertical-margin"
      spaceItems={{ default: 'spaceItemsSm' }}
      direction={{ default: 'row' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
    >
      <RenderIf condition={cluster.status === 'error'}>
        <FlexItem>
          <Button
            id={getID('button-reset-cluster')}
            variant={ButtonVariant.danger}
            onClick={() => resetClusterDialog.open({ cluster })}
          >
            Reset Cluster
          </Button>
        </FlexItem>
      </RenderIf>
      <RenderIf
        condition={showKubeConfig && hasConsoleUrlAndNoError && canOpenConsole(cluster.status)}
      >
        <FlexItem>
          <LaunchOpenshiftConsoleButton
            isDisabled={false}
            cluster={cluster}
            consoleUrl={credentials?.consoleUrl}
            id={getID('button-launch-console')}
          />
        </FlexItem>
      </RenderIf>
      <RenderIf condition={canAbortInstallation(cluster)}>
        <FlexItem>
          <Button
            data-testid="cluster-installation-abort-button"
            variant={ButtonVariant.danger}
            onClick={() => cancelInstallationDialog.open({ clusterId: cluster.id })}
            isDisabled={false}
          >
            Abort installation
          </Button>
        </FlexItem>
      </RenderIf>
      <FlexItem>
        <KubeconfigDownload
          status={cluster.status}
          clusterId={cluster.id}
          data-testid={getID('button-download-kubeconfig')}
          id={getID('button-download-kubeconfig')}
        />
      </FlexItem>
      <FlexItem>
        <ViewClusterEventsButton cluster={cluster} onFetchEvents={onFetchEvents} />
      </FlexItem>
      <FlexItem>
        <Button
          data-testid="cluster-installation-logs-button"
          variant={ButtonVariant.link}
          onClick={() => {
            void downloadClusterInstallationLogs(addAlert, cluster.id, clearAlerts);
          }}
          isDisabled={!canDownloadClusterLogs(cluster)}
        >
          Download Installation Logs
        </Button>
      </FlexItem>
    </Flex>
  );
};

export default ClusterDetailsButtonGroup;
