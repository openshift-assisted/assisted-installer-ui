import React from 'react';
import { useFormikContext } from 'formik';
import isEqual from 'lodash-es/isEqual.js';
import { HostRole } from '@openshift-assisted/types/assisted-installer-service';
import { AgentK8sResource } from '../../types/k8s/agent';
import {
  ClusterDeploymentHostsSelectionValues,
  ScaleUpFormValues,
} from '../ClusterDeployment/types';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common/constants';
import { ProvisionRequirements } from '../ClusterDeployment/hostSelection/utils';
import { getAgentRole } from '../helpers';

type AllowedFormValues = ClusterDeploymentHostsSelectionValues | ScaleUpFormValues;

const getRequiredHosts = (
  agents: AgentK8sResource[],
  role: HostRole,
  count = 0,
  autoAssignOffset = 0,
) => {
  const hostIds = agents
    .filter((agent) => getAgentRole(agent) === role)
    .map((agent) => agent.metadata?.uid)
    .slice(0, count);

  const missingHosts = count - hostIds.length;
  let usedAutoAssignHosts = 0;
  if (missingHosts > 0) {
    const autoAssignHosts = agents
      .filter((agent) => getAgentRole(agent) === 'auto-assign')
      .map((agent) => agent.metadata?.uid)
      .slice(autoAssignOffset, autoAssignOffset + missingHosts);

    hostIds.push(...autoAssignHosts);
    usedAutoAssignHosts = autoAssignHosts.length;
  }
  return { hostIds, autoAssign: usedAutoAssignHosts + autoAssignOffset };
};

export const useAgentsAutoSelection = <FormValues extends AllowedFormValues>(
  availableAgents: AgentK8sResource[],
  provisionRequirements?: ProvisionRequirements,
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
    if (!!provisionRequirements) {
      const { hostIds: masterIds, autoAssign: offsetMasters } = getRequiredHosts(
        matchingAgents,
        'master',
        provisionRequirements.controlPlaneAgents,
      );

      const { hostIds: arbiterIds, autoAssign: offsetArbiters } = getRequiredHosts(
        matchingAgents,
        'arbiter',
        provisionRequirements.arbiterAgents,
        offsetMasters,
      );

      const { hostIds: workerIds } = getRequiredHosts(
        matchingAgents,
        'worker',
        hostCount -
          (provisionRequirements.controlPlaneAgents || 0) -
          (provisionRequirements.arbiterAgents || 0),
        offsetArbiters,
      );

      const ids = [...masterIds, ...arbiterIds, ...workerIds];
      if (!isEqual(ids, autoSelectedHostIds)) {
        setTimeout(() => setFieldValue('autoSelectedHostIds', ids, true));
      }
    } else {
      const ids = matchingAgents.map((a) => a.metadata?.uid).slice(0, hostCount);
      if (!isEqual(ids, autoSelectedHostIds)) {
        setTimeout(() => setFieldValue('autoSelectedHostIds', ids, true));
      }
    }
  }, [matchingAgents, setFieldValue, autoSelectedHostIds, hostCount, provisionRequirements]);

  return { matchingAgents, selectedAgents, hostCount };
};
