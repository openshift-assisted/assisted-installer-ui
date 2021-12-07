import React from 'react';
import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  List,
  ListItem,
} from '@patternfly/react-core';
import { Cluster } from '../../../common/api/types';
import { ValidationsInfo } from '../../../common/types/clusters';
import { CLUSTER_VALIDATION_GROUP_LABELS } from '../../../common/config/constants';
import { filterValidationsInfoByStatus } from '../../../common/components/clusterConfiguration/utils';

function getCardTitle(clusterStatus: Cluster['status']) {
  switch (clusterStatus) {
    case 'pending-for-input':
    case 'insufficient':
      return 'The cluster is not ready for installation. Validations are failing.';
    default:
      return 'Cluster configured and ready for installation.';
  }
}

function getAlertVariant(clusterStatus: Cluster['status']) {
  switch (clusterStatus) {
    case 'pending-for-input':
    case 'insufficient':
      return AlertVariant.danger;
    default:
      return AlertVariant.success;
  }
}

function getContinueClusterConfigurationLinkLabel(clusterStatus: Cluster['status']) {
  switch (clusterStatus) {
    case 'pending-for-input':
    case 'insufficient':
      return 'Continue cluster configuration';
    default:
      return 'Go to cluster configuration to start the installation';
  }
}

type ClusterDeploymentValidationsOverviewProps = {
  validationsInfo: ValidationsInfo;
  clusterStatus: [Cluster['status'], Cluster['statusInfo']];
  onContinueClusterConfiguration: () => void;
};

const ClusterDeploymentValidationsOverview = ({
  validationsInfo,
  clusterStatus,
  onContinueClusterConfiguration,
}: ClusterDeploymentValidationsOverviewProps) => {
  const [status] = clusterStatus;
  const title = getCardTitle(status);
  const filteredValidationsInfo = filterValidationsInfoByStatus(validationsInfo);
  return (
    <Alert
      isExpandable={['pending-for-input', 'insufficient'].includes(status)}
      isInline
      variant={getAlertVariant(status)}
      title={title}
      actionLinks={
        <>
          <AlertActionLink onClick={onContinueClusterConfiguration}>
            {getContinueClusterConfigurationLinkLabel(status)}
          </AlertActionLink>
        </>
      }
    >
      <DescriptionList>
        {Object.entries(filteredValidationsInfo).map(([group, validations]) => {
          return (
            <DescriptionListGroup key={group}>
              <DescriptionListTerm>{CLUSTER_VALIDATION_GROUP_LABELS[group]}</DescriptionListTerm>
              <DescriptionListDescription>
                <List>
                  {validations.map((validation) => (
                    <ListItem key={validation.id}>{validation.message}</ListItem>
                  ))}
                </List>
              </DescriptionListDescription>
            </DescriptionListGroup>
          );
        })}
      </DescriptionList>
    </Alert>
  );
};

export default ClusterDeploymentValidationsOverview;
