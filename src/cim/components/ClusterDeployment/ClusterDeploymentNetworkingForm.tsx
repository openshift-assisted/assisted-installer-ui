import * as React from 'react';
import {
  Alert,
  Form,
  Grid,
  GridItem,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Checkbox,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  ClusterDefaultConfig,
  CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4,
  getHostSubnets,
  SecurityFields,
  NetworkConfiguration,
  ProxyFields,
  ProxyInputFields,
} from '../../../common';
import { HostSubnets } from '../../../common/types';
import ClusterDeploymentHostsNetworkTable from './ClusterDeploymentHostsNetworkTable';
import { getAgentStatus, getAICluster } from '../helpers';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  ConfigMapK8sResource,
  InfraEnvK8sResource,
} from '../../types';
import {
  ClusterDeploymentHostsTablePropsActions,
  ClusterDeploymentNetworkingValues,
} from './types';
import { useFormikContext } from 'formik';
import MinimalHWRequirements from '../Agent/MinimalHWRequirements';
import { getIsSNOCluster } from '../helpers';

// TODO(mlibra): So far a constant. Should be queried from somewhere.
export const defaultNetworkSettings: ClusterDefaultConfig = CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4;

type ClusterDeploymentNetworkingFormProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onValuesChanged?: (values: ClusterDeploymentNetworkingValues) => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
  aiConfigMap: ConfigMapK8sResource | undefined;
  infraEnvWithProxy: InfraEnvK8sResource | undefined;
  sameProxies: boolean;
  infraEnvsError: string | undefined;
  infraEnvsLoading: boolean;
};

const ClusterDeploymentNetworkingForm: React.FC<ClusterDeploymentNetworkingFormProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onValuesChanged,
  aiConfigMap,
  infraEnvWithProxy,
  sameProxies,
  infraEnvsError,
  infraEnvsLoading,
  ...rest
}) => {
  const { values, touched, setFieldValue, setFieldTouched } = useFormikContext<
    ClusterDeploymentNetworkingValues
  >();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  const [editProxy, setEditProxy] = React.useState(false);

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

  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  React.useEffect(() => {
    if (!!infraEnvWithProxy && !touched.enableProxy) {
      setFieldTouched('enableProxy', true);
      setFieldValue('enableProxy', true);
      if (sameProxies) {
        setFieldValue('httpProxy', infraEnvWithProxy.spec?.proxy?.httpProxy);
        setFieldValue('httpsProxy', infraEnvWithProxy.spec?.proxy?.httpsProxy);
        setFieldValue('noProxy', infraEnvWithProxy.spec?.proxy?.noProxy);
      }
    }
  }, [infraEnvWithProxy, sameProxies, setFieldValue, touched.enableProxy, setFieldTouched]);

  let proxyConfig = <ProxyFields />;
  if (infraEnvWithProxy) {
    if (!sameProxies) {
      proxyConfig = (
        <>
          <TextContent>
            <Text component="h2">Cluster-wide proxy</Text>
            <Text component={TextVariants.p}>
              The hosts you selected are using different proxy settings. Configure a proxy that will
              be applied for these hosts. <b>Configure at least one of the proxy settings below.</b>
            </Text>
          </TextContent>
          <ProxyInputFields />
        </>
      );
    } else {
      proxyConfig = (
        <>
          <Checkbox
            id="edit-proxy"
            label="Edit cluster-wide proxy settings"
            onChange={setEditProxy}
            isChecked={editProxy}
            body={editProxy && <ProxyInputFields />}
          />
        </>
      );
    }
  }

  return (
    <Form>
      <NetworkConfiguration
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
          {aiConfigMap && (
            <GridItem>
              <MinimalHWRequirements aiConfigMap={aiConfigMap} isSNOCluster={isSNOCluster} />
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
      </NetworkConfiguration>
      {infraEnvsError ? (
        <Alert title={infraEnvsError} variant="danger" isInline />
      ) : infraEnvsLoading ? (
        <Split hasGutter>
          <SplitItem>
            <Spinner isSVG size="md" />
          </SplitItem>
          <SplitItem>Loading proxy configuration</SplitItem>
        </Split>
      ) : (
        proxyConfig
      )}
      <SecurityFields clusterSshKey={cluster.sshPublicKey} />
    </Form>
  );
};

export default ClusterDeploymentNetworkingForm;
