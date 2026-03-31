import {
  k8sCreate,
  k8sGet,
  k8sListItems,
  k8sPatch,
  K8sResourceCommon,
  Patch,
} from '@openshift-console/dynamic-plugin-sdk';
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
import { appendPatch } from '../../../utils';
import { CimConfigurationValues } from './types';

const ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX = 'assisted-image-service-multicluster-engine';

const getAssistedImageServiceRoute = async (t: TFunction): Promise<RouteK8sResource> => {
  let allRoutes: RouteK8sResource[] = [];
  try {
    allRoutes = await k8sListItems({ model: RouteModel, queryParams: {} });
  } catch (e) {
    throw new Error(`${t('ai:Failed to save configuration')}: ${getErrorMessage(e)}`);
  }

  const assistedImageServiceRoute = allRoutes?.find(
    (r) => r.metadata?.name === 'assisted-image-service',
  );

  if (!assistedImageServiceRoute?.spec?.host) {
    throw new Error(
      `${t('ai:Failed to save configuration')}: ${t(
        'ai:Can not find host of the assisted-image-service route',
      )}`,
    );
  }

  return assistedImageServiceRoute;
};

const getClusterDomain = (t: TFunction, assistedImageServiceRoute: RouteK8sResource) => {
  const prefix = `${ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX}.`;
  const host: string = assistedImageServiceRoute.spec?.host || '';
  const appsDomain = host.substring(host.indexOf(prefix) + prefix.length);

  const domain = appsDomain.substring(appsDomain.indexOf('.') + 1);

  if (!domain) {
    throw new Error(t('ai:Can not find cluster domain.'));
  }

  return domain;
};

const patchAssistedImageServiceRoute = async (
  t: TFunction,
  assistedImageServiceRoute: RouteK8sResource,
  domain: string,
) => {
  const newHost = `${ASSISTED_IMAGE_SERVICE_ROUTE_PREFIX}.nlb-apps.${domain}`;

  const labels = assistedImageServiceRoute.metadata?.labels || {};
  labels['router-type'] = 'nlb';

  const patches: Patch[] = [
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
    throw new Error(
      `${t('ai:Failed to patch assisted-image-service route for new domain.')}: ${getErrorMessage(
        e,
      )}`,
    );
  }
};

export async function isIngressController() {
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
}

const createIngressController = async (t: TFunction, domain: string) => {
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
  } catch (e) {
    throw new Error(`${t('ai:Failed to create IngressController')}: ${getErrorMessage(e)}`);
  }
};

export const patchProvisioning = async () => {
  const provisioning = await k8sGet<
    K8sResourceCommon & { spec?: { watchAllNamespaces?: boolean } }
  >({
    model: ProvisioningModel,
    name: 'provisioning-configuration',
  });

  if (provisioning.spec?.watchAllNamespaces) {
    return;
  }

  const patches = [
    {
      op: provisioning.spec?.watchAllNamespaces === false ? 'replace' : 'add',
      path: '/spec/watchAllNamespaces',
      value: true,
    },
  ];

  await k8sPatch({
    model: ProvisioningModel,
    resource: provisioning,
    data: patches,
  });
};

export const createAgentServiceConfig = async ({
  t,
  values,
}: {
  t: TFunction;
  values: CimConfigurationValues;
}) => {
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
              storage: `${values.dbVolSize}Gi`,
            },
          },
        },
        filesystemStorage: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: `${values.fsVolSize}Gi`,
            },
          },
        },
        imageStorage: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: `${values.imgVolSize}Gi`,
            },
          },
        },
      },
    };

    if (values.ciscoIntersightURL) {
      agentServiceConfig.metadata = {
        ...agentServiceConfig.metadata,
        annotations: { ciscoIntersightURL: values.ciscoIntersightURL },
      };
    }

    await k8sCreate({
      model: AgentServiceConfigModel,
      data: agentServiceConfig,
    });
  } catch (e) {
    throw new Error(`${t('ai:Failed to create AgentServiceConfig')}: ${getErrorMessage(e)}`);
  }
};

export const editAgentServiceConfig = async ({
  t,
  agentServiceConfig,
  values,
}: {
  t: TFunction;
  agentServiceConfig: AgentServiceConfigK8sResource;
  values: CimConfigurationValues;
}) => {
  const patches: Patch[] = [];

  if (
    agentServiceConfig.metadata?.annotations?.['ciscoIntersightURL'] &&
    !values.ciscoIntersightURL
  ) {
    patches.push({
      op: 'remove',
      path: '/metadata/annotations/ciscoIntersightURL',
    });
  } else if (!agentServiceConfig.metadata?.annotations && values.ciscoIntersightURL) {
    patches.push({
      op: 'add',
      path: '/metadata/annotations',
      value: { ciscoIntersightURL: values.ciscoIntersightURL },
    });
  } else if (values.ciscoIntersightURL) {
    appendPatch(
      patches,
      '/metadata/annotations/ciscoIntersightURL',
      values.ciscoIntersightURL,
      agentServiceConfig.metadata?.annotations?.['ciscoIntersightURL'],
    );
  }

  if (patches.length === 0) {
    return;
  }

  try {
    await k8sPatch({
      model: AgentServiceConfigModel,
      resource: agentServiceConfig,
      data: patches,
    });
  } catch (e) {
    throw new Error(`${t('ai:Failed to save configuration')}: ${getErrorMessage(e)}`);
  }
};

export const configureIngressLoadBalancer = async ({ t }: { t: TFunction }) => {
  if (await isIngressController()) {
    return;
  }

  const assistedImageServiceRoute = await getAssistedImageServiceRoute(t);
  const domain = getClusterDomain(t, assistedImageServiceRoute);
  await createIngressController(t, domain);
  await patchAssistedImageServiceRoute(t, assistedImageServiceRoute, domain);
};
