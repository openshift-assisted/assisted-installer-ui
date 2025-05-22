import cloneDeep from 'lodash-es/cloneDeep.js';
import * as React from 'react';
import * as yaml from 'js-yaml';
import {
  k8sGet,
  K8sResourceCommon,
  k8sList,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
  SecretK8sResource,
} from '../../types';
import { KlusterletAddonConfigModel, ManagedClusterModel, SecretModel } from '../../types/models';
import { KlusterletAddonConfigK8sResource } from '../../types/k8s/klusterlet';
type YamlPreviewArgs = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
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

const listItems = async (model: K8sModel) => {
  const result = await k8sList({
    model: model,
    queryParams: {},
  });
  return result as K8sResourceCommon[];
};

export const useYamlPreview = ({ clusterDeployment, agentClusterInstall }: YamlPreviewArgs) => {
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
        k8sGet<SecretK8sResource>({
          model: SecretModel,
          name: secretName,
          ns: cdNamespace,
        }),
        listItems(ManagedClusterModel),
        listItems(KlusterletAddonConfigModel),
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
              (kac as KlusterletAddonConfigK8sResource).spec.clusterName === cdName &&
              (kac as KlusterletAddonConfigK8sResource).spec.clusterNamespace === cdNamespace,
          ),
        );
      }

      setLoadingResources(false);
    };

    void fetch();
  }, [cdNamespace, cdName, secretName]);

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
