import React from 'react';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import {
  Alerts,
  WizardFooter,
  useAlerts,
  WizardFooterGenericProps,
  ClusterWizardStepValidationsAlert,
} from '../../../common';
import { CLUSTER_DEPLOYMENT_FIELD_LABELS } from './constants';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import { ClusterWizardStepHostStatusDeterminationObject } from '../../../common/types/hosts';
import { wizardStepsValidationsMap } from './wizardTransition';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { AgentK8sResource } from '../../types/k8s/agent';

type ValidationSectionProps = {
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  errorFields?: string[];
  requireProxy?: boolean;
};

const ValidationSection = ({
  errorFields = [],
  agents,
  agentClusterInstall,
  requireProxy,
}: ValidationSectionProps) => {
  const { currentStepId } = React.useContext(ClusterDeploymentWizardContext);
  const clusterStatus = agentClusterInstall?.status?.debugInfo?.state;
  const validationsInfo = agentClusterInstall?.status?.validationsInfo;
  const hosts = React.useMemo(
    () =>
      agents.reduce<ClusterWizardStepHostStatusDeterminationObject[]>((result, agent) => {
        const status = agent.status?.debugInfo?.state;
        if (status) {
          result.push({ status, validationsInfo: agent.status?.validationsInfo });
        }
        return result;
      }, []),
    [agents],
  );
  return (
    <AlertGroup>
      {!!errorFields.length && (
        <Alert
          variant={AlertVariant.danger}
          title="Provided cluster configuration is not valid"
          isInline
        >
          The following fields are invalid or missing:{' '}
          {errorFields
            .map((field: string) => CLUSTER_DEPLOYMENT_FIELD_LABELS[field] || field)
            .join(', ')}
          .
        </Alert>
      )}
      {requireProxy && (
        <Alert variant={AlertVariant.warning} title="Cluster proxy is required" isInline>
          At least one of the HTTP or HTTPS proxy URLs is required.
        </Alert>
      )}
      {clusterStatus && (
        <ClusterWizardStepValidationsAlert
          currentStepId={currentStepId}
          clusterStatus={clusterStatus}
          hosts={hosts}
          validationsInfo={validationsInfo}
          wizardStepsValidationsMap={wizardStepsValidationsMap}
        />
      )}
    </AlertGroup>
  );
};

type ClusterDeploymentWizardFooterProps = WizardFooterGenericProps & {
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
  errorFields?: string[];
  requireProxy?: boolean;
};

const ClusterDeploymentWizardFooter = ({
  agentClusterInstall,
  agents = [],
  errorFields,
  requireProxy,
  ...rest
}: ClusterDeploymentWizardFooterProps) => {
  const { alerts } = useAlerts();
  const alertsSection = alerts.length ? <Alerts /> : undefined;
  const errorsSection = (
    <ValidationSection
      agents={agents}
      agentClusterInstall={agentClusterInstall}
      errorFields={errorFields}
      requireProxy={requireProxy}
    />
  );

  return <WizardFooter alerts={alertsSection} errors={errorsSection} {...rest} />;
};

export default ClusterDeploymentWizardFooter;
