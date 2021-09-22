import React from 'react';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import ShortCapacitySummary from '../ClusterDeployment/ShortCapacitySummary';
import { AgentK8sResource } from '../../types';

const getHostCountWarningText = (hostsSelected: number) => {
  switch (hostsSelected) {
    case 0:
      return 'No host is selected.';
    case 1:
      return 'Only 1 host is selected.';
  }
  return `Only ${hostsSelected} hosts are selected.`;
};

type AgentsSelectionHostCountAlertsProps = {
  matchingAgentsCount: number;
  selectedAgents: AgentK8sResource[];
  targetHostCount: number;
};

const AgentsSelectionHostCountAlerts = ({
  matchingAgentsCount,
  selectedAgents,
  targetHostCount,
}: AgentsSelectionHostCountAlertsProps) => {
  const selectedAgentsCount = selectedAgents.length;
  return (
    <AlertGroup>
      {selectedAgentsCount === targetHostCount && (
        <Alert
          variant={AlertVariant.success}
          title={`${selectedAgentsCount} ${
            selectedAgentsCount === 1 ? 'host' : 'hosts'
          } selected out of ${matchingAgentsCount} matching.`}
          isInline
        >
          <ShortCapacitySummary selectedAgents={selectedAgents} />
        </Alert>
      )}
      {selectedAgentsCount < targetHostCount && (
        <Alert
          variant={AlertVariant.warning}
          title={getHostCountWarningText(selectedAgentsCount)}
          isInline
        >
          <ShortCapacitySummary selectedAgents={selectedAgents} />
        </Alert>
      )}
    </AlertGroup>
  );
};

export default AgentsSelectionHostCountAlerts;
