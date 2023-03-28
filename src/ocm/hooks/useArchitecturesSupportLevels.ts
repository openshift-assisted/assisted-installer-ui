import React from 'react';
import { ArchitectureSupportLevelId, SupportLevel, useAlerts } from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import NewFeatureSupportLevelsAPI from '../services/apis/NewFeatureSupportLevelsAPI';

export default function useArchitectureSupportLevels(
  openshiftVersion?: string,
): Record<ArchitectureSupportLevelId, SupportLevel> | null {
  const [cpuArchitectures, setCpuArchitectures] = React.useState<Record<
    ArchitectureSupportLevelId,
    SupportLevel
  > | null>(null);
  const { addAlert } = useAlerts();

  const fetchArchitecturesSupportLevels = React.useCallback(
    async (openshiftVersion: string) => {
      try {
        const { data: architectures } = await NewFeatureSupportLevelsAPI.architecturesSupportLevel(
          openshiftVersion,
        );
        setCpuArchitectures(architectures);
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

  React.useEffect(() => {
    if (openshiftVersion) {
      void fetchArchitecturesSupportLevels(openshiftVersion);
    }
  }, [openshiftVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  return cpuArchitectures;
}
