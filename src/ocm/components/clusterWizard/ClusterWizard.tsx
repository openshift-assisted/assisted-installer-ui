import React from 'react';
import { Cluster } from '../../../common';
import NetworkConfigurationForm from '../clusterConfiguration/NetworkConfigurationForm';
import ReviewStep from '../clusterConfiguration/ReviewStep';
import ClusterWizardContext from './ClusterWizardContext';
import { ClusterWizardStepsType, getClusterWizardFirstStep } from './wizardTransition';
import ClusterDetails from './ClusterDetails';
import HostDiscovery from './HostDiscovery';

type ClusterWizardProps = {
  cluster: Cluster;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster }) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>(() =>
    getClusterWizardFirstStep(cluster.status as Cluster['status']),
  );

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'host-discovery':
        return <HostDiscovery cluster={cluster} />;
      case 'networking':
        return <NetworkConfigurationForm cluster={cluster} />;
      case 'review':
        return <ReviewStep cluster={cluster} />;
      case 'cluster-details':
      default:
        return <ClusterDetails cluster={cluster} />;
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
