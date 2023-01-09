import React from 'react';
import { ClusterDeploymentK8sResource } from '../../types';
import { ClusterDeploymentWizardStepsType } from './types';

type ClusterDeploymentWizardContextType = {
  currentStepId: ClusterDeploymentWizardStepsType;
  setCurrentStepId: (stepId: ClusterDeploymentWizardStepsType) => void;
  clusterDeployment?: ClusterDeploymentK8sResource;
};

const ClusterDeploymentWizardContext = React.createContext<ClusterDeploymentWizardContextType>({
  currentStepId: 'cluster-details',
  setCurrentStepId: () => {
    console.error(
      'Tried to use ClusterDeploymentWizardContext but there was no provider rendered.',
    );
  },
});

export default ClusterDeploymentWizardContext;
