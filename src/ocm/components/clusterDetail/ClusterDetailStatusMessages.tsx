import React from 'react';
import { Alert, GridItem } from '@patternfly/react-core';
import {
  RenderIf,
  KubeconfigDownload,
  REDHAT_CONSOLE_OPENSHIFT,
  canDownloadKubeconfig,
} from '../../../common';
import { Cluster } from '../../../common/api/types';
import { getClusterDetailId } from './utils';

import { useDefaultConfiguration } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import { VSPHERE_CONFIG_LINK } from '../../../common/config/constants';
import { isSNO } from '../../../common/selectors/clusterSelectors';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { calculateClusterDateDiff } from '../../../common/sevices/DateAndTime';

type ClusterDetailStatusMessagesProps = {
  cluster: Cluster;
};

const ClusterDetailStatusMessages: React.FC<ClusterDetailStatusMessagesProps> = ({ cluster }) => {
  const { inactiveDeletionHours } = useDefaultConfiguration(['inactiveDeletionHours']);
  const inactiveDeletionDays = Math.round((inactiveDeletionHours || 0) / 24);
  const dateDifference = calculateClusterDateDiff(inactiveDeletionDays, cluster.installCompletedAt);

  return (
    <>
      <RenderIf condition={dateDifference > 0 && canDownloadKubeconfig(cluster.status)}>
        <GridItem>
          <KubeconfigDownload
            status={cluster.status}
            clusterId={cluster.id}
            id={getClusterDetailId('button-download-kubeconfig')}
          />
        </GridItem>
      </RenderIf>
      <RenderIf
        condition={
          typeof inactiveDeletionHours === 'number' && canDownloadKubeconfig(cluster.status)
        }
      >
        <Alert
          variant="info"
          isInline
          title={
            dateDifference > 0
              ? `Download and save your kubeconfig file in a safe place. This file will be automatically ` +
                `deleted from Assisted Installer's service in ${dateDifference} days.`
              : `Kubeconfig file was automatically deleted ${inactiveDeletionDays} days after installation.`
          }
        />
      </RenderIf>
      <RenderIf condition={cluster.status === 'installed' && !isSNO(cluster)}>
        <Alert
          variant="info"
          isInline
          title={
            <p>
              Add new hosts by generating a new Discovery ISO under your cluster's "Add hosts” tab
              on{' '}
              <a href={REDHAT_CONSOLE_OPENSHIFT} target="_blank" rel="noopener noreferrer">
                console.redhat.com/openshift <ExternalLinkAltIcon />
              </a>
              .
            </p>
          }
        />
      </RenderIf>
      <RenderIf condition={cluster.platform?.type !== 'baremetal'}>
        <Alert
          variant="warning"
          isInline
          title={
            <p>
              Modify your platform configuration to access your platform's features directly in
              OpenShift.{' '}
              <a href={VSPHERE_CONFIG_LINK} target="_blank" rel="noopener noreferrer">
                Learn more about configuration <i className="fas fa-external-link-alt" />
              </a>
            </p>
          }
        />
      </RenderIf>
    </>
  );
};

export default ClusterDetailStatusMessages;
