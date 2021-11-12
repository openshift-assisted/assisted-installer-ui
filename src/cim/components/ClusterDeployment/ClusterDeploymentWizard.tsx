import * as React from 'react';
import classNames from 'classnames';

import { AlertsContextProvider, LoadingState } from '../../../common';

import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import ClusterDeploymentHostSelectionStep from './ClusterDeploymentHostSelectionStep';
import { isCIMFlow, getAgentsHostsNames } from './helpers';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentHostsDiscoveryStep from './ClusterDeploymentHostsDiscoveryStep';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className,
  onSaveDetails,
  onSaveNetworking,
  onSaveHostsSelection,
  onClose,
  onFinish,
  onDeleteHost,
  canDeleteAgent,
  onSaveAgent,
  onSaveBMH,
  onSaveISOParams,
  hostActions,
  usedClusterNames,
  isBMPlatform,
  getClusterDeploymentLink,
  fetchSecret,
  fetchNMState,
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  aiConfigMap,
  infraEnv,
}) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterDeploymentWizardStepsType>(
    'cluster-details',
  );
  const usedHostnames = React.useMemo(() => getAgentsHostsNames(agents), [agents]);

  const renderCurrentStep = React.useCallback(() => {
    const stepId: ClusterDeploymentWizardStepsType = !clusterDeployment
      ? 'cluster-details'
      : currentStepId;

    switch (stepId) {
      case 'hosts-selection':
        if (agentClusterInstall?.metadata?.name) {
          if (isCIMFlow(clusterDeployment)) {
            return (
              <ClusterDeploymentHostSelectionStep
                clusterDeployment={clusterDeployment}
                agentClusterInstall={agentClusterInstall}
                onClose={onClose}
                onSaveHostsSelection={onSaveHostsSelection}
                agents={agents}
                aiConfigMap={aiConfigMap}
              />
            );
          } else {
            if (infraEnv) {
              return (
                <ClusterDeploymentHostsDiscoveryStep
                  clusterDeployment={clusterDeployment}
                  agentClusterInstall={agentClusterInstall}
                  agents={agents}
                  bareMetalHosts={[] /* TODO(mlibra) */}
                  aiConfigMap={aiConfigMap}
                  infraEnv={infraEnv}
                  usedHostnames={usedHostnames}
                  onDeleteHost={onDeleteHost}
                  canDeleteAgent={canDeleteAgent}
                  onSaveAgent={onSaveAgent}
                  onSaveBMH={onSaveBMH}
                  fetchSecret={fetchSecret}
                  fetchNMState={fetchNMState}
                  getClusterDeploymentLink={getClusterDeploymentLink}
                  onClose={onClose}
                  isBMPlatform={isBMPlatform}
                  onSaveISOParams={onSaveISOParams}
                  // onCreateBMH={undefined /* So far no Day 2 */}
                  // onSaveHostsDiscovery={undefined}
                  // onFormSaveError={setErrorHandler}
                />
              );
            }
            // fall-through to LoadingState
          }
        }
        return <LoadingState />;
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
    clusterDeployment,
    currentStepId,
    agentClusterInstall,
    agents,
    onSaveNetworking,
    onClose,
    hostActions,
    onFinish,
    clusterImages,
    usedClusterNames,
    onSaveDetails,
    onSaveHostsSelection,
    aiConfigMap,
    infraEnv,
    usedHostnames,
    onDeleteHost,
    canDeleteAgent,
    onSaveAgent,
    onSaveBMH,
    fetchSecret,
    fetchNMState,
    getClusterDeploymentLink,
    isBMPlatform,
    onSaveISOParams,
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
