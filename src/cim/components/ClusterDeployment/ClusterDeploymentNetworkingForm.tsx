import * as React from 'react';
import { Grid, GridItem, Text, TextContent } from '@patternfly/react-core';
import {
  ClusterDefaultConfig,
  CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4,
  getHostSubnets,
  NetworkConfigurationFormFields,
  NetworkingHostsTable,
} from '../../../common';
import { HostNetworkingStatusComponentProps } from '../../../common/components/hosts/NetworkingHostsTable';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';
import NetworkingStatus from './NetworkingStatus';
import ClusterDeploymentHostsTable from './ClusterDeploymentHostsTable';
import { getAICluster } from '../helpers';
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

type ClusterDeploymentNetworkingFormProps = ClusterDeploymentHostsTablePropsActions & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  pullSecretSet: boolean;
  onValuesChanged?: (values: ClusterDeploymentNetworkingValues) => void;
};

const ClusterDeploymentNetworkingForm: React.FC<ClusterDeploymentNetworkingFormProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
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
    pullSecretSet,
  });
  const CimNetworkingStatus = React.useCallback<React.FC<HostNetworkingStatusComponentProps>>(
    (props) => <NetworkingStatus cluster={cluster} {...props} />,
    [cluster],
  );
  const AdditionalNTPSourcesDialogToggleWithCluster = React.useCallback<React.FC>(
    () => <AdditionalNTPSourcesDialogToggle cluster={cluster} />,
    [cluster],
  );

  const hostSubnets = getHostSubnets(cluster);

  return (
    <Grid hasGutter>
      <GridItem span={12} lg={10} xl={9} xl2={7}>
        <NetworkConfigurationFormFields
          cluster={cluster}
          hostSubnets={hostSubnets}
          isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
          defaultNetworkSettings={defaultNetworkSettings}
        />
      </GridItem>

      <GridItem>
        <TextContent>
          <Text component="h2">Host inventory</Text>
        </TextContent>
        <NetworkingHostsTable
          {...rest}
          cluster={cluster}
          TableComponent={ClusterDeploymentHostsTable}
          HostNetworkingStatusComponent={CimNetworkingStatus}
          AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleWithCluster}
        />
      </GridItem>
    </Grid>
  );
};

export default ClusterDeploymentNetworkingForm;
