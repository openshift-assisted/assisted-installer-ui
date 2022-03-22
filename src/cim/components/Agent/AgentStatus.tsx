import { Button, Popover, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { getHostname, HostStatus } from '../../../common';
import { AgentK8sResource } from '../../types';
import { AgentTableActions, ClusterDeploymentWizardStepsType } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers/toAssisted';
import { getAgentStatus, getWizardStepAgentStatus } from '../helpers/status';

import '@patternfly/react-styles/css/utilities/Text/text.css';
import { AdditionalNTPSourcesDialogToggle } from '../ClusterDeployment/AdditionalNTPSourcesDialogToggle';

export type AgentStatusProps = {
  agent: AgentK8sResource;
  onApprove?: AgentTableActions['onApprove'];
  onEditHostname?: AgentTableActions['onEditHost'];
  zIndex?: number;
  wizardStepId?: ClusterDeploymentWizardStepsType;
};

const AgentStatus: React.FC<AgentStatusProps> = ({
  agent,
  onApprove,
  onEditHostname,
  zIndex,
  wizardStepId,
}) => {
  const [host] = getAIHosts([agent]);
  const editHostname = onEditHostname ? () => onEditHostname(agent) : undefined;
  const pendingApproval = !agent.spec.approved;

  const hostname = getHostname(host, agent.status?.inventory || {});

  const status = wizardStepId
    ? getWizardStepAgentStatus(agent, wizardStepId)
    : getAgentStatus(agent);

  return (
    <HostStatus
      host={host}
      onEditHostname={editHostname}
      zIndex={zIndex}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      {...status}
    >
      {pendingApproval && onApprove && (
        <Popover
          aria-label="Approve host popover"
          minWidth="30rem"
          maxWidth="50rem"
          headerContent={<div>Approve host to join infrastructure environment</div>}
          bodyContent={
            <Stack hasGutter>
              <StackItem>
                Make sure that you expect and recognize the host before approving.
              </StackItem>
              <StackItem>{hostname && <>Hostname: {hostname}</>}</StackItem>
            </Stack>
          }
          footerContent={
            <Button variant="link" onClick={() => onApprove(agent)} isInline>
              Approve host
            </Button>
          }
        >
          <Button variant="link" isInline className="pf-u-font-size-xs">
            Approve host
          </Button>
        </Popover>
      )}
    </HostStatus>
  );
};

export default AgentStatus;
