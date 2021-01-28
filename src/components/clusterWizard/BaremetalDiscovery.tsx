import React from 'react';
import { Cluster } from '../../api/types';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import ClusterWizardContext from './ClusterWizardContext';
import ClusterWizardStep from './ClusterWizardStep';
import ClusterWizardToolbar from './ClusterWizardToolbar';
import { canNextBaremetalDiscovery } from './wizardTransition';

const BaremetalDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);

  const footer = (
    <ClusterWizardToolbar
      cluster={cluster}
      errors={{}}
      dirty={false}
      isSubmitting={false}
      isNextDisabled={!canNextBaremetalDiscovery({ cluster })}
      onNext={() => setCurrentStepId('networking')}
      onBack={() => setCurrentStepId('cluster-details')}
    />
  );

  return (
    <ClusterWizardStep footer={footer}>
      <BaremetalInventory cluster={cluster} />;
    </ClusterWizardStep>
  );
};

export default BaremetalDiscovery;
