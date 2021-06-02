import React from 'react';
import { WizardNav } from '@patternfly/react-core';
import WizardNavItem from '../ui/WizardNavItem';
import { ClusterDeploymentWizardStepsType } from './types';

type ClusterDeploymentWizardNavigationProps = {
  currentStepId: ClusterDeploymentWizardStepsType;
  setCurrentStepId: (nextStep: ClusterDeploymentWizardStepsType) => void;
};

export const wizardStepNames: {
  [key in ClusterDeploymentWizardStepsType]: string;
} = {
  'cluster-details': 'Cluster Details',
  'todo-next-wizard-step-id': 'Nobody Can See That',
};

const ClusterDeploymentWizardNavigation: React.FC<ClusterDeploymentWizardNavigationProps> = ({
  currentStepId,
  setCurrentStepId,
}) => {
  return (
    <WizardNav>
      <WizardNavItem
        key="cluster-details"
        content={wizardStepNames['cluster-details']}
        isCurrent={currentStepId === 'cluster-details'}
        isValid={() => true}
        isDisabled={false}
        step={0}
        onNavItemClick={() => setCurrentStepId('cluster-details')}
      />
    </WizardNav>
  );
};

export default ClusterDeploymentWizardNavigation;
