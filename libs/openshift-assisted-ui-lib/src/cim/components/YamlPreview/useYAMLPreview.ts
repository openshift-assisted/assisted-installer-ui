import cloneDeep from 'lodash/cloneDeep';
import * as React from 'react';
import * as yaml from 'js-yaml';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
  SecretK8sResource,
} from '../../types';

type YamlPreviewArgs = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  fetchSecret: (namespace: string, bmhName: string) => Promise<SecretK8sResource>;
  fetchManagedClusters: () => Promise<K8sResourceCommon[]>;
  fetchKlusterletAddonConfig: () => Promise<K8sResourceCommon[]>;
};

const resourceToString = (resource: K8sResourceCommon | undefined) => {
  if (!resource) {
    return undefined;
  }
  const resourceClone = cloneDeep(resource);
  // eslint-disable-next-line
  delete (resourceClone as any).status;
  resourceClone.metadata = {
    name: resourceClone.metadata?.name,
    namespace: resourceClone.metadata?.namespace,
    labels: resourceClone.metadata?.labels,
  };

  return yaml.dump(resourceClone);
};

export const useYamlPreview = ({
  clusterDeployment,
  agentClusterInstall,
  fetchSecret,
  fetchManagedClusters,
  fetchKlusterletAddonConfig,
}: YamlPreviewArgs) => {
  const [loadingResources, setLoadingResources] = React.useState(true);
  const [pullSecret, setPullSecret] = React.useState<SecretK8sResource>();
  const [managedCluster, setManagedCluster] = React.useState<K8sResourceCommon>();
  const [klusterlet, setKlusterlet] = React.useState<K8sResourceCommon>();

  const cdName = clusterDeployment.metadata?.name;
  const cdNamespace = clusterDeployment.metadata?.namespace;
  const secretName = clusterDeployment.spec?.pullSecretRef?.name;

  React.useEffect(() => {
    const fetch = async () => {
      const results = await Promise.allSettled([
        fetchSecret(cdNamespace || '', secretName || ''),
        fetchManagedClusters(),
        fetchKlusterletAddonConfig(),
      ]);

      const [secretResult, managedClustersResult, klusterletsResult] = results;

      if (secretResult.status === 'fulfilled') {
        setPullSecret(secretResult.value);
      }

      if (managedClustersResult.status === 'fulfilled') {
        setManagedCluster(
          managedClustersResult.value.find((mc) => mc.metadata?.labels?.name === cdName),
        );
      }

      if (klusterletsResult.status === 'fulfilled') {
        setKlusterlet(
          klusterletsResult.value.find(
            (kac) =>
              // eslint-disable-next-line
              (kac as any).spec.clusterName === cdName &&
              // eslint-disable-next-line
              (kac as any).spec.clusterNamespace === cdNamespace,
          ),
        );
      }

      setLoadingResources(false);
    };

    void fetch();
  }, [
    fetchSecret,
    cdNamespace,
    cdName,
    secretName,
    fetchManagedClusters,
    fetchKlusterletAddonConfig,
  ]);

  const code = React.useMemo(
    () =>
      [clusterDeployment, agentClusterInstall, pullSecret, managedCluster, klusterlet]
        .map(resourceToString)
        .filter((r) => !!r)
        .join(`\n---\n`),
    [clusterDeployment, agentClusterInstall, pullSecret, managedCluster, klusterlet],
  );

  return { code, loadingResources };
};
