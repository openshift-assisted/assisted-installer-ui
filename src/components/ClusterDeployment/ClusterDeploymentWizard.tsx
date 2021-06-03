import * as React from 'react';
import { AlertsContextProvider } from '../AlertsContextProvider';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentDetails from './ClusterDeploymentDetails';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className = '',
  ...rest
}) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterDeploymentWizardStepsType>(
    'cluster-details',
  );

  const moveNext = () => setCurrentStepId('todo-next-wizard-step-id');
  const navigation = (
    <ClusterDeploymentWizardNavigation
      currentStepId={currentStepId}
      setCurrentStepId={setCurrentStepId}
    />
  );

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case 'cluster-details':
      default:
        return <ClusterDeploymentDetails moveNext={moveNext} navigation={navigation} {...rest} />;
    }
  };

  return (
    <AlertsContextProvider>
      <div className={`pf-c-wizard ${className}`}>{renderCurrentStep()}</div>;
    </AlertsContextProvider>
  );
};

export default ClusterDeploymentWizard;
