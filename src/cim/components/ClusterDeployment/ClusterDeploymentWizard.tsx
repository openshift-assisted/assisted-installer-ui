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
import { ACMFeatureSupportLevelProvider } from '../featureSupportLevels';

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
  getClusterDeploymentLink,
  fetchSecret,
  fetchNMState,
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  aiConfigMap,
  infraEnv,
  fetchInfraEnv,
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

  const renderCurrentStep = () => {
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
              onSaveISOParams={onSaveISOParams}
              onSaveHostsDiscovery={onSaveHostsDiscovery}
              onCreateBMH={onCreateBMH}
              onChangeBMHHostname={(bmh, hostname) => {
                console.log('onChangeBMHHostname is not implemented: ', hostname);
                return Promise.resolve(bmh);
              }}
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
            aiConfigMap={aiConfigMap}
            onSaveNetworking={onSaveNetworking}
            onClose={onClose}
            hostActions={hostActions}
            onFinish={onFinish}
            fetchInfraEnv={fetchInfraEnv}
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
  };

  return (
    <AlertsContextProvider>
      <ACMFeatureSupportLevelProvider clusterImages={clusterImages} isEditClusterFlow={true}>
        <ClusterDeploymentWizardContext.Provider
          value={{
            currentStepId,
            setCurrentStepId,
            clusterDeployment /* Hotfix: agentClusterInstall, agents */,
          }}
        >
          <div className={classNames('pf-c-wizard', className)}>{renderCurrentStep()}</div>
        </ClusterDeploymentWizardContext.Provider>
      </ACMFeatureSupportLevelProvider>
    </AlertsContextProvider>
  );
};

export default ClusterDeploymentWizard;
