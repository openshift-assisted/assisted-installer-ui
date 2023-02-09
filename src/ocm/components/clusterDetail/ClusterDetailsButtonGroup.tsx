import React from 'react';
import { Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';

import { Cluster, canDownloadClusterLogs, useAlerts, KubeconfigDownload } from '../../../common';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { canAbortInstallation } from '../clusters/utils';
import { onFetchEvents } from '../fetching/fetchEvents';
import ViewClusterEventsButton from '../../../common/components/ui/ViewClusterEventsButton';
import { getApiErrorMessage, handleApiError } from '../../api';
import { ClustersService } from '../../services';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const getID = (suffix: string) => `cluster-detail-${suffix}`;

const ClusterDetailsButtonGroup = ({ cluster }: { cluster: Cluster }) => {
  const { addAlert } = useAlerts();
  const { t } = useTranslation();
  const { cancelInstallationDialog } = useModalDialogsContext();

  const handleKubeconfigDownload = React.useCallback(() => {
    try {
      void ClustersService.downloadKubeconfigFile(cluster.id);
    } catch (e) {
      handleApiError(e, (e) => {
        addAlert({
          title: t('ai:Could not download kubeconfig'),
          message: getApiErrorMessage(e),
        });
      });
    }
  }, [addAlert, cluster.id, t]);

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
          handleDownload={handleKubeconfigDownload}
          status={cluster.status}
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
