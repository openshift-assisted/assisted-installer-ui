import React from 'react';
import {
  K8sResourceCommon,
  Patch,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { AgentClusterInstallK8sResource } from '../types';
import { load } from 'js-yaml';
import { patchResource, reconcileResources } from './apis/utils';
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
      () => Object.values(manifestsData).map((manifest) => manifest.data),
      [manifestsData],
    );
    const isLoading = Object.values(manifestsData).some((manifest) => manifest.loaded === false);

    return { customManifests, isLoading };
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
    onFulfill?: () => void | Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onReject?: (e: any) => void,
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

      await reconcileResources(
        manifests || [],
        existingManifests || [],
        MachineConfigModel,
        onFulfill,
        onReject,
      );
      await patchResource(agentClusterInstall, customManifestPatches, AgentClusterInstallModel);
    }
  },
};
