import React from 'react';

type ClusterWizardContextType = {
  currentStepId: string;
  setCurrentStepId: (stepId: string) => void;
};

const ClusterWizardContext = React.createContext<ClusterWizardContextType>({
  currentStepId: 'baremetal-discovery',
  setCurrentStepId: () => {
    console.warn('Tried to use ClusterWizardContext but there was no provider rendered');
  },
});

export default ClusterWizardContext;
