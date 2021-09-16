import React from 'react';
import { fileSize } from '../../../common';
import { AgentK8sResource } from '../../types';

type ShortCapacitySummaryProps = {
  selectedAgents: AgentK8sResource[];
};

const ShortCapacitySummary: React.FC<ShortCapacitySummaryProps> = ({ selectedAgents }) => {
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
  return (
    <div>
      Total compute: {totals.cpus} CPUs | {fileSize(totals.memory, 2, 'iec')} Memory
    </div>
  );
};

export default ShortCapacitySummary;
