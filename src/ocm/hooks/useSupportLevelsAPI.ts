import React from 'react';
import { useAlerts } from '../../common';
import {
  ArchitectureSupportLevelMap,
  NewFeatureSupportLevelMap,
} from '../../common/components/newFeatureSupportLevels';
import { getApiErrorMessage, handleApiError } from '../api';
import NewFeatureSupportLevelsAPI from '../services/apis/NewFeatureSupportLevelsAPI';

type SupportLevelAPIResources = 'architectures' | 'features';
type UseSupportLevelAPIResponse<T extends SupportLevelAPIResources> = T extends 'architectures'
  ? ArchitectureSupportLevelMap | null
  : T extends 'features'
  ? NewFeatureSupportLevelMap | null
  : null;

export default function useSupportLevelsAPI<T extends SupportLevelAPIResources>(
  resourceKind: T,
  openshiftVersion?: string,
  cpuArchitecture?: string,
): UseSupportLevelAPIResponse<T> | null {
  const [cpuArchitectures, setCpuArchitectures] =
    React.useState<ArchitectureSupportLevelMap | null>(null);
  const [features, setFeatures] = React.useState<NewFeatureSupportLevelMap | null>(null);
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
    async (openshiftVersion: string, cpuArchitecture?: string) => {
      try {
        const { data: features } = await NewFeatureSupportLevelsAPI.featuresSupportLevel(
          openshiftVersion,
          cpuArchitecture,
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

  React.useEffect(() => {
    if (openshiftVersion) {
      if (resourceKind === 'architectures') {
        void fetchArchitecturesSupportLevels(openshiftVersion);
      } else {
        void fetchFeaturesSupportLevels(openshiftVersion, cpuArchitecture);
      }
    }
  }, [
    openshiftVersion,
    cpuArchitecture,
    fetchArchitecturesSupportLevels,
    fetchFeaturesSupportLevels,
    resourceKind,
  ]);

  if (resourceKind === 'architectures') {
    return cpuArchitectures as UseSupportLevelAPIResponse<T>;
  } else {
    return features as UseSupportLevelAPIResponse<T>;
  }
}
