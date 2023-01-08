import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';
import { TFunction } from 'i18next';

import {
  AgentServiceConfigK8sResource,
  convertOCPtoCIMResourceHeader,
  CreateResourceFuncType,
  GetResourceFuncType,
  ListResourcesFuncType,
  PatchResourceFuncType,
  ResourcePatch,
  RouteK8sResource,
} from '../../../types';
import { LOCAL_STORAGE_ID_LAST_UPDATE_TIMESTAMP } from './utils';

export type SetErrorFuncType = ({
  title,
  message,
  variant,
}: {
  title: string;
  message?: string;
  variant?: AlertVariant;
}) => void;

const ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX = 'assisted-image-service-multicluster-engine';

// Since we do not know MCE's namespace, query all routes,
// Find assisted-image-service's one and parse domain from there.
const getAssistedImageServiceRoute = async (
  t: TFunction,
  setError: SetErrorFuncType,
  listResources: ListResourcesFuncType,
): Promise<RouteK8sResource | undefined> => {
  let allRoutes;
  try {
    allRoutes = (await listResources({
      kind: 'Route',
      apiVersion: 'route.openshift.io/v1',
    })) as RouteK8sResource[];
  } catch (e) {
    console.error('Failed to read all routes: ', allRoutes);
    setError({
      title: t('ai:Failed to save configuration'),
      message: t('ai:Can not query routes.'),
    });
    return undefined;
  }

  const assistedImageServiceRoute = allRoutes?.find(
    (r: RouteK8sResource) => r.metadata?.name === 'assisted-image-service',
  );

  if (!assistedImageServiceRoute?.spec?.host) {
    setError({
      title: t('ai:Failed to save configuration'),
      message: t('ai:Can not find host of the assisted-image-service route'),
    });
    return undefined;
  }

  return assistedImageServiceRoute;
};

// There are many ways how to get the domain name, let's follow the documentation.
const getClusterDomain = (
  t: TFunction,
  setError: SetErrorFuncType,
  assistedImageServiceRoute: RouteK8sResource,
): string | undefined => {
  const prefix = `${ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX}.`;
  const host: string = assistedImageServiceRoute.spec?.host || '';
  const appsDomain = host.substring(host.indexOf(prefix) + prefix.length);

  // the appsDomain can be prefixed either by "apps." or "nlb-apps." so search for first dot
  const domain = appsDomain.substring(appsDomain.indexOf('.') + 1);

  if (!domain) {
    // It must be present
    console.error('Can not find domain in assistedImageServiceRoute: ', assistedImageServiceRoute);
    setError({
      title: t('ai:Can not find cluster domain.'),
    });
  }

  return domain;
};

// Keep this function in sync with getClusterDomain()
const patchAssistedImageServiceRoute = async (
  t: TFunction,
  setError: SetErrorFuncType,
  patchResource: PatchResourceFuncType,

  assistedImageServiceRoute: RouteK8sResource,
  domain: string,
): Promise<boolean> => {
  const newHost = `${ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX}.nlb-apps.${domain}`;

  const labels = assistedImageServiceRoute.metadata?.labels || {};
  labels['router-type'] = 'nlb';

  const patches: ResourcePatch[] = [
    {
      op: 'replace',
      path: '/spec/host',
      value: newHost,
    },
    {
      op: assistedImageServiceRoute.metadata?.labels ? 'replace' : 'add',
      path: '/metadata/labels',
      value: labels,
    },
  ];

  try {
    await patchResource(convertOCPtoCIMResourceHeader(assistedImageServiceRoute), patches);
  } catch (e) {
    console.error('Failed to patch assisted-image-service route: ', e, patches);
    setError({
      title: t('ai:Failed to patch assisted-image-service route for new domain.'),
    });
    return false;
  }

  return true;
};

export const isIngressController = async (getResource: GetResourceFuncType): Promise<boolean> => {
  try {
    await getResource({
      apiVersion: 'operator.openshift.io/v1',
      kind: 'IngressController',
      metadata: {
        name: 'ingress-controller-with-nlb',
        namespace: 'openshift-ingress-operator',
      },
    });

    return true;
  } catch {
    return false;
  }
};

const createIngressController = async (
  t: TFunction,
  setError: SetErrorFuncType,
  createResource: CreateResourceFuncType,

  domain: string,
): Promise<boolean> => {
  // Assumption: the IngressController resource is not present - ensured at higher level

  const ingressController = {
    apiVersion: 'operator.openshift.io/v1',
    kind: 'IngressController',
    metadata: {
      name: 'ingress-controller-with-nlb',
      namespace: 'openshift-ingress-operator',
    },
    spec: {
      domain: `nlb-apps.${domain}`,
      routeSelector: {
        matchLabels: {
          'router-type': 'nlb',
        },
      },
      endpointPublishingStrategy: {
        type: 'LoadBalancerService',
        loadBalancer: {
          scope: 'External',
          providerParameters: {
            type: 'AWS',
            aws: {
              type: 'NLB',
            },
          },
        },
      },
    },
  };

  try {
    await createResource(ingressController);
    return true;
  } catch (e) {
    console.error('Create IngressController error: ', e);
    setError({
      title: t('ai:Failed to create IngressController'),
    });
  }

  return false;
};

