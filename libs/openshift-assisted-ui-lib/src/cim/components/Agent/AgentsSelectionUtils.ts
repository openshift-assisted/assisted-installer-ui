import React from 'react';
import { useFormikContext } from 'formik';
import isEqual from 'lodash/isEqual';
import { AgentK8sResource } from '../../types/k8s/agent';
import {
  ClusterDeploymentHostsSelectionValues,
  ScaleUpFormValues,
} from '../ClusterDeployment/types';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common/constants';

type AllowedFormValues = ClusterDeploymentHostsSelectionValues | ScaleUpFormValues;

export const useAgentsAutoSelection = <FormValues extends AllowedFormValues>(
  availableAgents: AgentK8sResource[],
) => {
  const { setFieldValue, values } = useFormikContext<FormValues>();
  const { hostCount, locations, autoSelectedHostIds } = values;

  const [matchingAgents, selectedAgents] = React.useMemo(() => {
    const mAgents = availableAgents.filter((agent) => {
      const agentLocation =
        agent.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE;
      return locations.length ? locations.includes(agentLocation) : true;
    });
    const sAgents = mAgents.filter((a) => autoSelectedHostIds.includes(a.metadata?.uid || ''));
    return [mAgents, sAgents];
  }, [availableAgents, locations, autoSelectedHostIds]);

  React.useEffect(() => {
    const ids = matchingAgents.map((a) => a.metadata?.uid).splice(0, hostCount);
    if (!isEqual(ids, autoSelectedHostIds)) {
      setTimeout(() => setFieldValue('autoSelectedHostIds', ids, true));
    }
  }, [matchingAgents, setFieldValue, autoSelectedHostIds, hostCount]);

  return { matchingAgents, selectedAgents, hostCount };
};
