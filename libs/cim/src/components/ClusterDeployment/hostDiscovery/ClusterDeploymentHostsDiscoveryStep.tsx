import React from 'react';
import uniq from 'lodash-es/uniq.js';
import {
  Grid,
  GridItem,
  Alert,
  AlertVariant,
  List,
  ListItem,
  useWizardFooter,
  WizardFooter,
  useWizardContext,
} from '@patternfly/react-core';

import { Alerts, ClusterWizardStepHeader } from '@openshift-assisted/common';
import { ClusterDeploymentHostsDiscoveryStepProps } from '../types';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';
import { getAgentsHostsNames, isAgentOfInfraEnv } from '../helpers';
import { getIsSNOCluster, getWizardStepAgentStatus } from '../../helpers';
import { canNextFromHostDiscoveryStep } from '../wizardTransition';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import { ValidationSection } from '../components/ValidationSection';
import { ClusterDeploymentWizardContext } from '../ClusterDeploymentWizardContext';

export const ClusterDeploymentHostsDiscoveryStep = ({
  agentClusterInstall,
  agents: allAgents,
  infraEnv,
  onSaveHostsDiscovery,
  ...rest
}: ClusterDeploymentHostsDiscoveryStepProps) => {
  const { t } = useTranslation();
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);
  const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
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
    infraEnvAgents.length < 3 && errors.push(t('ai:Cluster must have at least 3 hosts.'));
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

  const onNext = React.useCallback(async () => {
    if (!showFormErrors) {
      setShowFormErrors(true);
      if (errors.length) {
        return;
      }
    }
    await onSaveHostsDiscovery();
    setNextRequested(true);
  }, [errors.length, onSaveHostsDiscovery, showFormErrors]);

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (canNextFromHostDiscoveryStep(agentClusterInstall, infraEnvAgents)) {
          void goToNextStep();
        }
      }
    }
  }, [nextRequested, infraEnvAgents, agentClusterInstall, agentsNotHealthy, goToNextStep]);

  const submittingText = React.useMemo(
    () => (nextRequested && !showClusterErrors ? t('ai:Saving changes...') : undefined),
    [nextRequested, showClusterErrors, t],
  );

  React.useEffect(() => {
    if (syncError) {
      setNextRequested(false);
    }
  }, [syncError]);

  const footer = React.useMemo(
    () => (
      <WizardFooter
        activeStep={activeStep}
        onNext={onNext}
        isNextDisabled={nextRequested || (showFormErrors ? !!errors.length : false)}
        nextButtonText={submittingText || t('ai:Next')}
        nextButtonProps={{ isLoading: !!submittingText }}
        onBack={goToPrevStep}
        onClose={close}
      />
    ),
    [
      activeStep,
      close,
      errors.length,
      goToPrevStep,
      nextRequested,
      onNext,
      showFormErrors,
      submittingText,
      t,
    ],
  );
  useWizardFooter(footer);

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>{t('ai:Cluster hosts')}</ClusterWizardStepHeader>
      </GridItem>
      <GridItem>
        <ClusterDeploymentHostsDiscovery
          agentClusterInstall={agentClusterInstall}
          agents={infraEnvAgents}
          infraEnv={infraEnv}
          usedHostnames={usedHostnames}
          {...rest}
        />
      </GridItem>
      {showClusterErrors && !!errors.length && (
        <GridItem>
          <Alerts />
        </GridItem>
      )}
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

      {!!syncError && (
        <GridItem>
          <ValidationSection currentStepId={'hosts-selection'} hosts={[]}>
            <Alert variant={AlertVariant.danger} title={t('ai:An error occurred')} isInline>
              {syncError}
            </Alert>
          </ValidationSection>
        </GridItem>
      )}
    </Grid>
  );
};
