import React from 'react';
import { saveAs } from 'file-saver';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { AgentClusterInstallK8sResource } from '../../types';

type LogsDownloadButtonProps = {
  id: string;
  Component?: React.FC;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  variant?: ButtonVariant;
};

export const LogsDownloadButton: React.FC<LogsDownloadButtonProps> = ({
  Component = Button,
  agentClusterInstall,
  id,
  variant,
}) => {
  const logsURL = agentClusterInstall?.status?.debugInfo?.logsURL;

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
