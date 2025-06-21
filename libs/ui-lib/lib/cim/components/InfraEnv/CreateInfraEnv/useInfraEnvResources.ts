import * as React from 'react';
import { OsImage, SecretK8sResource } from '../../../types';
import { RoleModel } from '../../../types/models';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { HttpError } from '@openshift-console/dynamic-plugin-sdk/lib/utils/error/http-error';
import { getRole } from './utils';
import { useTranslation } from '../../../../common';
import { useInfraEnvs } from '../../../hooks/useInfraEnvs';
import { useAgentServiceConfigs } from '../../../hooks/useAgentServiceConfig';
import { useSecrets } from '../../../hooks/useSecret';

export const useInfraEnvResources = (
  namespace: string,
): [string[], OsImage[], SecretK8sResource[], boolean, boolean, unknown] => {
  const { t } = useTranslation();
  const [createRole, setCreateRole] = React.useState<boolean>(false);
  const [roleErr, setRoleErr] = React.useState<string>();
  const [roleLoading, setRoleLoading] = React.useState(true);
  const [infraEnvironments, infraLoaded, infraErr] = useInfraEnvs({ namespace });
  const [agentServiceConfigs, agentLoaded, agentErr] = useAgentServiceConfigs();
  const [credentials, credsLoaded, credsErr] = useSecrets({
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
