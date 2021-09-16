import { Button, Popover, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { getHostname, HostStatus } from '../../../common';
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

  const macAddress = agent.status?.inventory?.interfaces?.[0]?.macAddress;
  const hostname = getHostname(host, agent.status?.inventory || {});
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
                {hostname && <div>Hostname: {hostname}</div>}
                {macAddress && <div>MAC address: {macAddress}</div>}
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
