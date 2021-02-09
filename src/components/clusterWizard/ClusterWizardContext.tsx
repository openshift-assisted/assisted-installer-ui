import React from 'react';
import { ClusterWizardStepsType, getClusterWizardFirstStep } from './wizardTransition';

type ClusterWizardContextType = {
  currentStepId: ClusterWizardStepsType;
  setCurrentStepId: (stepId: ClusterWizardStepsType) => void;
};

const ClusterWizardContext = React.createContext<ClusterWizardContextType>({
  currentStepId: getClusterWizardFirstStep(),
  setCurrentStepId: () => {
    console.warn('Tried to use ClusterWizardContext but there was no provider rendered.');
  },
});

export default ClusterWizardContext;
