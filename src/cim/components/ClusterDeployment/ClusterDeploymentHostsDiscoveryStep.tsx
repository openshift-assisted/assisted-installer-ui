import React from 'react';
import uniq from 'lodash/uniq';
import { Grid, GridItem, Alert, AlertVariant, List, ListItem } from '@patternfly/react-core';

import { ClusterWizardStepHeader } from '../../../common';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import { ClusterDeploymentHostsDiscoveryStepProps } from './types';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';
import { getAgentsHostsNames, isAgentOfInfraEnv } from './helpers';
import { getIsSNOCluster, getWizardStepAgentStatus } from '../helpers';
import { canNextFromHostDiscoveryStep } from './wizardTransition';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const ClusterDeploymentHostsDiscoveryStep: React.FC<ClusterDeploymentHostsDiscoveryStepProps> = ({
  agentClusterInstall,
  agents: allAgents,
  infraEnv,
  infraNMStates,
  clusterDeployment,
  bareMetalHosts,
  onCreateBMH,
  onSaveAgent,
  onEditRole,
  onSetInstallationDiskId,
  onSaveBMH,
  onSaveISOParams,
  fetchSecret,
  onChangeBMHHostname,
  onApproveAgent,
  onDeleteHost,
  getClusterDeploymentLink,
  isBMPlatform,
  onSaveHostsDiscovery,
  onClose,
  ...rest
}) => {
  const { t } = useTranslation();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);
  const [showClusterErrors, setShowClusterErrors] = React.useState(false);
  const [nextRequested, setNextRequested] = React.useState(false);
  const [showFormErrors, setShowFormErrors] = React.useState(false);
  const infraEnvAgents = React.useMemo(
    () => allAgents.filter((a) => isAgentOfInfraEnv(infraEnv, a)),
    [allAgents, infraEnv],
  );
  const usedHostnames = React.useMemo(() => getAgentsHostsNames(infraEnvAgents), [infraEnvAgents]);

  const errors = [];
  if (getIsSNOCluster(agentClusterInstall)) {
    infraEnvAgents.length > 1 &&
      errors.push(t('ai:Single node cluster cannot contain more than 1 host.'));
  } else {
    (infraEnvAgents.length === 4 || infraEnvAgents.length < 3) &&
      errors.push(t('ai:Cluster must have 3 or 5 and more hosts.'));
  }

  if (infraEnvAgents.some((a) => !a.spec.approved)) {
    errors.push(t('ai:All hosts must be approved.'));
  }

  if (usedHostnames.some((h) => h === 'localhost')) {
    errors.push(t('ai:Hostname localhost is forbidden.'));
  }

  if (uniq(usedHostnames).length !== usedHostnames.length) {
    errors.push(t('ai:Hostnames must be unique.'));
  }
  const agentsNotHealthy = infraEnvAgents
    .map((agent) => getWizardStepAgentStatus(agent, 'hosts-discovery', t).status.key)
    .some((status) =>
      ['disconnected', 'disabled', 'error', 'insufficient', 'cancelled'].includes(status),
    );

  if (agentsNotHealthy) {
    errors.push(t('ai:Some hosts are not ready.'));
  }

  const onNext = async () => {
    if (!showFormErrors) {
      setShowFormErrors(true);
      if (errors.length) {
        return;
      }
    }
    await onSaveHostsDiscovery();
    setNextRequested(true);
  };

  React.useEffect(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
  }, [infraEnvAgents.length]);

  React.useEffect(() => {
    if (nextRequested) {
      if (agentsNotHealthy) {
        setNextRequested(false);
      } else {
        setShowClusterErrors(true);
        if (canNextFromHostDiscoveryStep(agentClusterInstall, infraEnvAgents)) {
          setCurrentStepId('networking');
        }
      }
    }
  }, [nextRequested, infraEnvAgents, agentClusterInstall, setCurrentStepId, agentsNotHealthy]);

  const submittingText =
    nextRequested && !showClusterErrors ? t('ai:Saving changes...') : undefined;

  const onSyncError = React.useCallback(() => setNextRequested(false), []);

  const footer = (
    <ClusterDeploymentWizardFooter
      agentClusterInstall={agentClusterInstall}
      agents={infraEnvAgents}
      isSubmitting={!!submittingText}
      submittingText={submittingText}
      isNextDisabled={nextRequested || (showFormErrors ? !!errors.length : false)}
      onNext={onNext}
      onBack={() => setCurrentStepId('cluster-details')}
      showClusterErrors={showClusterErrors}
      onSyncError={onSyncError}
      onCancel={onClose}
    >
      {showFormErrors && !!errors.length && (
        <Alert
          variant={AlertVariant.danger}
          title={t('ai:Provided cluster configuration is not valid')}
          isInline
        >
          <List>
            {errors.map((error) => (
              <ListItem key={error}>{error}</ListItem>
            ))}
          </List>
        </Alert>
      )}
    </ClusterDeploymentWizardFooter>
  );

  return (
    <ClusterDeploymentWizardStep footer={footer}>
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>{t('ai:Cluster hosts')}</ClusterWizardStepHeader>
        </GridItem>
        <GridItem>
          <ClusterDeploymentHostsDiscovery
            agentClusterInstall={agentClusterInstall}
            agents={infraEnvAgents}
            infraEnv={infraEnv}
            infraNMStates={infraNMStates}
            bareMetalHosts={bareMetalHosts}
            usedHostnames={usedHostnames}
            clusterDeployment={clusterDeployment}
            onCreateBMH={onCreateBMH}
            onSaveAgent={onSaveAgent}
            onEditRole={onEditRole}
            onSetInstallationDiskId={onSetInstallationDiskId}
            onSaveBMH={onSaveBMH}
            onSaveISOParams={onSaveISOParams}
            fetchSecret={fetchSecret}
            onChangeBMHHostname={onChangeBMHHostname}
            onApproveAgent={onApproveAgent}
            onDeleteHost={onDeleteHost}
            getClusterDeploymentLink={getClusterDeploymentLink}
            isBMPlatform={isBMPlatform}
            {...rest}
          />
        </GridItem>
      </Grid>
    </ClusterDeploymentWizardStep>
  );
};

export default ClusterDeploymentHostsDiscoveryStep;
