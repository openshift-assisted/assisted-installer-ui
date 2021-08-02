import * as React from 'react';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import { AlertsContextProvider } from '../../../common';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className = '',
  onSaveDetails,
  onSaveNetworking,
  onClose,
  onEditHost,
  canEditHost,
  onEditRole,
  canEditRole,
  onDeleteHost,
  canDelete,
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
  clusterImages,
  defaultPullSecret,
  usedClusterNames,
}) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterDeploymentWizardStepsType>(
    'cluster-details',
  );
  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'networking':
        if (clusterDeployment && agentClusterInstall) {
          return (
            <ClusterDeploymentNetworkingStep
              clusterDeployment={clusterDeployment}
              agentClusterInstall={agentClusterInstall}
              agents={agents}
              pullSecretSet={pullSecretSet}
              onSaveNetworking={onSaveNetworking}
              onClose={onClose}
              onEditHost={onEditHost}
              canEditHost={canEditHost}
              onEditRole={onEditRole}
              canEditRole={canEditRole}
              onDeleteHost={onDeleteHost}
              canDelete={canDelete}
              // TODO(mlibra) Add more networking-table actions here
            />
          );
        }

        console.log(`Missing the AI Cluster object for the ${currentStepId} step, waiting ...`);
      // falls through to default
      case 'cluster-details':
      default:
        return (
          <ClusterDeploymentDetailsStep
            defaultPullSecret={defaultPullSecret}
            clusterImages={clusterImages}
            usedClusterNames={usedClusterNames}
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            pullSecretSet={pullSecretSet}
            onSaveDetails={onSaveDetails}
            onClose={onClose}
          />
        );
    }
  }, [
    currentStepId,
    clusterDeployment,
    agentClusterInstall,
    agents,
    pullSecretSet,
    defaultPullSecret,
    clusterImages,
    usedClusterNames,
    onSaveDetails,
    onSaveNetworking,
    onClose,
    onEditHost,
    canEditHost,
    onEditRole,
    canEditRole,
    onDeleteHost,
    canDelete,
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
