import React from 'react';
import { Cluster } from '../../api/types';
import ClusterConfigurationForm from '../clusterConfiguration/ClusterConfigurationForm';
import NetworkConfigurationForm from '../clusterConfiguration/NetworkConfigurationForm';
import ReviewStep from '../clusterConfiguration/ReviewStep';
import ClusterWizardContext from './ClusterWizardContext';
import { ClusterWizardStepsType, CLUSTER_WIZARD_FIRST_STEP } from './wizardTransition';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import ClusterDetails from './ClusterDetails';

type ClusterWizardProps = {
  cluster: Cluster;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster }) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>(
    CLUSTER_WIZARD_FIRST_STEP,
  );

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'cluster-details':
        return <ClusterDetails cluster={cluster} />;
      case 'baremetal-discovery':
        return <BaremetalInventory cluster={cluster} />;
      case 'networking':
        return <NetworkConfigurationForm cluster={cluster} />;
      case 'review':
        return <ReviewStep cluster={cluster} />;
      case 'cluster-configuration':
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
