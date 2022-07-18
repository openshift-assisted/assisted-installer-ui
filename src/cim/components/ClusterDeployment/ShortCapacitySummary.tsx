import React from 'react';
import { fileSize } from '../../../common';
import { AgentK8sResource } from '../../types';
import { TFunction } from 'i18next';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export const getTotalCompute = (selectedAgents: AgentK8sResource[], t: TFunction) => {
  const totals = selectedAgents.reduce(
    (acc, agent) => {
      acc.cpus += agent.status?.inventory.cpu?.count || 0;
      acc.memory += agent.status?.inventory.memory?.usableBytes || 0;
      return acc;
    },
    {
      cpus: 0,
      memory: 0,
    },
  );

  return t('ai:{{cpus}} CPUs | {{memory}} Memory', {
    cpus: totals.cpus,
    memory: fileSize(totals.memory, 2, 'iec'),
  });
};

type ShortCapacitySummaryProps = {
  selectedAgents: AgentK8sResource[];
};

const ShortCapacitySummary: React.FC<ShortCapacitySummaryProps> = ({ selectedAgents }) => {
  const { t } = useTranslation();
  return (
    <div>
      {t('ai:Total compute')}: {getTotalCompute(selectedAgents, t)}
    </div>
  );
};

export default ShortCapacitySummary;
