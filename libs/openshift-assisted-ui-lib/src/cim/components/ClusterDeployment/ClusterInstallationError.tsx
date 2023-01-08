import React from 'react';
import { GridItem, Alert, AlertVariant, AlertActionLink } from '@patternfly/react-core';
import { toSentence } from '../../../common/components/ui/table/utils';
import { getReportIssueLink } from '../../../common/config';
import { AgentClusterInstallK8sResource } from '../../types';
import { getClusterStatus } from '../helpers';
import { LogsDownloadButton } from './LogsDownloadButton';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ClusterInstallationErrorProps = {
  agentClusterInstall?: AgentClusterInstallK8sResource;
};

const getID = (suffix: string) => `cluster-install-error-${suffix}`;

const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  agentClusterInstall,
}) => {
  const [clusterStatus, statusInfo] = getClusterStatus(agentClusterInstall);
  const { t } = useTranslation();
  const title =
    clusterStatus === 'cancelled'
      ? t('ai:Cluster installation was cancelled')
      : t('ai:Cluster installation failed');

  return (
    <GridItem>
      <Alert
        variant={AlertVariant.danger}
        title={title}
        actionLinks={
          <>
            <LogsDownloadButton
              id={getID('button-download-installation-logs')}
              Component={AlertActionLink}
              agentClusterInstall={agentClusterInstall}
            />
            <AlertActionLink
              onClick={() => window.open(getReportIssueLink(), '_blank')}
              id={getID('button-report-bug')}
            >
              {t('ai:Report a bug')}
            </AlertActionLink>
          </>
        }
        isInline
      >
        {toSentence(statusInfo)}
      </Alert>
    </GridItem>
  );
};

export default ClusterInstallationError;
