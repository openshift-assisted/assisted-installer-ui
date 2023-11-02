import React from 'react';
import { CpuArchitecture, SupportedCpuArchitecture, useAlerts } from '../../common';
import {
  ArchitectureSupportLevelMap,
  NewFeatureSupportLevelMap,
} from '../../common/components/newFeatureSupportLevels';
import { getApiErrorMessage, handleApiError } from '../../common/api';
import NewFeatureSupportLevelsAPI from '../../common/api/assisted-service/NewFeatureSupportLevelsAPI';
import { PlatformType } from '@openshift-assisted/types/./assisted-installer-service';

type SupportLevelAPIResources = 'architectures' | 'features' | 'featureForAllCpus';
type UseSupportLevelAPIResponse<T extends SupportLevelAPIResources> = T extends 'architectures'
  ? ArchitectureSupportLevelMap | null
  : T extends 'features'
  ? NewFeatureSupportLevelMap | null
  : T extends 'featureForAllCpus'
  ? Record<SupportedCpuArchitecture, NewFeatureSupportLevelMap | null> | null
  : null;

export default function useSupportLevelsAPI<T extends SupportLevelAPIResources>(
  resourceKind: T,
  openshiftVersion?: string,
  cpuArchitecture?: CpuArchitecture,
  platformType?: PlatformType,
  supportedCpuArchitectures?: SupportedCpuArchitecture[],
): UseSupportLevelAPIResponse<T> | null {
  const [cpuArchitectures, setCpuArchitectures] =
    React.useState<ArchitectureSupportLevelMap | null>(null);
  const [features, setFeatures] = React.useState<NewFeatureSupportLevelMap | null>(null);
  const [supportLevelData, setSupportLevelData] =
    React.useState<Record<SupportedCpuArchitecture, NewFeatureSupportLevelMap | null>>();
  const { addAlert } = useAlerts();

  const fetchArchitecturesSupportLevels = React.useCallback(
    async (openshiftVersion: string) => {
      try {
        const { data: architectures } = await NewFeatureSupportLevelsAPI.architecturesSupportLevel(
          openshiftVersion,
        );
        setCpuArchitectures(architectures.architectures);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve cpu architectures',
            message: getApiErrorMessage(e),
          }),
        );
        setCpuArchitectures(null);
      }
    },
    [addAlert],
  );

  const fetchFeaturesSupportLevels = React.useCallback(
    async (
      openshiftVersion: string,
      cpuArchitecture?: CpuArchitecture,
      platformType?: PlatformType,
    ) => {
      try {
        const { data: features } = await NewFeatureSupportLevelsAPI.featuresSupportLevel(
          openshiftVersion,
          cpuArchitecture,
          platformType,
        );
        setFeatures(features.features);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve feature support levels',
            message: getApiErrorMessage(e),
          }),
        );
        setFeatures(null);
      }
    },
    [addAlert],
  );

  const fetchFeaturesSupportLevelsForAllCpuArchs = React.useCallback(
    async (
      supportedCpuArchitectures: SupportedCpuArchitecture[],
      openshiftVersion: string,
      platformType?: PlatformType,
    ) => {
      try {
        const data: Record<SupportedCpuArchitecture, NewFeatureSupportLevelMap | null> = {
          x86_64: null,
          arm64: null,
          ppc64le: null,
          s390x: null,
        };
        if (supportedCpuArchitectures) {
          for (const cpuArch of supportedCpuArchitectures) {
            const { data: features } = await NewFeatureSupportLevelsAPI.featuresSupportLevel(
              openshiftVersion,
              cpuArch,
              platformType,
            );
            data[cpuArch] = features.features;
          }
          setSupportLevelData(data);
        }
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve feature support levels',
            message: getApiErrorMessage(e),
          }),
        );
        setFeatures(null);
      }
    },
    [addAlert],
  );

  React.useEffect(() => {
    if (openshiftVersion) {
      if (resourceKind === 'architectures') {
        void fetchArchitecturesSupportLevels(openshiftVersion);
      } else if (resourceKind === 'featureForAllCpus' && supportedCpuArchitectures) {
        void fetchFeaturesSupportLevelsForAllCpuArchs(
          supportedCpuArchitectures,
          openshiftVersion,
          platformType,
        );
      } else {
        void fetchFeaturesSupportLevels(openshiftVersion, cpuArchitecture, platformType);
      }
    }
  }, [
    openshiftVersion,
    cpuArchitecture,
    fetchArchitecturesSupportLevels,
    fetchFeaturesSupportLevels,
    resourceKind,
    platformType,
    supportedCpuArchitectures,
    fetchFeaturesSupportLevelsForAllCpuArchs,
  ]);

  if (resourceKind === 'architectures') {
    return cpuArchitectures as UseSupportLevelAPIResponse<T>;
  } else if (resourceKind === 'featureForAllCpus') {
    return supportLevelData as UseSupportLevelAPIResponse<T>;
  } else {
    return features as UseSupportLevelAPIResponse<T>;
  }
}
