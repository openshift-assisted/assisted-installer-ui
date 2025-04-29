import * as React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { Grid, GridItem, Wizard, WizardStep } from '@patternfly/react-core';
import { AlertsContextProvider, LoadingState } from '../../../common';
import { ClusterDeploymentWizardContextProvider } from './ClusterDeploymentWizardContext';
import ClusterDeploymentDetailsStep from './ClusterDeploymentDetailsStep';
import ClusterDeploymentHostSelectionStep from './ClusterDeploymentHostSelectionStep';
import ClusterDeploymentHostsDiscoveryStep from './ClusterDeploymentHostsDiscoveryStep';
import ClusterDeploymentNetworkingStep from './ClusterDeploymentNetworkingStep';
import { ClusterDeploymentManifestsStep } from './ClusterDeploymentManifestsStep';
import ClusterDeploymentReviewStep from './ClusterDeploymentReviewStep';
import { YamlPreview, useYamlPreview } from '../YamlPreview';
import { ACMFeatureSupportLevelProvider } from '../featureSupportLevels';
import { wizardStepNames } from './constants';
import { ClusterDeploymentWizardProps } from './types';
import { isCIMFlow } from './helpers';

export const ClusterDeploymentWizard = ({
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
  bareMetalHosts,
  clusterImages,
  aiConfigMap,
  infraEnv,
  fetchInfraEnv,
  useCustomManifests,
  onSyncCustomManifests,
  initialStep,
  isPreviewOpen,
  setPreviewOpen,
  fetchManagedClusters,
  fetchKlusterletAddonConfig,
  onSaveISOParams,
  onCreateBMH,
  isNutanix,
  onChangeBMHHostname,
  ...rest
}: ClusterDeploymentWizardProps) => {
  const { t } = useTranslation();

  const { code, loadingResources } = useYamlPreview({
    agentClusterInstall,
    clusterDeployment,
    fetchSecret,
    fetchManagedClusters,
    fetchKlusterletAddonConfig,
  });

  // if initialStep is set, it is either 'host-selection' or 'host-discovery', both at index 4
  // if initialStep is not set, start at 'cluster-details' which is at index 2
  const startIndex = initialStep ? 4 : 2;
  const stepNames = wizardStepNames(t);
  const isAIFlow = !!infraEnv;
  const customManifestsStep =
    agentClusterInstall.metadata?.labels?.['addCustomManifests'] === 'true';

  return (
    <Grid style={{ height: '100%' }}>
      <GridItem span={isPreviewOpen ? 7 : 12}>
        <AlertsContextProvider>
          <ACMFeatureSupportLevelProvider clusterImages={clusterImages} isEditClusterFlow={true}>
            <ClusterDeploymentWizardContextProvider agentClusterInstall={agentClusterInstall}>
              <Wizard
                isVisitRequired
                startIndex={startIndex}
                className={className}
                onClose={onClose}
              >
                <WizardStep
                  name={stepNames['installation-type']}
                  id={'installation-type'}
                  isDisabled
                />
                <WizardStep name={stepNames['cluster-details']} id={'cluster-details'}>
                  <ClusterDeploymentDetailsStep
                    clusterImages={clusterImages}
                    usedClusterNames={usedClusterNames}
                    clusterDeployment={clusterDeployment}
                    agentClusterInstall={agentClusterInstall}
                    agents={agents}
                    onSaveDetails={onSaveDetails}
                    isPreviewOpen={isPreviewOpen}
                    infraEnv={infraEnv}
                    isNutanix={isNutanix}
                    useCustomManifests={useCustomManifests}
                    onSyncCustomManifests={onSyncCustomManifests}
                  />
                </WizardStep>
                <WizardStep name={stepNames['automation']} id={'automation'} isDisabled />
                {isCIMFlow(clusterDeployment) ? (
                  <WizardStep name={stepNames['hosts-selection']} id={'host-selection'}>
                    {agentClusterInstall?.metadata?.name ? (
                      <ClusterDeploymentHostSelectionStep
                        clusterDeployment={clusterDeployment}
                        agentClusterInstall={agentClusterInstall}
                        onSaveHostsSelection={onSaveHostsSelection}
                        agents={agents}
                        aiConfigMap={aiConfigMap}
                        onEditRole={hostActions.onEditRole}
                        onSetInstallationDiskId={hostActions.onSetInstallationDiskId}
                        isNutanix={isNutanix}
                      />
                    ) : (
                      <LoadingState />
                    )}
                  </WizardStep>
                ) : (
                  <WizardStep name={stepNames['hosts-discovery']} id={'host-discovery'}>
                    {isAIFlow && onSaveISOParams && onCreateBMH ? (
                      <ClusterDeploymentHostsDiscoveryStep
                        clusterDeployment={clusterDeployment}
                        agentClusterInstall={agentClusterInstall}
                        agents={agents}
                        bareMetalHosts={bareMetalHosts}
                        aiConfigMap={aiConfigMap}
                        infraEnv={infraEnv}
                        fetchSecret={fetchSecret}
                        onChangeBMHHostname={onChangeBMHHostname}
                        onEditRole={hostActions.onEditRole}
                        onSetInstallationDiskId={hostActions.onSetInstallationDiskId}
                        onDeleteHost={hostActions.onDeleteHost}
                        onSaveISOParams={onSaveISOParams}
                        onCreateBMH={onCreateBMH}
                        {...rest}
                      />
                    ) : (
                      <LoadingState />
                    )}
                  </WizardStep>
                )}
                <WizardStep name={stepNames['networking']} id={'networking'}>
                  <ClusterDeploymentNetworkingStep
                    clusterDeployment={clusterDeployment}
                    agentClusterInstall={agentClusterInstall}
                    agents={agents}
                    onSaveNetworking={onSaveNetworking}
                    onEditHost={hostActions.onEditHost}
                    onEditRole={hostActions.onEditRole}
                    fetchInfraEnv={fetchInfraEnv}
                    isPreviewOpen={isPreviewOpen}
                    onSetInstallationDiskId={hostActions.onSetInstallationDiskId}
                    isNutanix={isNutanix}
                  />
                </WizardStep>
                {customManifestsStep && (
                  <WizardStep name={stepNames['custom-manifests']} id="custom-manifests">
                    <ClusterDeploymentManifestsStep
                      agentClusterInstall={agentClusterInstall}
                      useCustomManifests={useCustomManifests}
                      onSyncCustomManifests={onSyncCustomManifests}
                    />
                  </WizardStep>
                )}
                <WizardStep name={stepNames['review']} id={'review'}>
                  <ClusterDeploymentReviewStep
                    onFinish={onFinish}
                    clusterDeployment={clusterDeployment}
                    agentClusterInstall={agentClusterInstall}
                    agents={agents}
                    clusterImages={clusterImages}
                    infraEnv={infraEnv}
                    useCustomManifests={useCustomManifests}
                  />
                </WizardStep>
              </Wizard>
            </ClusterDeploymentWizardContextProvider>
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
