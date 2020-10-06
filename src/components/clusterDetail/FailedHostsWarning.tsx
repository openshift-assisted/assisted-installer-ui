import React from 'react';
import { GridItem, Alert, AlertVariant, TextContent, Text } from '@patternfly/react-core';
import { Cluster, Host } from '../../api/types';

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

  const failedBootOrder =
    cluster.hosts?.filter((host) => host.status === 'installing-pending-user-action') || [];

  let failedBootOrderText =
    "Please reconfigure each host's BIOS to boot from the disk where OpenShift was installed instead of the Discovery ISO.";
  if (failedBootOrder.find((host) => host.role === 'master')) {
    failedBootOrderText +=
      ' The cluster installation will time-out after 30 minutes if a master host does not reboot properly.';
  }

  return (
    <>
      <FailedHosts
        failedHosts={failedBootOrder}
        title={`${failedBootOrder.length} hosts have an incorrect boot order`}
        titleSingle="1 host has an incorrect boot order"
        text={failedBootOrderText}
      />
      <FailedHosts
        failedHosts={failedHosts}
        title={`${failedHosts.length} worker hosts failed to install`}
        titleSingle="1 worker host failed to install"
        text="Error information for each worker host is available below. Debug and reboot each host to try again."
      />
    </>
  );
};

export default FailedHostsWarning;
