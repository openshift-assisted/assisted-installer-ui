import * as React from 'react';
import classNames from 'classnames';

import { AlertsContextProvider, LoadingState } from '../../../common';
import { isAIFlowInfraEnv } from '../helpers';
import { InfraEnvK8sResource } from '../../types';

import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import ClusterDeploymentHostSelectionStep from './ClusterDeploymentHostSelectionStep';
import { getAgentsHostsNames, isAgentOfCluster, isAgentOfInfraEnv } from './helpers';
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
  canEditHost,
  onSaveBMH,
  onSaveISOParams,
  onSaveHostsDiscovery,
  onCreateBMH,
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

  const isAIFlow = isAIFlowInfraEnv(infraEnv);

  const cdName = clusterDeployment.metadata?.name;
  const cdNamespace = clusterDeployment.metadata?.namespace;

  const clusterAgents = React.useMemo(
    () =>
      agents.filter(
        (a) =>
          (isAIFlow && isAgentOfInfraEnv(infraEnv, a)) || isAgentOfCluster(a, cdName, cdNamespace),
      ),
    [isAIFlow, infraEnv, agents, cdName, cdNamespace],
  );
  const usedHostnames = React.useMemo(() => getAgentsHostsNames(clusterAgents), [clusterAgents]);

  const renderCurrentStep = React.useCallback(() => {
    const stepId: ClusterDeploymentWizardStepsType = !clusterDeployment
      ? 'cluster-details'
      : currentStepId;

    switch (stepId) {
      case 'hosts-selection':
        if (agentClusterInstall?.metadata?.name) {
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
        }
        return <LoadingState />;
      case 'hosts-discovery':
        if (isAIFlow) {
          return (
            <ClusterDeploymentHostsDiscoveryStep
              // clusterDeployment={clusterDeployment}
              agentClusterInstall={agentClusterInstall}
              agents={agents}
              bareMetalHosts={[] /* TODO(mlibra) */}
              aiConfigMap={aiConfigMap}
              infraEnv={
                infraEnv as InfraEnvK8sResource /* Must be available since isAIFlow === true */
              }
              usedHostnames={usedHostnames}
              onDeleteHost={onDeleteHost}
              canDeleteAgent={canDeleteAgent}
              onSaveAgent={onSaveAgent}
              canEditHost={canEditHost}
              onSaveBMH={onSaveBMH}
              fetchSecret={fetchSecret}
              fetchNMState={fetchNMState}
              getClusterDeploymentLink={getClusterDeploymentLink}
              onClose={onClose}
              isBMPlatform={isBMPlatform}
              onSaveISOParams={onSaveISOParams}
              onSaveHostsDiscovery={onSaveHostsDiscovery}
              onCreateBMH={onCreateBMH}
              // onFormSaveError={setErrorHandler}
            />
          );
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
    onSaveHostsDiscovery,
    aiConfigMap,
    infraEnv,
    usedHostnames,
    onDeleteHost,
    canDeleteAgent,
    onSaveAgent,
    canEditHost,
    onSaveBMH,
    onCreateBMH,
    fetchSecret,
    fetchNMState,
    getClusterDeploymentLink,
    isBMPlatform,
    isAIFlow,
    onSaveISOParams,
  ]);

  return (
    <AlertsContextProvider>
      <ClusterDeploymentWizardContext.Provider
        value={{
          currentStepId,
          setCurrentStepId,
          clusterDeployment /* Hotfix: agentClusterInstall, agents */,
        }}
      >
        <div className={classNames('pf-c-wizard', className)}>{renderCurrentStep()}</div>
      </ClusterDeploymentWizardContext.Provider>
    </AlertsContextProvider>
  );
};

export default ClusterDeploymentWizard;
