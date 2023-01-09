import React from 'react';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import ShortCapacitySummary from '../ClusterDeployment/ShortCapacitySummary';
import { AgentK8sResource } from '../../types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

const getHostCountWarningText = (hostsSelected: number, t: TFunction) => {
  switch (hostsSelected) {
    case 0:
      return t('ai:No host is selected.');
  }
  return t('ai:Only {{hostsSelected}} host is selected.', {
    count: hostsSelected,
    hostsSelected,
  });
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
  const { t } = useTranslation();

  return (
    <AlertGroup>
      {selectedAgentsCount === targetHostCount && (
        <Alert
          variant={AlertVariant.success}
          title={t(
            'ai:{{selectedAgentsCount}} host selected out of {{matchingAgentsCount}} matching.',
            { count: selectedAgentsCount, selectedAgentsCount, matchingAgentsCount },
          )}
          isInline
        >
          <ShortCapacitySummary selectedAgents={selectedAgents} />
        </Alert>
      )}
      {selectedAgentsCount < targetHostCount && (
        <Alert
          variant={AlertVariant.warning}
          title={getHostCountWarningText(selectedAgentsCount, t)}
          isInline
        >
          <ShortCapacitySummary selectedAgents={selectedAgents} />
        </Alert>
      )}
    </AlertGroup>
  );
};

export default AgentsSelectionHostCountAlerts;
