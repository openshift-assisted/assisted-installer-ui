import * as React from 'react';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import { AlertsContextProvider, LoadingState } from '../../../common';
import ClusterDeploymentHostSelectionStep from './ClusterDeploymentHostSelectionStep';
import classNames from 'classnames';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className,
  onSaveDetails,
  onSaveNetworking,
  onSaveHostsSelection,
  onClose,
  hostActions,
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  usedClusterNames,
  onFinish,
  aiConfigMap,
}) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterDeploymentWizardStepsType>(
    'cluster-details',
  );

  const renderCurrentStep = React.useCallback(() => {
    const stepId: ClusterDeploymentWizardStepsType = !clusterDeployment
      ? 'cluster-details'
      : currentStepId;

    switch (stepId) {
      case 'hosts-selection':
        return agentClusterInstall?.metadata?.name ? (
          <ClusterDeploymentHostSelectionStep
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            onClose={onClose}
            onSaveHostsSelection={onSaveHostsSelection}
            agents={agents}
            aiConfigMap={aiConfigMap}
          />
        ) : (
          <LoadingState />
        );
      case 'networking':
        return (
          <ClusterDeploymentNetworkingStep
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            onSaveNetworking={onSaveNetworking}
            onClose={onClose}
            hostActions={hostActions}
            onFinish={onFinish}
          />
        );
      case 'cluster-details':
      default:
        return (
          <ClusterDeploymentDetailsStep
            clusterImages={clusterImages}
            usedClusterNames={usedClusterNames}
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
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
    clusterImages,
    usedClusterNames,
    onSaveDetails,
    onSaveNetworking,
    onSaveHostsSelection,
    onClose,
    hostActions,
    onFinish,
    aiConfigMap,
  ]);

  return (
    <AlertsContextProvider>
      <ClusterDeploymentWizardContext.Provider value={{ currentStepId, setCurrentStepId }}>
        <div className={classNames('pf-c-wizard', className)}>{renderCurrentStep()}</div>
      </ClusterDeploymentWizardContext.Provider>
    </AlertsContextProvider>
  );
};

export default ClusterDeploymentWizard;
