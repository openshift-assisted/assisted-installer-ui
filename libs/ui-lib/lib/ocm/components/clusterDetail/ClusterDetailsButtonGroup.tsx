import { Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';
import {
  canDownloadClusterLogs,
  useAlerts,
  KubeconfigDownload,
  RenderIf,
  canOpenConsole,
} from '../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { canAbortInstallation } from '../clusters/utils';
import { onFetchEvents } from '../fetching/fetchEvents';
import ViewClusterEventsButton from '../../../common/components/ui/ViewClusterEventsButton';
import { ToolbarButton } from '../../../common/components/ui/Toolbar';
import { Cluster, Credentials } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

import './ClusterDetailsButtonGroup.css';

type ClusterDetailsButtonGroupProps = {
  cluster: Cluster;
  credentials?: Credentials;
  credentialsError: string;
  showKubeConfig?: boolean;
};

const LaunchOpenshiftConsoleButton: React.FC<{
  consoleUrl?: string;
  isDisabled: boolean;
  id?: string;
}> = ({ consoleUrl, isDisabled, id }) => {
  const { t } = useTranslation();
  return (
    <ToolbarButton
      variant={ButtonVariant.primary}
      component="a"
      href={consoleUrl}
      target="_blank"
      rel="noopener"
      isDisabled={isDisabled}
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      id={id}
      data-testid={id}
    >
      {t('ai:Launch OpenShift Console')}
    </ToolbarButton>
  );
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
