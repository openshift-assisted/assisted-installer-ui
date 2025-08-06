import {
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  useWizardContext,
  useWizardFooter,
  WizardFooter,
} from '@patternfly/react-core';
import * as React from 'react';
import { canNextFromReviewStep } from '../wizardTransition';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  ClusterImageSetK8sResource,
  InfraEnvK8sResource,
} from '../../../types';
import {
  ClusterWizardStepHeader,
  DetailList,
  DetailItem,
  ReviewHostsInventory,
  ClusterValidations,
  HostsValidations,
  useAlerts,
  getPlatforms,
} from '../../../../common';
import {
  getSelectedVersion,
  getAICluster,
  getClusterDeploymentCpuArchitecture,
} from '../../helpers';
import { isAgentOfCluster } from '../helpers';
import { wizardStepNames } from '../constants';
import {
  wizardStepsValidationsMap,
  ClusterWizardStepsType,
  allClusterWizardSoftValidationIds,
} from '../wizardTransition';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { ClusterDeploymentWizardContext } from '../ClusterDeploymentWizardContext';
import { ValidationSection } from '../components/ValidationSection';
import { PlatformType } from '@openshift-assisted/types/assisted-installer-service';

type ClusterDeploymentReviewStepProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  // eslint-disable-next-line
  onFinish: () => Promise<any>;
  clusterImages: ClusterImageSetK8sResource[];
  infraEnv?: InfraEnvK8sResource;
};

export const ClusterDeploymentReviewStep = ({
  agentClusterInstall,
  agents,
  onFinish,
  clusterDeployment,
  clusterImages,
  infraEnv,
}: ClusterDeploymentReviewStepProps) => {
  const { addAlert, clearAlerts } = useAlerts();
  const { activeStep, goToPrevStep, goToStepByName, close } = useWizardContext();
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const cdName = clusterDeployment.metadata?.name;
  const cdNamespace = clusterDeployment.metadata?.namespace;
  const cpuArchitecture = getClusterDeploymentCpuArchitecture(clusterDeployment, infraEnv);

  const clusterAgents = React.useMemo(
    () => agents.filter((a) => isAgentOfCluster(a, cdName, cdNamespace)),
    [agents, cdName, cdNamespace],
  );

  const canContinue = canNextFromReviewStep(agentClusterInstall, clusterAgents);
  const { t } = useTranslation();
  const onNext = async () => {
    clearAlerts();
    setSubmitting(true);
    try {
      await onFinish();
    } catch (err) {
      const error = err as Error;
      addAlert({ title: error.message || t('ai:An error occured while starting installation.') });
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <WizardFooter
      activeStep={activeStep}
      onNext={onNext}
      isNextDisabled={isSubmitting || !canContinue || !!syncError}
      nextButtonText={t('ai:Install cluster')}
      nextButtonProps={{ isLoading: isSubmitting }}
      onBack={goToPrevStep}
      onClose={close}
    />
  );
  useWizardFooter(footer);

  const openShiftVersion = getSelectedVersion(clusterImages, agentClusterInstall);
  const platform =
    getPlatforms(t)[
      (agentClusterInstall?.spec?.platformType?.toLowerCase() || 'baremetal') as PlatformType
    ];

  const cluster = React.useMemo(
    () => getAICluster({ clusterDeployment, agentClusterInstall, agents: clusterAgents }),
    [clusterDeployment, agentClusterInstall, clusterAgents],
  );

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>Review and create</ClusterWizardStepHeader>
      </GridItem>
      <GridItem>
        <DetailList>
          <DetailItem
            title={t('ai:Cluster address')}
            value={`${clusterDeployment.metadata?.name || ''}.${
              clusterDeployment.spec?.baseDomain || ''
            }`}
            testId="cluster-address"
          />
          <DetailItem
            title={t('ai:OpenShift version')}
            value={openShiftVersion}
            testId="openshift-version"
          />
          <DetailItem
            title={t('ai:CPU architecture')}
            value={cpuArchitecture}
            testId="cpu-architecture"
          />
          <DetailItem
            title={t('ai:External partner platform')}
            value={platform}
            testId="platform-type"
          />
          <DetailItem
            title={t('ai:API IP')}
            value={agentClusterInstall?.status?.apiVIP || agentClusterInstall?.spec?.apiVIP}
            testId="api-vip"
          />
          <DetailItem
            title={t('ai:Ingress IP')}
            value={agentClusterInstall?.status?.ingressVIP || agentClusterInstall?.spec?.ingressVIP}
            testId="ingress-vip"
          />
          <DetailItem
            title={t('ai:Cluster summary')}
            testId="cluster-summary"
            value={<ReviewHostsInventory hosts={cluster.hosts} />}
          />

          <DetailItem
            title={t('ai:Cluster validations')}
            value={
              <ClusterValidations<ClusterWizardStepsType>
                validationsInfo={cluster.validationsInfo}
                setCurrentStepId={goToStepByName}
                wizardStepNames={wizardStepNames(t)}
                wizardStepsValidationsMap={wizardStepsValidationsMap}
              />
            }
            testId="cluster-validations"
          />
          <DetailItem
            title={t('ai:Host validations')}
            value={
              <HostsValidations<ClusterWizardStepsType, typeof allClusterWizardSoftValidationIds>
                hosts={cluster.hosts}
                setCurrentStepId={goToStepByName}
                wizardStepNames={wizardStepNames(t)}
                allClusterWizardSoftValidationIds={allClusterWizardSoftValidationIds}
                wizardStepsValidationsMap={wizardStepsValidationsMap}
              />
            }
            testId="host-validations"
          />
        </DetailList>
      </GridItem>
      {syncError && (
        <GridItem>
          <ValidationSection currentStepId={'review'} hosts={[]}>
            <Alert variant={AlertVariant.danger} title={t('ai:An error occured')} isInline>
              {syncError}
            </Alert>
          </ValidationSection>
        </GridItem>
      )}
    </Grid>
  );
};
