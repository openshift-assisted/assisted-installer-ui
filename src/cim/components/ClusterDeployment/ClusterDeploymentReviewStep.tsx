import { Grid, GridItem } from '@patternfly/react-core';
import * as React from 'react';
import { canNextFromReviewStep } from './wizardTransition';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  ClusterImageSetK8sResource,
} from '../../types';
import {
  ClusterWizardStepHeader,
  DetailList,
  DetailItem,
  ReviewHostsInventory,
  ClusterValidations,
  HostsValidations,
  useAlerts,
} from '../../../common';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import { getSelectedVersion, getAICluster } from '../helpers';
import { isAgentOfCluster } from './helpers';
import { wizardStepNames } from './constants';
import {
  wizardStepsValidationsMap,
  ClusterWizardStepsType,
  allClusterWizardSoftValidationIds,
} from './wizardTransition';

type ClusterDeploymentReviewStepProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onClose: VoidFunction;
  // eslint-disable-next-line
  onFinish: () => Promise<any>;
  clusterImages: ClusterImageSetK8sResource[];
};

const ClusterDeploymentReviewStep: React.FC<ClusterDeploymentReviewStepProps> = ({
  agentClusterInstall,
  agents,
  onClose,
  onFinish,
  clusterDeployment,
  clusterImages,
}) => {
  const { addAlert, clearAlerts } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const onBack = () => setCurrentStepId('networking');

  const cdName = clusterDeployment.metadata?.name;
  const cdNamespace = clusterDeployment.metadata?.namespace;

  const clusterAgents = React.useMemo(
    () => agents.filter((a) => isAgentOfCluster(a, cdName, cdNamespace)),
    [agents, cdName, cdNamespace],
  );

  const canContinue = canNextFromReviewStep(agentClusterInstall, clusterAgents);

  const onNext = async () => {
    clearAlerts();
    setSubmitting(true);
    try {
      await onFinish();
    } catch (err) {
      addAlert({ title: err.message || 'An error occured while starting installation.' });
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <ClusterDeploymentWizardFooter
      agentClusterInstall={agentClusterInstall}
      agents={clusterAgents}
      isSubmitting={isSubmitting}
      isNextDisabled={isSubmitting || !canContinue}
      onBack={onBack}
      onNext={onNext}
      onCancel={onClose}
      nextButtonText="Install cluster"
    />
  );

  const openShiftVersion = getSelectedVersion(clusterImages, agentClusterInstall);

  const cluster = React.useMemo(
    () => getAICluster({ clusterDeployment, agentClusterInstall, agents: clusterAgents }),
    [clusterDeployment, agentClusterInstall, clusterAgents],
  );

  return (
    <ClusterDeploymentWizardStep footer={footer}>
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>Review and create</ClusterWizardStepHeader>
        </GridItem>
        <GridItem>
          <DetailList>
            <DetailItem
              title="Cluster address"
              value={`${clusterDeployment.metadata?.name}.${clusterDeployment.spec?.baseDomain}`}
              testId="cluster-address"
            />
            <DetailItem
              title="OpenShift version"
              value={openShiftVersion}
              testId="openshift-version"
            />
            <DetailItem title="API IP" value={agentClusterInstall.spec?.apiVIP} testId="api-vip" />
            <DetailItem
              title="Ingress IP"
              value={agentClusterInstall.spec?.ingressVIP}
              testId="ingress-vip"
            />
            <DetailItem
              title="Cluster summary"
              testId="cluster-summary"
              value={<ReviewHostsInventory hosts={cluster.hosts} />}
            />

            <DetailItem
              title="Cluster validations"
              value={
                <ClusterValidations<ClusterWizardStepsType>
                  validationsInfo={cluster.validationsInfo}
                  setCurrentStepId={setCurrentStepId}
                  wizardStepNames={wizardStepNames}
                  wizardStepsValidationsMap={wizardStepsValidationsMap}
                />
              }
              testId="cluster-validations"
            />
            <DetailItem
              title="Host validations"
              value={
                <HostsValidations<ClusterWizardStepsType, typeof allClusterWizardSoftValidationIds>
                  hosts={cluster.hosts}
                  setCurrentStepId={setCurrentStepId}
                  wizardStepNames={wizardStepNames}
                  allClusterWizardSoftValidationIds={allClusterWizardSoftValidationIds}
                  wizardStepsValidationsMap={wizardStepsValidationsMap}
                />
              }
              testId="host-validations"
            />
          </DetailList>
        </GridItem>
      </Grid>
    </ClusterDeploymentWizardStep>
  );
};

export default ClusterDeploymentReviewStep;
