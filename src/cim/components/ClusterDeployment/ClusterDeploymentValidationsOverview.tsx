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
import { TFunction } from 'i18next';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

function getCardTitle(clusterStatus: Cluster['status'], t: TFunction) {
  switch (clusterStatus) {
    case 'pending-for-input':
    case 'insufficient':
      return t('ai:The cluster is not ready for installation.');
    default:
      return t('ai:Cluster configured and ready for installation.');
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

function getContinueClusterConfigurationLinkLabel(clusterStatus: Cluster['status'], t: TFunction) {
  switch (clusterStatus) {
    case 'pending-for-input':
    case 'insufficient':
      return t('ai:Continue cluster configuration');
    default:
      return t('ai:Go to cluster configuration to start the installation');
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
  const { t } = useTranslation();
  const [status] = clusterStatus;
  const title = getCardTitle(status, t);
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
            {getContinueClusterConfigurationLinkLabel(status, t)}
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
                {validations && (
                  <List>
                    {validations.map((validation) => (
                      <ListItem key={validation.id}>{validation.message}</ListItem>
                    ))}
                  </List>
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          );
        })}
      </DescriptionList>
    </Alert>
  );
};

export default ClusterDeploymentValidationsOverview;
