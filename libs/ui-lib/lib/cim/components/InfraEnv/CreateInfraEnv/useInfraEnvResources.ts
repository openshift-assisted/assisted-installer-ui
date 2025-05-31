import * as React from 'react';
import {
  AgentServiceConfigK8sResource,
  InfraEnvK8sResource,
  OsImage,
  SecretK8sResource,
} from '../../../types';
import { useK8sWatchResource } from '../../../hooks/useK8sWatchResource';
import {
  AgentServiceConfigModel,
  InfraEnvModel,
  RoleModel,
  SecretModel,
} from '../../../types/models';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { HttpError } from '@openshift-console/dynamic-plugin-sdk/lib/utils/error/http-error';
import { getRole } from './utils';
import { useTranslation } from '../../../../common';

export const useInfraEnvResources = (
  namespace: string,
): [string[], OsImage[], SecretK8sResource[], boolean, boolean, unknown] => {
  const { t } = useTranslation();
  const [createRole, setCreateRole] = React.useState<boolean>(false);
  const [roleErr, setRoleErr] = React.useState<string>();
  const [roleLoading, setRoleLoading] = React.useState(true);
  const [infraEnvironments, infraLoaded, infraErr] = useK8sWatchResource<InfraEnvK8sResource[]>({
    groupVersionKind: {
      kind: InfraEnvModel.kind,
      version: InfraEnvModel.apiVersion,
      group: InfraEnvModel.apiGroup,
    },
    isList: true,
    namespace,
  });

  const [agentServiceConfigs, agentLoaded, agentErr] = useK8sWatchResource<
    AgentServiceConfigK8sResource[]
  >({
    groupVersionKind: {
      kind: AgentServiceConfigModel.kind,
      version: AgentServiceConfigModel.apiVersion,
      group: AgentServiceConfigModel.apiGroup,
    },
    isList: true,
  });

  const [credentials, credsLoaded, credsErr] = useK8sWatchResource<SecretK8sResource[]>({
    groupVersionKind: {
      kind: SecretModel.kind,
      version: SecretModel.apiVersion,
    },
    isList: true,
    selector: {
      matchExpressions: [
        {
          key: 'cluster.open-cluster-management.io/type',
          operator: 'In',
          values: ['hostinventory', 'nutanix'],
        },
      ],
    },
  });

  React.useEffect(() => {
    const fetchRole = async () => {
      const role = getRole(namespace);
      try {
        await k8sGet({
          model: RoleModel,
          name: role.metadata.name,
          ns: namespace,
        });
      } catch (e) {
        if ((e as HttpError).code === 404) {
          setCreateRole(true);
        } else {
          setRoleErr(
            t('ai:Failed to check if role {{role}} exists', {
              role: role.metadata.name,
            }),
          );
          return;
        }
      } finally {
        setRoleLoading(false);
      }
    };
    void fetchRole();
  }, [namespace, t]);

  const usedNames = React.useMemo(
    () => infraEnvironments.map((ie) => ie.metadata?.name || ''),
    [infraEnvironments],
  );

  const osImages = agentServiceConfigs?.[0]?.spec.osImages || [];

  return [
    usedNames,
    osImages,
    credentials,
    createRole,
    infraLoaded && agentLoaded && credsLoaded && !roleLoading,
    infraErr || agentErr || credsErr || roleErr,
  ];
};
