import * as React from 'react';
import { AlertsContextProvider } from '../AlertsContextProvider';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className = '',
  onSaveDetails,
  onClose,
  cluster,
  ocpVersions,
  defaultPullSecret,
  usedClusterNames,
}) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterDeploymentWizardStepsType>(
    'cluster-details',
  );
  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'cluster-details':
      default:
        return (
          <ClusterDeploymentDetailsStep
            cluster={cluster}
            defaultPullSecret={defaultPullSecret}
            ocpVersions={ocpVersions}
            usedClusterNames={usedClusterNames}
            onSaveDetails={onSaveDetails}
            onClose={onClose}
          />
        );
    }
  }, [
    currentStepId,
    cluster,
    defaultPullSecret,
    ocpVersions,
    usedClusterNames,
    onSaveDetails,
    onClose,
  ]);

  return (
    <AlertsContextProvider>
      <ClusterDeploymentWizardContext.Provider value={{ currentStepId, setCurrentStepId }}>
        <div className={`pf-c-wizard ${className}`}>{renderCurrentStep()}</div>
      </ClusterDeploymentWizardContext.Provider>
    </AlertsContextProvider>
  );
};

export default ClusterDeploymentWizard;
