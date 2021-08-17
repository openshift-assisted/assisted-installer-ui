import * as React from 'react';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import { AlertsContextProvider } from '../../../common';
import ClusterDeploymentHostSelectionStep from './ClusterDeploymentHostSelectionStep';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className = '',
  onSaveDetails,
  onSaveNetworking,
  onSaveHostsSelection,
  onClose,
  hostActions,
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
  clusterImages,
  defaultPullSecret,
  usedClusterNames,
  usedAgentLabels,
  agentLocations,
  matchingAgents,
  allAgentsCount,
  selectedHostIds,
  onAgentSelectorChange,
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
        return (
          <ClusterDeploymentHostSelectionStep
            clusterDeployment={clusterDeployment}
            selectedHostIds={selectedHostIds}
            // agentClusterInstall={agentClusterInstall}
            // agents={agents}
            onClose={onClose}
            onSaveHostsSelection={onSaveHostsSelection}
            usedAgentLabels={usedAgentLabels}
            agentLocations={agentLocations}
            matchingAgents={matchingAgents}
            allAgentsCount={allAgentsCount}
            onAgentSelectorChange={onAgentSelectorChange}
            hostActions={hostActions}
          />
        );
      case 'networking':
        return (
          <ClusterDeploymentNetworkingStep
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            pullSecretSet={pullSecretSet}
            onSaveNetworking={onSaveNetworking}
            onClose={onClose}
            hostActions={hostActions}
            // TODO(mlibra) Add more networking-table actions here
          />
        );
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
    onSaveHostsSelection,
    onClose,
    matchingAgents,
    hostActions,
    onAgentSelectorChange,
    usedAgentLabels,
    agentLocations,
    allAgentsCount,
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
