import * as React from 'react';
import { AgentK8sResource } from '../../../../types';
import { HostsFormValues } from './types';
import { useFormikHelpers } from '../../../../../common/hooks/useFormikHelpers';
import HostsSelectionTable from '../../HostsSelectionTable/HostsSelectionTable';

type HostsAdvancedSelectionProps = {
  agents: AgentK8sResource[];
  index: number;
};

const HostsAdvancedSelection: React.FC<HostsAdvancedSelectionProps> = ({ agents, index }) => {
  const { setValue: setNodePoolsValue, valueRef: nodePoolsRef } =
    useFormikHelpers<HostsFormValues['nodePools']>('nodePools');

  const onSelect = React.useCallback(
    (agent: AgentK8sResource, selected: boolean) => {
      const newIDs = selected
        ? [...nodePoolsRef.current[index].selectedAgentIDs, agent.metadata?.uid || '']
        : nodePoolsRef.current[index].selectedAgentIDs.filter(
            (uid: string) => uid !== agent.metadata?.uid,
          );
      const newNodePools = [...nodePoolsRef.current];
      newNodePools[index].selectedAgentIDs = newIDs;
      void setNodePoolsValue(newNodePools);
    },
    [setNodePoolsValue, index, nodePoolsRef],
  );

  const setSelectedIDs = React.useCallback(
    (ids: string[]) => {
      const newNodePools = [...nodePoolsRef.current];
      newNodePools[index].selectedAgentIDs = ids;
      void setNodePoolsValue(newNodePools);
    },
    [setNodePoolsValue, index, nodePoolsRef],
  );

  return (
    <HostsSelectionTable
      agents={agents}
      onSelect={onSelect}
      selectedIDs={nodePoolsRef.current[index].selectedAgentIDs}
      setSelectedIDs={setSelectedIDs}
    />
  );
};

export default HostsAdvancedSelection;
