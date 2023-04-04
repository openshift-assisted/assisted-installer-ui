import * as React from 'react';
import classNames from 'classnames';
import { Grid, GridItem } from '@patternfly/react-core';
import { AlertsContextProvider, LoadingState } from '../../../common';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import ClusterDeploymentHostSelectionStep from './ClusterDeploymentHostSelectionStep';
import { ClusterDeploymentWizardProps, ClusterDeploymentWizardStepsType } from './types';
import ClusterDeploymentHostsDiscoveryStep from './ClusterDeploymentHostsDiscoveryStep';
import { ACMFeatureSupportLevelProvider } from '../featureSupportLevels';
import ClusterDeploymentReviewStep from './ClusterDeploymentReviewStep';
import { YamlPreview, useYamlPreview } from '../YamlPreview';

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className,
  onSaveDetails,
  onSaveNetworking,
  onSaveHostsSelection,
  onClose,
  onFinish,
  hostActions,
  usedClusterNames,
  fetchSecret,
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  aiConfigMap,
  infraEnv,
  fetchInfraEnv,
  initialStep,
  isPreviewOpen,
  setPreviewOpen,
  fetchManagedClusters,
  fetchKlusterletAddonConfig,
  onSaveISOParams,
  onCreateBMH,
  ...rest
}) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterDeploymentWizardStepsType>(
    initialStep || 'cluster-details',
  );

  const isAIFlow = infraEnv;

  const { code, loadingResources } = useYamlPreview({
    agentClusterInstall,
    clusterDeployment,
    fetchSecret,
    fetchManagedClusters,
    fetchKlusterletAddonConfig,
  });

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
              onEditRole={hostActions.onEditRole}
              onSetInstallationDiskId={hostActions.onSetInstallationDiskId}
            />
          );
        }
        return <LoadingState />;
      case 'hosts-discovery':
        if (isAIFlow) {
          return onSaveISOParams && onCreateBMH ? (
            <ClusterDeploymentHostsDiscoveryStep
              clusterDeployment={clusterDeployment}
              agentClusterInstall={agentClusterInstall}
              agents={agents}
              bareMetalHosts={[] /* TODO(mlibra) */}
              aiConfigMap={aiConfigMap}
              infraEnv={infraEnv}
              fetchSecret={fetchSecret}
              onClose={onClose}
              onChangeBMHHostname={(bmh, hostname) => {
                console.log('onChangeBMHHostname is not implemented: ', hostname);
                return Promise.resolve(bmh);
              }}
              onEditRole={hostActions.onEditRole}
              onSetInstallationDiskId={hostActions.onSetInstallationDiskId}
              onDeleteHost={hostActions.onDeleteHost}
              onSaveISOParams={onSaveISOParams}
              onCreateBMH={onCreateBMH}
              {...rest}
            />
          ) : (
            <LoadingState />
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
            onEditHost={hostActions.onEditHost}
            onEditRole={hostActions.onEditRole}
            fetchInfraEnv={fetchInfraEnv}
            isPreviewOpen={isPreviewOpen}
            onSetInstallationDiskId={hostActions.onSetInstallationDiskId}
          />
        );
      case 'review':
        return (
          <ClusterDeploymentReviewStep
            onFinish={onFinish}
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            onClose={onClose}
            clusterImages={clusterImages}
            infraEnv={infraEnv}
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
            isPreviewOpen={isPreviewOpen}
            infraEnv={infraEnv}
          />
        );
    }
  };

  return (
    <Grid style={{ height: '100%' }}>
      <GridItem span={isPreviewOpen ? 7 : 12}>
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
      </GridItem>
      {isPreviewOpen && (
        <GridItem span={5}>
          <YamlPreview code={code} setPreviewOpen={setPreviewOpen} loading={loadingResources}>
            {`${clusterDeployment.metadata?.name || ''} cluster`}
          </YamlPreview>
        </GridItem>
      )}
    </Grid>
  );
};

export default ClusterDeploymentWizard;
