import { Button, Popover, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { getHostname, HostStatus } from '../../../common';
import { AgentK8sResource } from '../../types';
import { AgentTableActions, ClusterDeploymentWizardStepsType } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers/toAssisted';
import { getAgentStatus, getWizardStepAgentStatus } from '../helpers/status';

import '@patternfly/react-styles/css/utilities/Text/text.css';
import { AdditionalNTPSourcesDialogToggle } from '../ClusterDeployment/AdditionalNTPSourcesDialogToggle';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import ValidationsRunningAlert from '../common/ValidationsRunningAlert';
import { agentStatus } from '../helpers/agentStatus';
import SpecSyncErrAlert from '../common/SpecSyncErrAlert';

export type AgentStatusProps = {
  agent: AgentK8sResource;
  onApprove?: AgentTableActions['onApprove'];
  onEditHostname?: AgentTableActions['onEditHost'];
  zIndex?: number;
  wizardStepId?: ClusterDeploymentWizardStepsType;
  isDay2?: boolean;
};

const AgentStatus: React.FC<AgentStatusProps> = ({
  agent,
  onApprove,
  onEditHostname,
  zIndex,
  wizardStepId,
  isDay2,
}) => {
  const { t } = useTranslation();
  const [host] = getAIHosts([agent]);
  const editHostname = onEditHostname ? () => onEditHostname(agent) : undefined;
  const pendingApproval = !agent.spec.approved;

  const hostname = getHostname(host, agent.status?.inventory || {});
  const agentStatuses = agentStatus(t);
  const status = wizardStepId
    ? getWizardStepAgentStatus(agent, wizardStepId, t)
    : getAgentStatus(agent, agentStatuses, false);

  const showValidationsRunning =
    isDay2 &&
    Object.values(status.validationsInfo).some((valInfo) =>
      valInfo.some((v) => ['pending', 'error', 'failure'].includes(v.status)),
    );

  return (
    <HostStatus
      host={host}
      onEditHostname={editHostname}
      zIndex={zIndex}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      autoCSR
      additionalPopoverContent={
        status.status.key === 'specSyncErr' ? (
          <StackItem>
            <SpecSyncErrAlert agent={agent} />
          </StackItem>
        ) : showValidationsRunning ? (
          <StackItem>
            <ValidationsRunningAlert />
          </StackItem>
        ) : undefined
      }
      {...status}
    >
      {pendingApproval && onApprove && (
        <Popover
          aria-label={t('ai:Approve host popover')}
          minWidth="30rem"
          maxWidth="50rem"
          headerContent={<div>{t('ai:Approve host to join infrastructure environment')}</div>}
          bodyContent={
            <Stack hasGutter>
              <StackItem>
                {t('ai:Make sure that you expect and recognize the host before approving.')}
              </StackItem>
              <StackItem>
                {hostname && <>{t('ai:Hostname: {{hostname}}', { hostname })}</>}
              </StackItem>
            </Stack>
          }
          footerContent={
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            <Button variant="link" onClick={() => onApprove(agent)} isInline>
              {t('ai:Approve host')}
            </Button>
          }
        >
          <Button variant="link" isInline className="pf-v6-u-font-size-xs">
            {t('ai:Approve host')}
          </Button>
        </Popover>
      )}
    </HostStatus>
  );
};

export default AgentStatus;
