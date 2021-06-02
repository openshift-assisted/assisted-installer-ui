import React from 'react';
import { ClusterCreateParams, ManagedDomain } from '../../api';
import { useAlerts } from '../AlertsContextProvider';
import { ClusterDetailsForm } from '../clusterWizard';
import { ClusterDeploymentDetailsProps } from './types';

const ClusterDeploymentDetails: React.FC<
  ClusterDeploymentDetailsProps & {
    moveNext: () => void;
    navigation: React.ReactNode;
  }
> = ({ moveNext, navigation, onClusterCreate, pullSecret, ocpVersions, usedClusterNames }) => {
  const { addAlert, clearAlerts } = useAlerts();

  const manageDomains: ManagedDomain[] = []; // not supported

  const handleClusterCreate = async (params: ClusterCreateParams) => {
    clearAlerts();

    try {
      await onClusterCreate(params);
      moveNext();
    } catch (e) {
      addAlert({ title: 'Failed to create new Cluster Deployment', message: e });
    }
  };

  const handleClusterUpdate = async () => {
    console.log('Cluster details update flow is recently not supported');
  };

  return (
    <ClusterDetailsForm
      cluster={undefined /* We recently support the Create-flow only (not Edit) */}
      pullSecret={pullSecret}
      managedDomains={manageDomains}
      versions={ocpVersions}
      usedClusterNames={usedClusterNames}
      moveNext={moveNext}
      handleClusterCreate={handleClusterCreate}
      handleClusterUpdate={handleClusterUpdate}
      navigation={navigation}
    />
  );
};

export default ClusterDeploymentDetails;
