import React from 'react';
import ClusterConfiguration from '../clusterConfiguration/ClusterConfiguration';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import { Cluster } from '../../api/types';
import ClusterWizardContext from './ClusterWizardContext';

type ClusterWizardProps = {
  cluster: Cluster;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster }) => {
  const [currentStepId, setCurrentStepId] = React.useState('cluster-configuration');

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'baremetal-discovery':
        return <BaremetalInventory cluster={cluster} />;
      case 'cluster-configuration':
        return <ClusterConfiguration cluster={cluster} />;
      default:
        return <ClusterConfiguration cluster={cluster} />;
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
