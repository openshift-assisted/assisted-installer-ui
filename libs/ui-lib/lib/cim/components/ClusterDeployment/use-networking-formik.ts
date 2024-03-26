import React from 'react';
import * as Yup from 'yup';

import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';
import { getHostSubnets } from '../../../common/components/clusterConfiguration/utils';
import { getNetworkInitialValues } from './networkConfigurationValidation';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  InfraEnvK8sResource,
} from '../../types';
import { getAICluster } from '../helpers';
import { defaultNetworkSettings } from './ClusterDeploymentNetworkingForm';
import { useDeepCompareMemoize } from '../../../common/hooks';
import {
  HostSubnets,
  hostPrefixValidationSchema,
  ipBlockValidationSchema,
  vipValidationSchema,
  sshPublicKeyValidationSchema,
  hostSubnetValidationSchema,
  httpProxyValidationSchema,
  noProxyValidationSchema,
} from '../../../common';
import { ClusterDeploymentNetworkingValues } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const getInfraEnvProxy = (infraEnvs: InfraEnvK8sResource[]) => {
  const infraEnvWithProxy = infraEnvs.find(
    (ie) => ie.spec?.proxy?.httpProxy || ie.spec?.proxy?.httpsProxy || ie.spec?.proxy?.noProxy,
  );
  return {
    infraEnvWithProxy,
    sameProxies: infraEnvs.every(
      (ie) =>
        ie.spec?.proxy?.httpProxy === infraEnvWithProxy?.spec?.proxy?.httpProxy &&
        ie.spec?.proxy?.httpsProxy === infraEnvWithProxy?.spec?.proxy?.httpsProxy &&
        ie.spec?.proxy?.noProxy === infraEnvWithProxy?.spec?.proxy?.noProxy,
    ),
  };
};

const getNetworkConfigurationValidationSchema = (
  initialValues: ClusterDeploymentNetworkingValues,
  hostSubnets: HostSubnets,
) =>
  Yup.lazy<ClusterDeploymentNetworkingValues>((values: ClusterDeploymentNetworkingValues) =>
    Yup.object<ClusterDeploymentNetworkingValues>().shape({
      clusterNetworkHostPrefix: hostPrefixValidationSchema(values.clusterNetworkCidr),
      clusterNetworkCidr: ipBlockValidationSchema(values.serviceNetworkCidr),
      serviceNetworkCidr: ipBlockValidationSchema(values.clusterNetworkCidr),
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
      hostSubnet: hostSubnetValidationSchema,
      httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy' }),
      httpsProxy: httpProxyValidationSchema({ values, pairValueName: 'httpProxy' }), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema,
    }),
  );

type UseNetworkingFormikArgs = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
};

export const useNetworkingFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
}: UseNetworkingFormikArgs) => {
  const initialValues = React.useMemo(
    () => {
      const cluster = getAICluster({
        clusterDeployment,
        agentClusterInstall,
        agents,
      });
      return {
        ...getNetworkInitialValues(cluster, defaultNetworkSettings),
        enableProxy: false,
        editProxy: false,
      };
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(() => {
    const cluster = getAICluster({
      clusterDeployment,
      agentClusterInstall,
      agents,
    });
    const hostSubnets = getHostSubnets(cluster);
    return getNetworkConfigurationValidationSchema(initialValues, hostSubnets);
  }, [initialValues, clusterDeployment, agentClusterInstall, agents]);

  return {
    initialValues,
    validationSchema,
  };
};

type UseInfraEnvProxiesArgs = {
  agents: AgentK8sResource[];
  fetchInfraEnv: (name: string, namespace: string) => Promise<InfraEnvK8sResource>;
};

export const useInfraEnvProxies = ({ agents, fetchInfraEnv }: UseInfraEnvProxiesArgs) => {
  const [infraEnvs, setInfraEnvs] = React.useState<InfraEnvK8sResource[]>();
  const [infraEnvsError, setInfraEnvsError] = React.useState<string>();
  const { infraEnvWithProxy, sameProxies } = getInfraEnvProxy(infraEnvs || []);

  const infraEnvsMetadata = agents
    .map((a) => ({
      name: a.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY],
      namespace: a.metadata?.namespace,
    }))
    .filter((ie) => ie.name && ie.namespace)
    .sort() as { name: string; namespace: string }[];

  const memoInfraEnvs = useDeepCompareMemoize(infraEnvsMetadata);
  const { t } = useTranslation();
  React.useEffect(() => {
    const fetch = async () => {
      setInfraEnvs(undefined);
      setInfraEnvsError(undefined);
      const infraEnvRequests = memoInfraEnvs.map((ie) => fetchInfraEnv(ie.name, ie.namespace));
      try {
        const infraEnvResults = await Promise.all(infraEnvRequests);
        setInfraEnvs(infraEnvResults);
      } catch (e) {
        const error = e as Error;
        setInfraEnvsError(error.message || t('ai:Could not fetch infra environments'));
      }
    };

    void fetch();
  }, [memoInfraEnvs, fetchInfraEnv, setInfraEnvs, setInfraEnvsError, t]);

  return {
    infraEnvWithProxy,
    sameProxies,
    infraEnvsError,
    infraEnvsLoading: !infraEnvs,
  };
};