const patchProvisioningConfiguration = async ({
  t,
  setError,
  patchResource,
  getResource,
}: {
  t: TFunction;
  setError: SetErrorFuncType;
  patchResource: PatchResourceFuncType;
  getResource: GetResourceFuncType;
}): Promise<boolean> => {
  try {
    const provisioning = (await getResource({
      kind: 'Provisioning',
      apiVersion: 'metal3.io/v1alpha1',
      metadata: {
        name: 'provisioning-configuration',
      },
    })) as K8sResourceCommon & { spec?: { watchAllNamespaces?: boolean } };

    const patches: ResourcePatch[] = [
      {
        op: provisioning.spec?.watchAllNamespaces ? 'replace' : 'add',
        path: '/spec/watchAllNamespaces',
        value: true,
      },
    ];

    await patchResource(convertOCPtoCIMResourceHeader(provisioning), patches);
    return true;
  } catch (e) {
    console.error('Failed to patch provisioning-configuration: ', e);
    setError({
      title: t('ai:Failed to configure provisioning.'),
    });
    return false;
  }
};

const createAgentServiceConfig = async ({
  t,
  setError,
  createResource,
  dbVolSizeGiB,
  fsVolSizeGiB,
  imgVolSizeGiB,
}: {
  t: TFunction;
  setError: SetErrorFuncType;
  createResource: CreateResourceFuncType;

  dbVolSizeGiB: number;
  fsVolSizeGiB: number;
  imgVolSizeGiB: number;
}): Promise<boolean> => {
  try {
    const agentServiceConfig = {
      apiVersion: 'agent-install.openshift.io/v1beta1',
      kind: 'AgentServiceConfig',
      metadata: {
        name: 'agent',
      },
      spec: {
        databaseStorage: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: `${dbVolSizeGiB}Gi`,
            },
          },
        },
        filesystemStorage: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: `${fsVolSizeGiB}Gi`,
            },
          },
        },
        imageStorage: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: `${imgVolSizeGiB}Gi`,
            },
          },
        },
      },
    };

    await createResource(agentServiceConfig);
    return true;
  } catch (e) {
    console.error('Failed to create AgentServiceConfig: ', e);
    setError({
      title: t('ai:Failed to create AgentServiceConfig'),
    });
    return false;
  }
};

/* Following functions are tested but recently not used.
const patchAgentServiceConfig = async ({
  t,
  setError,
  patchResource,
  agentServiceConfig,
  imgVolSizeGB,
}: {
  t: TFunction;
  setError: SetErrorFuncType;
  patchResource: PatchResourceFuncType;
  agentServiceConfig: AgentServiceConfigK8sResource;

  imgVolSizeGB: number;
}): Promise<boolean> => {
  try {
    const patches: ResourcePatch[] = [
      {
        op: 'replace',
        path: '/spec/imageStorage/resources/requests/storage',
        value: `${imgVolSizeGB}G`,
      },
    ];
    await patchResource(agentServiceConfig, patches);
    return true;
  } catch (e) {
    console.error('Failed to patch AgentServiceConfig: ', e);
    setError({
      title: t('ai:Failed to update the AgentServiceConfig'),
    });
    return false;
  }
};

export const onDeleteCimConfig = async ({
  deleteResource,
}: {
  deleteResource: DeleteResourceFuncType;
}) => {
  try {
    await deleteResource({
      apiVersion: 'agent-install.openshift.io/v1beta1',
      kind: 'AgentServiceConfig',
      metadata: {
        name: 'agent',
        // cluster-scoped resource
      },
    });
  } catch (e) {
    console.error('Failed to delete AgentServiceConfig: ', e);
  }
};
*/
// https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.6/html/multicluster_engine/multicluster_engine_overview#enable-cim
export const onEnableCIM = async ({
  t,
  setError,
  createResource,
  getResource,
  listResources,
  patchResource,

  agentServiceConfig,
  platform,

  dbVolSizeGiB,
  fsVolSizeGiB,
  imgVolSizeGiB,

  configureLoadBalancer,
}: {
  t: TFunction;
  setError: SetErrorFuncType;
  createResource: CreateResourceFuncType;
  getResource: GetResourceFuncType;
  listResources: ListResourcesFuncType;
  patchResource: PatchResourceFuncType;

  agentServiceConfig?: AgentServiceConfigK8sResource;
  platform: string;

  dbVolSizeGiB: number;
  fsVolSizeGiB: number;
  imgVolSizeGiB: number;

  configureLoadBalancer: boolean;
}) => {
  if (['none', 'baremetal', 'openstack', 'vsphere'].includes(platform.toLocaleLowerCase())) {
    if (!(await patchProvisioningConfiguration({ t, setError, patchResource, getResource }))) {
      return false;
    }
  }

  if (agentServiceConfig) {
    console.log('The AgentServiceConfig recently can not be patched. Delete and create instead.');
  } else {
    if (
      !(await createAgentServiceConfig({
        t,
        setError,
        createResource,
        dbVolSizeGiB,
        fsVolSizeGiB,
        imgVolSizeGiB,
      }))
    ) {
      return false;
    }
  }

  // see isCIMConfigProgressing()
  window.localStorage.setItem(LOCAL_STORAGE_ID_LAST_UPDATE_TIMESTAMP, new Date().toISOString());

  if (configureLoadBalancer) {
    // Recently No to Yes only (since we do not delete the ingress controller)
    if (await isIngressController(getResource)) {
      console.log('IngressController already present, we do not patch it.');
      return true /* Not an error */;
    }

    const assistedImageServiceRoute = await getAssistedImageServiceRoute(
      t,
      setError,
      listResources,
    );
    if (!assistedImageServiceRoute) {
      return false;
    }

    const domain = getClusterDomain(t, setError, assistedImageServiceRoute);
    if (!domain) {
      return false;
    }

    if (
      !(await createIngressController(t, setError, createResource, domain)) ||
      !(await patchAssistedImageServiceRoute(
        t,
        setError,
        patchResource,
        assistedImageServiceRoute,
        domain,
      ))
    ) {
      return false;
    }
  }

  return true;
};
