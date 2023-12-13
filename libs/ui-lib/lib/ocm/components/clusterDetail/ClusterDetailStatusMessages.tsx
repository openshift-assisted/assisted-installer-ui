import React from 'react';
import { Alert } from '@patternfly/react-core';
import {
  RenderIf,
  REDHAT_CONSOLE_OPENSHIFT,
  canDownloadKubeconfig,
  isSNO,
  isClusterPlatformTypeVM,
} from '../../../common';

import { useDefaultConfiguration } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { calculateClusterDateDiff } from '../../../common/services/DateAndTime';
import { isInOcm } from '../../../common/api';
import { ExternalPlatformLinks } from '../clusterConfiguration/platformIntegration/constants';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import { Cluster, PlatformType } from '@openshift-assisted/types/assisted-installer-service';
import PostInstallAlert from '../../../common/components/clusterDetail/PostInstallAlert';

type ClusterDetailStatusMessagesProps = {
  cluster: Cluster;
  showAddHostsInfo: boolean;
};

const ClusterDetailStatusMessages = ({
  cluster,
  showAddHostsInfo,
}: ClusterDetailStatusMessagesProps) => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const { inactiveDeletionHours } = useDefaultConfiguration(['inactiveDeletionHours']);
  const inactiveDeletionDays = Math.round((inactiveDeletionHours || 0) / 24);
  const dateDifference = calculateClusterDateDiff(inactiveDeletionDays, cluster.installCompletedAt);
  const showAddHostsAlert = Boolean(
    showAddHostsInfo &&
      isInOcm &&
      cluster.status === 'installed' &&
      (!isSNO(cluster) || featureSupportLevelContext.isFeatureSupported('SINGLE_NODE_EXPANSION')),
  );

  const platformLink = isClusterPlatformTypeVM(cluster)
    ? ExternalPlatformLinks[cluster.platform?.type as PlatformType]
    : '';

  return (
    <>
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
      <RenderIf condition={showAddHostsAlert}>
        <Alert
          variant="info"
          isInline
          data-testid="alert-add-hosts"
          title={
            <p>
              {isClusterPlatformTypeVM(cluster)
                ? 'Add new hosts by using the platform auto-scale feature or manually generating a new Discovery ISO under the "Add hosts" tab on '
                : 'Add new hosts by generating a new Discovery ISO under your cluster\'s "Add hosts" tab on '}
              <a href={REDHAT_CONSOLE_OPENSHIFT} target="_blank" rel="noopener noreferrer">
                console.redhat.com/openshift <ExternalLinkAltIcon />
              </a>
              .
            </p>
          }
        />
      </RenderIf>
      {platformLink && <PostInstallAlert link={platformLink} />}
    </>
  );
};

export default ClusterDetailStatusMessages;
