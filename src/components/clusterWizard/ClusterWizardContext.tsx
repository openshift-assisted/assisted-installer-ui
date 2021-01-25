import React from 'react';
import { ClusterWizardStepsType, CLUSTER_WIZARD_FIRST_STEP } from './wizardTransition';

type ClusterWizardContextType = {
  currentStepId: ClusterWizardStepsType;
  setCurrentStepId: (stepId: ClusterWizardStepsType) => void;
};

const ClusterWizardContext = React.createContext<ClusterWizardContextType>({
  currentStepId: CLUSTER_WIZARD_FIRST_STEP,
  setCurrentStepId: () => {
    console.warn('Tried to use ClusterWizardContext but there was no provider rendered.');
  },
});

export default ClusterWizardContext;
