import React from 'react';
import { CLUSTER_STEPS_INDEXED } from './constants';

type ClusterWizardContextType = {
  currentStepId: string;
  setCurrentStepId: (stepId: string) => void;
};

const ClusterWizardContext = React.createContext<ClusterWizardContextType>({
  currentStepId: CLUSTER_STEPS_INDEXED[0],
  setCurrentStepId: () => {
    console.warn('Tried to use ClusterWizardContext but there was no provider rendered.');
  },
});

export default ClusterWizardContext;
