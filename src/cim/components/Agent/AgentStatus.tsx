import { Button, Popover, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { HostStatus } from '../../../common';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers';

import '@patternfly/react-styles/css/utilities/Text/text.css';

type AgentStatusProps = {
  agent: AgentK8sResource;
  onApprove: ClusterDeploymentHostsTablePropsActions['onApprove'];
  onEditHostname: ClusterDeploymentHostsTablePropsActions['onEditHost'];
};

const AgentStatus: React.FC<AgentStatusProps> = ({ agent, onApprove, onEditHostname }) => {
  const [host] = getAIHosts([agent]);
  const editHostname = onEditHostname ? () => onEditHostname(agent) : undefined;
  const validationsInfo = agent.status?.hostValidationInfo || {};
  const pendingApproval = !agent.spec.approved;
  return (
    <Stack>
      <StackItem>
        <HostStatus
          host={host}
          onEditHostname={editHostname}
          validationsInfo={validationsInfo}
          statusOverride={pendingApproval ? 'Discovered' : undefined}
        />
      </StackItem>
      {pendingApproval && onApprove && (
        <StackItem>
          <Popover
            aria-label="Approve host popover"
            minWidth="30rem"
            maxWidth="50rem"
            headerContent={<div>Approve host to join infrastructure environment</div>}
            bodyContent={
              <>
                <div>Approve host to add it to the infrastructure environment.</div>
                <div>Make sure that you expect and recognize the host before approving.</div>
              </>
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
        </StackItem>
      )}
    </Stack>
  );
};

export default AgentStatus;
