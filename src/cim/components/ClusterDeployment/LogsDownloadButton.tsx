import React from 'react';
import { saveAs } from 'file-saver';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { AgentClusterInstallK8sResource } from '../../types';
import { getLogsURL } from './helpers';

type LogsDownloadButtonProps = {
  id: string;
  backendURL: string;
  Component?: React.FC;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  variant?: ButtonVariant;
};

export const LogsDownloadButton: React.FC<LogsDownloadButtonProps> = ({
  Component = Button,
  backendURL,
  agentClusterInstall,
  id,
  variant,
}) => {
  const logsURL = getLogsURL(backendURL, agentClusterInstall);

  return (
    <Component
      onClick={() => logsURL && saveAs(logsURL, 'logs.tar')}
      isDisabled={!logsURL}
      id={id}
      variant={variant}
    >
      Download Installation Logs
    </Component>
  );
};
