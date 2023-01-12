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
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  ClusterDefaultConfig,
  CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4,
  getHostSubnets,
  SecurityFields,
  ProxyFields,
  ProxyInputFields,
} from '../../../common';
import NetworkConfiguration from './NetworkConfiguration';
import ClusterDeploymentHostsNetworkTable from './ClusterDeploymentHostsNetworkTable';
import { getAICluster } from '../helpers';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  InfraEnvK8sResource,
} from '../../types';
import { AgentTableActions, ClusterDeploymentNetworkingValues } from './types';
import { useFormikContext } from 'formik';
import { getGridSpans } from './helpers';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

// TODO(mlibra): So far a constant. Should be queried from somewhere.
export const defaultNetworkSettings: ClusterDefaultConfig = CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4;

type ClusterDeploymentNetworkingFormProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onValuesChanged?: (values: ClusterDeploymentNetworkingValues) => void;
  infraEnvWithProxy: InfraEnvK8sResource | undefined;
  sameProxies: boolean;
  infraEnvsError: string | undefined;
  infraEnvsLoading: boolean;
  isPreviewOpen: boolean;
  onEditHost: AgentTableActions['onEditHost'];
  onEditRole: AgentTableActions['onEditRole'];
};

const ClusterDeploymentNetworkingForm: React.FC<ClusterDeploymentNetworkingFormProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onValuesChanged,
  infraEnvWithProxy,
  sameProxies,
  infraEnvsError,
  infraEnvsLoading,
  isPreviewOpen,
  onEditHost,
  onEditRole,
}) => {
  const { values, touched, setFieldValue, setFieldTouched } =
    useFormikContext<ClusterDeploymentNetworkingValues>();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  const [editProxy, setEditProxy] = React.useState(false);

  const cluster = getAICluster({
    clusterDeployment,
    agentClusterInstall,
    agents,
  });

  const hostSubnets = React.useMemo(() => getHostSubnets(cluster), [cluster]);
  const { t } = useTranslation();
  React.useEffect(() => {
    if (!!infraEnvWithProxy && !touched.enableProxy) {
      setFieldValue('enableProxy', true, false);
      if (sameProxies) {
        setFieldValue('httpProxy', infraEnvWithProxy.spec?.proxy?.httpProxy, false);
        setFieldValue('httpsProxy', infraEnvWithProxy.spec?.proxy?.httpsProxy, false);
        setFieldValue('noProxy', infraEnvWithProxy.spec?.proxy?.noProxy, false);
      }
    }
  }, [infraEnvWithProxy, sameProxies, setFieldValue, touched.enableProxy, setFieldTouched]);

  let proxyConfig = <ProxyFields />;
  if (infraEnvWithProxy) {
    if (!sameProxies) {
      proxyConfig = (
        <>
          <TextContent>
            <Text component="h2">{t('ai:Cluster-wide proxy')}</Text>
            <Text component={TextVariants.p}>
              <Trans
                t={t}
                components={{ bold: <strong /> }}
                i18nKey="ai:The hosts you selected are using different proxy settings. Configure a proxy that will be applied for these hosts. <bold>Configure at least one of the proxy settings below.</bold>"
              />
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
            label={t('ai:Edit cluster-wide proxy settings')}
            onChange={setEditProxy}
            isChecked={editProxy}
            body={editProxy && <ProxyInputFields />}
          />
        </>
      );
    }
  }

  const gridSpans = getGridSpans(isPreviewOpen);

  return (
    <Form>
      <Stack hasGutter>
        <StackItem>
          <Grid hasGutter>
            <GridItem {...gridSpans}>
              <NetworkConfiguration
                cluster={cluster}
                hostSubnets={hostSubnets}
                isVipDhcpAllocationDisabled
                defaultNetworkSettings={defaultNetworkSettings}
                hideManagedNetworking
              />
            </GridItem>
          </Grid>
        </StackItem>
        <StackItem>
          {infraEnvsError ? (
            <Alert title={infraEnvsError} variant="danger" isInline />
          ) : infraEnvsLoading ? (
            <Split hasGutter>
              <SplitItem>
                <Spinner isSVG size="md" />
              </SplitItem>
              <SplitItem>{t('ai:Loading proxy configuration')}</SplitItem>
            </Split>
          ) : (
            proxyConfig
          )}
        </StackItem>
        <StackItem>
          <SecurityFields clusterSshKey={cluster.sshPublicKey} />
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component="h2">{t('ai:Host inventory')}</Text>
          </TextContent>
          <ClusterDeploymentHostsNetworkTable
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            onEditHost={onEditHost}
            onEditRole={onEditRole}
          />
        </StackItem>
      </Stack>
    </Form>
  );
};

export default ClusterDeploymentNetworkingForm;
