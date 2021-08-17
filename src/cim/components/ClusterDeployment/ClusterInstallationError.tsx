import React from 'react';
import { saveAs } from 'file-saver';
import { GridItem, Alert, AlertVariant, AlertActionLink } from '@patternfly/react-core';
import { toSentence } from '../../../common/components/ui/table/utils';
import { getBugzillaLink } from '../../../common/config';

type ClusterInstallationErrorProps = {
  statusInfo: string;
  openshiftVersion?: string;
  logsUrl?: string;
  title?: string;
};

const getID = (suffix: string) => `cluster-install-error-${suffix}`;

const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  logsUrl,
  statusInfo,
  openshiftVersion = '4.8',
  title = 'Cluster installation failed',
}) => (
  <GridItem>
    <Alert
      variant={AlertVariant.danger}
      title={title}
      actionLinks={
        <>
          <AlertActionLink
            onClick={() => logsUrl && saveAs(logsUrl)}
            isDisabled={!logsUrl}
            id={getID('button-download-installation-logs')}
          >
            Download Installation Logs
          </AlertActionLink>
          <AlertActionLink
            onClick={() => window.open(getBugzillaLink(openshiftVersion), '_blank')}
            id={getID('button-report-bug')}
          >
            Report a bug
          </AlertActionLink>
        </>
      }
      isInline
    >
      {toSentence(statusInfo)}
    </Alert>
  </GridItem>
);

export default ClusterInstallationError;
