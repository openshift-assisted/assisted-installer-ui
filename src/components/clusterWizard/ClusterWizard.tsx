import React from 'react';
// import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import { Cluster } from '../../api/types';
import ClusterConfigurationForm from '../clusterConfiguration/ClusterConfigurationForm';
import NetworkConfigurationStep from '../clusterConfiguration/NetworkConfigurationStep';
import ClusterWizardContext from './ClusterWizardContext';
import {
  CLUSTER_STEP_CONFIGURATION,
  // CLUSTER_STEP_DETAIL,
  CLUSTER_STEP_NETWORKING,
} from './constants';

type ClusterWizardProps = {
  cluster: Cluster;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster }) => {
  const [currentStepId, setCurrentStepId] = React.useState('cluster-configuration');

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      //case CLUSTER_STEP_DETAIL:
      // TODO(mlibra): use different component!!
      //  return <BaremetalInventory cluster={cluster} />;
      case CLUSTER_STEP_NETWORKING:
        return <NetworkConfigurationStep cluster={cluster} />;
      case CLUSTER_STEP_CONFIGURATION:
      default:
        return <ClusterConfigurationForm cluster={cluster} />;
    }
  }, [currentStepId, cluster]);

  return (
    <>
      <ClusterWizardContext.Provider value={{ currentStepId, setCurrentStepId }}>
        <div className="pf-c-wizard">{renderCurrentStep()}</div>
      </ClusterWizardContext.Provider>
    </>
  );
};

export default ClusterWizard;
