import React from 'react';
import {
  k8sPatch,
  K8sResourceCommon,
  Patch,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { AgentClusterInstallK8sResource } from '../types';
import { load } from 'js-yaml';
import { reconcileResources } from './apis/utils';
import { AgentClusterInstallModel, MachineConfigModel } from './apis/models';

export const CustomManifestService = {
  useCustomManifests: (agentClusterInstall?: AgentClusterInstallK8sResource) => {
    const params = Object.fromEntries(
      [...(agentClusterInstall?.spec?.manifestsConfigMapRefs || [])]?.map((manifest) => [
        manifest.name,
        {
          name: manifest.name,
          groupVersionKind: {
            group: 'machineconfiguration.openshift.io',
            version: 'v1',
            kind: 'MachineConfig',
          },
        },
      ]),
    );

    const manifestsData = useK8sWatchResources(params);
    const customManifests = React.useMemo(
      () => Object.values(manifestsData).map((manifest) => manifest.data) as K8sResourceCommon[],
      [manifestsData],
    );

    const isLoading = Object.values(manifestsData).some((manifest) => manifest.loaded === false);
    const isError = Object.values(manifestsData).some((manifest) => !!manifest.loadError);

    return { customManifests, isLoading, isError };
  },

  onSyncCustomManifests: async (
    agentClusterInstall?: AgentClusterInstallK8sResource,
    values?: {
      manifests: {
        manifestYaml: string;
        filename?: string;
        created: boolean;
      }[];
    },
    existingManifests?: K8sResourceCommon[],
  ) => {
    if (agentClusterInstall) {
      const manifestNames = values?.manifests?.map((manifest) => ({
        name: (load(manifest.manifestYaml) as K8sResourceCommon).metadata?.name,
      }));

      const manifests = values?.manifests.map(
        (manifest) => load(manifest.manifestYaml) as K8sResourceCommon,
      );

      const customManifestPatches: Patch[] = [
        {
          op: agentClusterInstall.spec?.manifestsConfigMapRefs ? 'replace' : 'add',
          path: '/spec/manifestsConfigMapRefs',
          value: manifestNames,
        },
      ];

      await reconcileResources(manifests || [], existingManifests || [], MachineConfigModel, true);
      await reconcileResources(manifests || [], existingManifests || [], MachineConfigModel);
      await k8sPatch({
        resource: agentClusterInstall,
        data: customManifestPatches,
        model: AgentClusterInstallModel,
      });
    }
  },
};
