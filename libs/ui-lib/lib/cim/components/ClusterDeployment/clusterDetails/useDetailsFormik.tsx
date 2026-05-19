import React from 'react';
import { Lazy } from 'yup';
import {
  ClusterDetailsValues,
  getClusterDetailsInitialValues,
  getClusterDetailsValidationSchema,
  OpenshiftVersionOptionType,
  useTranslation,
} from '../../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  InfraEnvK8sResource,
} from '../../../types';
import { getAICluster, getNetworkType } from '../../helpers';

type UseDetailsFormikArgs = {
  usedClusterNames: string[];
  ocpVersions: OpenshiftVersionOptionType[];
  allOcpVersions: OpenshiftVersionOptionType[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
  infraEnv?: InfraEnvK8sResource;
};

export const useDetailsFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  usedClusterNames,
  infraEnv,
  ocpVersions,
  allOcpVersions,
}: UseDetailsFormikArgs): [
  ClusterDetailsValues & { networkType: 'OpenShiftSDN' | 'OVNKubernetes' },
  Lazy<{ baseDnsDomain: string }>,
] => {
  const { t } = useTranslation();
  const isEdit = !!clusterDeployment || !!agentClusterInstall;

  const cluster = React.useMemo(
    () =>
      clusterDeployment && agentClusterInstall
        ? getAICluster({
            clusterDeployment,
            agentClusterInstall,
            agents,
            infraEnv,
          })
        : undefined,
    [agentClusterInstall, clusterDeployment, agents, infraEnv],
  );

  const initialValues = React.useMemo(
    () => {
      let initValues = getClusterDetailsInitialValues({
        managedDomains: [], // not supported
        cluster,
        ocpVersions,
      });

      let ocpVersion = ocpVersions.find(
        (ocpVersion) => ocpVersion.value === initValues.openshiftVersion,
      );

      if (!ocpVersion) {
        ocpVersion = allOcpVersions.find((version) => version.default);
        initValues = {
          ...initValues,
          openshiftVersion: ocpVersion?.value || '',
          customOpenshiftSelect: ocpVersion?.value || '',
        };
      }

      return {
        ...initValues,
        networkType: getNetworkType(ocpVersion),
      };
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const validationSchema = React.useMemo(
    () =>
      getClusterDetailsValidationSchema({
        usedClusterNames,
        pullSecretSet: isEdit,
        validateUniqueName: true,
        t,
      }),
    [usedClusterNames, isEdit, t],
  );

  return [initialValues, validationSchema];
};
