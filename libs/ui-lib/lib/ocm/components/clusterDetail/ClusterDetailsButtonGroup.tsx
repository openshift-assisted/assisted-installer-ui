import { Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';
import {
  Cluster,
  canDownloadClusterLogs,
  useAlerts,
  KubeconfigDownload,
  RenderIf,
  Credentials,
  canOpenConsole,
} from '../../../common';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { canAbortInstallation } from '../clusters/utils';
import { onFetchEvents } from '../fetching/fetchEvents';
import ViewClusterEventsButton from '../../../common/components/ui/ViewClusterEventsButton';
import { LaunchOpenshiftConsoleButton } from '../../../common/components/clusterDetail/ConsoleModal';

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
  const { addAlert } = useAlerts();
  const { cancelInstallationDialog, resetClusterDialog } = useModalDialogsContext();
  const hasConsoleUrlAndNoError = credentials?.consoleUrl !== undefined && !credentialsError;

  return (
    <Flex
      className="assisted-ui-vertical-margin"
      spaceItems={{ default: 'spaceItemsSm' }}
      direction={{ default: 'row' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
    >
      <FlexItem>
        <RenderIf condition={cluster.status === 'error'}>
          <Button
            id={getID('button-reset-cluster')}
            variant={ButtonVariant.primary}
            onClick={() => resetClusterDialog.open({ cluster })}
          >
            Reset Cluster
          </Button>
        </RenderIf>
        <RenderIf
          condition={showKubeConfig && hasConsoleUrlAndNoError && canOpenConsole(cluster.status)}
        >
          <LaunchOpenshiftConsoleButton
            isDisabled={false}
            cluster={cluster}
            consoleUrl={credentials?.consoleUrl}
            id={getID('button-launch-console')}
          />
        </RenderIf>
        <RenderIf condition={canAbortInstallation(cluster) && !canOpenConsole(cluster.status)}>
          <Button
            data-testid="cluster-installation-abort-button"
            variant={ButtonVariant.danger}
            onClick={() => cancelInstallationDialog.open({ clusterId: cluster.id })}
            isDisabled={false}
          >
            Abort Installation
          </Button>
        </RenderIf>
      </FlexItem>
      <FlexItem>
        <KubeconfigDownload
          status={cluster.status}
          clusterId={cluster.id}
          data-testid={getID('button-download-kubeconfig')}
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
            void downloadClusterInstallationLogs(addAlert, cluster.id);
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
