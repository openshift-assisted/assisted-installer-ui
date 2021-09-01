import React from 'react';
import { GridItem, Alert, AlertVariant, TextContent, Text } from '@patternfly/react-core';
import { Cluster, Host } from '../../../common';

type FailedHostsWarningProps = {
  cluster: Cluster;
};

type FailedHostsProps = {
  failedHosts: Host[];
  title: string;
  titleSingle: string;
  text: string;
};

const FailedHosts: React.FC<FailedHostsProps> = ({ failedHosts, title, titleSingle, text }) => {
  if (failedHosts.length === 0) {
    return null;
  }

  return (
    <GridItem>
      <Alert
        variant={AlertVariant.warning}
        title={failedHosts.length === 1 ? titleSingle : title}
        isInline
      >
        <TextContent>
          <Text component="p">{text}</Text>
        </TextContent>
      </Alert>
    </GridItem>
  );
};

const FailedHostsWarning: React.FC<FailedHostsWarningProps> = ({ cluster }) => {
  const failedHosts =
    cluster.hosts?.filter((host) => host.role === 'worker' && host.status === 'error') || [];

  const hostsPendingUserAction =
    cluster.hosts?.filter((host) => host.status === 'installing-pending-user-action') || [];

  let failedHostsText = 'Error information for each host is available below.';
  if (cluster.status !== 'finalizing') {
    failedHostsText += ' Debug and reboot each failed worker to retry their installation.';
  }

  return (
    <>
      <FailedHosts
        failedHosts={hostsPendingUserAction}
        title={`${hostsPendingUserAction.length} are waiting for user action`}
        titleSingle="1 host is waiting for user action"
        text={cluster.statusInfo}
      />
      <FailedHosts
        failedHosts={failedHosts}
        title={`${failedHosts.length} worker hosts failed to install`}
        titleSingle="1 worker host failed to install"
        text={failedHostsText}
      />
    </>
  );
};

export default FailedHostsWarning;
