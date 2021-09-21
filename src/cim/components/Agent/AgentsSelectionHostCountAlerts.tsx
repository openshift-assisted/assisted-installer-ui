import React from 'react';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';

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
  selectedAgentsCount: number;
  targetHostCount: number;
};

const AgentsSelectionHostCountAlerts = ({
  matchingAgentsCount,
  selectedAgentsCount,
  targetHostCount,
}: AgentsSelectionHostCountAlertsProps) => {
  return (
    <AlertGroup>
      {selectedAgentsCount === targetHostCount && (
        <Alert
          variant={AlertVariant.success}
          title={`${selectedAgentsCount} ${
            selectedAgentsCount === 1 ? 'host' : 'hosts'
          } selected out of ${matchingAgentsCount} matching.`}
          isInline
        />
      )}
      {selectedAgentsCount < targetHostCount && (
        <Alert
          variant={AlertVariant.warning}
          title={getHostCountWarningText(selectedAgentsCount)}
          isInline
        />
      )}
    </AlertGroup>
  );
};

export default AgentsSelectionHostCountAlerts;
