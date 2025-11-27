import {
  k8sCreate,
  k8sGet,
  k8sListItems,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { getErrorMessage } from '../../../../common/utils';

import {
  AgentServiceConfigK8sResource,
  AgentServiceConfigModel,
  IngressControllerModel,
  ProvisioningModel,
  RouteK8sResource,
  RouteModel,
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
): Promise<RouteK8sResource | undefined> => {
  let allRoutes: RouteK8sResource[] = [];
  try {
    allRoutes = await k8sListItems({ model: RouteModel, queryParams: {} });
  } catch (e) {
    // console.error('Failed to read all routes: ', allRoutes);
    setError({
      title: t('ai:Failed to save configuration'),
      message: t('ai:Can not query routes.'),
    });
    return undefined;
  }

  const assistedImageServiceRoute = allRoutes?.find(
    (r) => r.metadata?.name === 'assisted-image-service',
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
    // console.error('Can not find domain in assistedImageServiceRoute: ', assistedImageServiceRoute);
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

  assistedImageServiceRoute: RouteK8sResource,
  domain: string,
): Promise<boolean> => {
  const newHost = `${ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX}.nlb-apps.${domain}`;

  const labels = assistedImageServiceRoute.metadata?.labels || {};
  labels['router-type'] = 'nlb';

  const patches = [
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
    await k8sPatch({
      model: RouteModel,
      resource: assistedImageServiceRoute,
      data: patches,
    });
  } catch (e) {
    // console.error('Failed to patch assisted-image-service route: ', e, patches);
    setError({
      title: t('ai:Failed to patch assisted-image-service route for new domain.'),
    });
    return false;
  }

  return true;
};

export const isIngressController = async (): Promise<boolean> => {
  try {
    await k8sGet({
      name: 'ingress-controller-with-nlb',
      ns: 'openshift-ingress-operator',
      model: IngressControllerModel,
    });

    return true;
  } catch {
    return false;
  }
};

const createIngressController = async (
  t: TFunction,
  setError: SetErrorFuncType,

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
    await k8sCreate({ model: IngressControllerModel, data: ingressController });
    return true;
  } catch (e) {
    // console.error('Create IngressController error: ', e);
    setError({
      title: t('ai:Failed to create IngressController'),
    });
  }

  return false;
};

const patchProvisioningConfiguration = async ({
  t,
  setError,
}: {
  t: TFunction;
  setError: SetErrorFuncType;
}) => {
  try {
    const provisioning = await k8sGet<
      K8sResourceCommon & { spec?: { watchAllNamespaces?: boolean } }
    >({
      model: ProvisioningModel,
      name: 'provisioning-configuration',
    });

    const patches = [
      {
        op: provisioning.spec?.watchAllNamespaces ? 'replace' : 'add',
        path: '/spec/watchAllNamespaces',
        value: true,
      },
    ];

    await k8sPatch({
      model: ProvisioningModel,
      resource: provisioning,
      data: patches,
    });
  } catch (e) {
    // console.error('Failed to patch provisioning-configuration: ', e);
    setError({
      title: t('ai:Failed to configure provisioning to enable registering hosts via BMC.'),
      message: getErrorMessage(e),
      variant: AlertVariant.warning,
    });
  }
};

const createAgentServiceConfig = async ({
  t,
  setError,
  dbVolSizeGiB,
  fsVolSizeGiB,
  imgVolSizeGiB,
  ciscoIntersightURL,
}: {
  t: TFunction;
  setError: SetErrorFuncType;

  dbVolSizeGiB: number;
  fsVolSizeGiB: number;
  imgVolSizeGiB: number;
  ciscoIntersightURL?: string;
}): Promise<boolean> => {
  try {
    const agentServiceConfig = {
      apiVersion: 'agent-install.openshift.io/v1beta1',
      kind: 'AgentServiceConfig',
      metadata: {
        name: 'agent',
        annotations: {},
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

    if (ciscoIntersightURL) {
      agentServiceConfig.metadata = {
        ...agentServiceConfig.metadata,
        annotations: { ciscoIntersightURL },
      };
    }

    await k8sCreate({
      model: AgentServiceConfigModel,
      data: agentServiceConfig,
    });

    return true;
  } catch (e) {
    setError({
      title: t('ai:Failed to create AgentServiceConfig'),
      message: getErrorMessage(e),
    });
    return false;
  }
};

// https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.6/html/multicluster_engine/multicluster_engine_overview#enable-cim
export const onEnableCIM = async ({
  t,
  setError,

  agentServiceConfig,
  platform,

  dbVolSizeGiB,
  fsVolSizeGiB,
  imgVolSizeGiB,

  configureLoadBalancer,
  ciscoIntersightURL,
}: {
  t: TFunction;
  setError: SetErrorFuncType;

  agentServiceConfig?: AgentServiceConfigK8sResource;
  platform: string;

  dbVolSizeGiB: number;
  fsVolSizeGiB: number;
  imgVolSizeGiB: number;

  configureLoadBalancer: boolean;
  ciscoIntersightURL?: string;
}) => {
  if (['none', 'baremetal', 'openstack', 'vsphere'].includes(platform.toLocaleLowerCase())) {
    await patchProvisioningConfiguration({ t, setError });
  }

  if (!agentServiceConfig) {
    if (
      !(await createAgentServiceConfig({
        t,
        setError,
        dbVolSizeGiB,
        fsVolSizeGiB,
        imgVolSizeGiB,
        ciscoIntersightURL,
      }))
    ) {
      return false;
    }
  }

  // see isCIMConfigProgressing()
  window.localStorage.setItem(LOCAL_STORAGE_ID_LAST_UPDATE_TIMESTAMP, new Date().toISOString());

  if (configureLoadBalancer) {
    // Recently No to Yes only (since we do not delete the ingress controller)
    if (await isIngressController()) {
      return true /* Not an error */;
    }

    const assistedImageServiceRoute = await getAssistedImageServiceRoute(t, setError);
    if (!assistedImageServiceRoute) {
      return false;
    }

    const domain = getClusterDomain(t, setError, assistedImageServiceRoute);
    if (!domain) {
      return false;
    }

    if (
      !(await createIngressController(t, setError, domain)) ||
      !(await patchAssistedImageServiceRoute(t, setError, assistedImageServiceRoute, domain))
    ) {
      return false;
    }
  }

  return true;
};
