import * as React from 'react';
import { Alert, Grid, GridItem, Text, TextContent } from '@patternfly/react-core';
import {
  ClusterDefaultConfig,
  CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4,
  getHostSubnets,
  NetworkConfigurationFormFields,
} from '../../../common';
import { HostSubnets } from '../../../common/types';
import ClusterDeploymentHostsNetworkTable from './ClusterDeploymentHostsNetworkTable';
import { getAgentStatus, getAICluster } from '../helpers';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import {
  ClusterDeploymentHostsTablePropsActions,
  ClusterDeploymentNetworkingValues,
} from './types';
import { useFormikContext } from 'formik';

// TODO(mlibra): So far a constant. Should be queried from somewhere.
export const defaultNetworkSettings: ClusterDefaultConfig = CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4;

type ClusterDeploymentNetworkingFormProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onValuesChanged?: (values: ClusterDeploymentNetworkingValues) => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

const ClusterDeploymentNetworkingForm: React.FC<ClusterDeploymentNetworkingFormProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onValuesChanged,
  ...rest
}) => {
  const { values } = useFormikContext<ClusterDeploymentNetworkingValues>();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  const isVipDhcpAllocationDisabled = true; // So far not supported

  const cluster = getAICluster({
    clusterDeployment,
    agentClusterInstall,
    agents,
  });

  let hostSubnets: HostSubnets = [];

  const bindingAgents: AgentK8sResource[] = [];
  const discoveringAgents: AgentK8sResource[] = [];

  agents.forEach((a) => {
    const [status] = getAgentStatus(a);
    if (status === 'binding') {
      bindingAgents.push(a);
    }
    if (status === 'discovering') {
      // will happen once the agent is bound
      discoveringAgents.push(a);
    }
  });

  if (bindingAgents.length === 0 && discoveringAgents.length === 0) {
    // Assumption: Agents already passed one of the AGENT_FOR_SELECTION_STATUSES states to get here
    hostSubnets = getHostSubnets(cluster);
  }

  return (
    <NetworkConfigurationFormFields
      cluster={cluster}
      hostSubnets={hostSubnets}
      isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
      defaultNetworkSettings={defaultNetworkSettings}
      hideManagedNetworking
    >
      <Grid hasGutter>
        {!!bindingAgents.length && (
          <GridItem>
            <Alert
              variant="info"
              isInline
              title={`${bindingAgents.length} ${
                bindingAgents.length === 1 ? 'host is' : 'hosts are'
              } binding. Please wait until they are available to continue configuring. It may take several seconds.`}
            />
          </GridItem>
        )}
        <GridItem>
          <TextContent>
            <Text component="h2">Host inventory</Text>
          </TextContent>
        </GridItem>
        <GridItem>
          <ClusterDeploymentHostsNetworkTable
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            {...rest}
          />
        </GridItem>
      </Grid>
    </NetworkConfigurationFormFields>
  );
};

export default ClusterDeploymentNetworkingForm;
