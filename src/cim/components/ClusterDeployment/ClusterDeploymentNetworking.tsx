import React from 'react';
import { Grid, GridItem, Text, TextContent } from '@patternfly/react-core';
import { Cluster, ClusterDefaultConfig, ClusterWizardStepHeader } from '../../../common';
import { HostSubnets } from '../../../common/types/clusters';
import { NetworkConfigurationFormFields } from '../../../common/components/clusterConfiguration';
import { NetworkingHostsTable } from '../../../common/components/hosts';
import ClusterDeploymentHostsTable from './ClusterDeploymentHostsTable';
import { ClusterDeploymentHostsTablePropsActions } from './types';
import NetworkingStatus from './NetworkingStatus';
import { HostNetworkingStatusComponentProps } from '../../../common/components/hosts/NetworkingHostsTable';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';

const ClusterDeploymentNetworking: React.FC<
  {
    cluster: Cluster;
    hostSubnets: HostSubnets;
    defaultNetworkSettings: ClusterDefaultConfig;
  } & ClusterDeploymentHostsTablePropsActions
> = ({ cluster, hostSubnets, defaultNetworkSettings, ...rest }) => {
  const isVipDhcpAllocationDisabled = true; // So far not supported

  const CimNetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = React.useMemo(
    () => (props) => <NetworkingStatus cluster={cluster} {...props} />,
    [cluster],
  );
  const AdditionalNTPSourcesDialogToggleWithCluster: React.FC = React.useMemo(
    () => () => <AdditionalNTPSourcesDialogToggle cluster={cluster} />,
    [cluster],
  );

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>Networking</ClusterWizardStepHeader>
      </GridItem>
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

export default ClusterDeploymentNetworking;
