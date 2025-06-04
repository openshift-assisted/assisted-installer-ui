import React from 'react';
import {
  GridItem,
  Alert,
  AlertVariant,
  AlertActionLink,
  Content,
  } from '@patternfly/react-core';
import { getReportIssueLink, canDownloadClusterLogs, useAlerts, toSentence } from '../../../common';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

type ClusterInstallationErrorProps = {
  cluster: Cluster;
  title?: string;
};

const getID = (suffix: string) => `cluster-install-error-${suffix}`;

const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  cluster,
  title = 'Cluster installation failed',
}) => {
  const { addAlert, clearAlerts } = useAlerts();
  const { resetClusterDialog } = useModalDialogsContext();

  return (
    <GridItem>
      <Alert
        variant={AlertVariant.danger}
        title={title}
        actionLinks={
          <>
            <AlertActionLink
              onClick={() => resetClusterDialog.open({ cluster })}
              id={getID('button-reset-cluster')}
            >
              Reset Cluster
            </AlertActionLink>
            <AlertActionLink
              onClick={() => {
                void downloadClusterInstallationLogs(addAlert, cluster.id, clearAlerts);
              }}
              isDisabled={!canDownloadClusterLogs(cluster)}
              id={getID('button-download-installation-logs')}
            >
              Download Installation Logs
            </AlertActionLink>
            <AlertActionLink
              onClick={() => window.open(getReportIssueLink(), '_blank')}
              id={getID('button-report-bug')}
            >
              Report a bug
            </AlertActionLink>
          </>
        }
        isInline
      >
        <Content>
          <Content component="p">
            {toSentence(cluster.statusInfo)}
            <br />
            Reset the installation process to return to the configuration and try again. Some hosts
            may need to be re-registered by rebooting into the Discovery ISO.
          </Content>
        </Content>
      </Alert>
    </GridItem>
  );
};

export default ClusterInstallationError;
