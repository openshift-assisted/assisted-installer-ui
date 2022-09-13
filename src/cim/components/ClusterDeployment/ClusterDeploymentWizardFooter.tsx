import React from 'react';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import {
  Alerts,
  WizardFooter,
  useAlerts,
  WizardFooterGenericProps,
  ClusterWizardStepValidationsAlert,
} from '../../../common';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import { ClusterWizardStepHostStatusDeterminationObject } from '../../../common/types/hosts';
import { ValidationsInfo } from '../../../common/types/clusters';
import { Cluster } from '../../../common/api/types';
import { ClusterWizardStepsType, wizardStepsValidationsMap } from './wizardTransition';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { AgentK8sResource } from '../../types/k8s/agent';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import ValidationsRunningAlert from '../common/ValidationsRunningAlert';

type ValidationSectionProps = {
  requireProxy?: boolean;
  currentStepId: ClusterWizardStepsType;
  validationsInfo?: ValidationsInfo;
  clusterStatus?: Cluster['status'];
  hosts: ClusterWizardStepHostStatusDeterminationObject[];
};

const ValidationSection: React.FC<ValidationSectionProps> = ({
  currentStepId,
  clusterStatus,
  validationsInfo,
  hosts,
  children,
}) => {
  return (
    <AlertGroup>
      {children}
      {clusterStatus && (
        <ClusterWizardStepValidationsAlert
          currentStepId={currentStepId}
          clusterStatus={clusterStatus}
          hosts={hosts}
          validationsInfo={validationsInfo}
          wizardStepsValidationsMap={wizardStepsValidationsMap}
        >
          <ValidationsRunningAlert />
        </ClusterWizardStepValidationsAlert>
      )}
    </AlertGroup>
  );
};

type ClusterDeploymentWizardFooterProps = React.ComponentProps<typeof WizardFooter> &
  WizardFooterGenericProps & {
    agentClusterInstall?: AgentClusterInstallK8sResource;
    agents?: AgentK8sResource[];
    showClusterErrors?: boolean;
    onSyncError?: VoidFunction;
  };

const ClusterDeploymentWizardFooter: React.FC<ClusterDeploymentWizardFooterProps> = ({
  agentClusterInstall,
  agents,
  showClusterErrors,
  children,
  onSyncError,
  isNextDisabled,
  ...rest
}) => {
  const { alerts } = useAlerts();
  const { currentStepId } = React.useContext(ClusterDeploymentWizardContext);
  const clusterStatus = showClusterErrors
    ? agentClusterInstall?.status?.debugInfo?.state
    : undefined;
  const validationsInfo = showClusterErrors
    ? agentClusterInstall?.status?.validationsInfo
    : undefined;
  const hosts = React.useMemo(
    () =>
      (agents || []).reduce<ClusterWizardStepHostStatusDeterminationObject[]>((result, agent) => {
        const status = agent.status?.debugInfo?.state;
        if (status) {
          result.push({ status, validationsInfo: agent.status?.validationsInfo });
        }
        return result;
      }, []),
    [agents],
  );

  const syncError = agentClusterInstall?.status?.conditions?.find(
    (c) => c.type === 'SpecSynced' && c.status === 'False',
  )?.message;

  const { t } = useTranslation();
  React.useEffect(() => {
    if (syncError && onSyncError) {
      onSyncError();
    }
  }, [syncError, onSyncError]);

  const alertsSection = alerts.length ? <Alerts /> : undefined;
  const errorsSection = (
    <ValidationSection
      currentStepId={currentStepId}
      clusterStatus={clusterStatus}
      validationsInfo={validationsInfo}
      hosts={hosts}
    >
      {syncError && (
        <Alert variant={AlertVariant.danger} title={t('ai:An error occured')} isInline>
          {syncError}
        </Alert>
      )}
      {children}
    </ValidationSection>
  );

  return (
    <WizardFooter
      alerts={alertsSection}
      errors={errorsSection}
      isNextDisabled={isNextDisabled || !!syncError}
      {...rest}
    />
  );
};

export default ClusterDeploymentWizardFooter;
