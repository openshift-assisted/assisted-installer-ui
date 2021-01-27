import React from 'react';
// import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import { Cluster } from '../../api/types';
import ClusterConfigurationForm from '../clusterConfiguration/ClusterConfigurationForm';
import NetworkConfigurationStep from '../clusterConfiguration/NetworkConfigurationStep';
import ClusterWizardContext from './ClusterWizardContext';
import { ClusterWizardStepsType, CLUSTER_WIZARD_FIRST_STEP } from './wizardTransition';

type ClusterWizardProps = {
  cluster: Cluster;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster }) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>(
    CLUSTER_WIZARD_FIRST_STEP,
  );

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      //case CLUSTER_STEP_DETAIL:
      // TODO(mlibra): use different component!!
      //  return <BaremetalInventory cluster={cluster} />;
      case 'networking':
        return <NetworkConfigurationStep cluster={cluster} />;
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
