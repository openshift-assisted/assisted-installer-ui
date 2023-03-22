import React from 'react';
import { SupportLevels, useAlerts } from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import NewFeatureSupportLevelsAPI from '../services/apis/NewFeatureSupportLevelsAPI';

export default function useCpuArchitectures(openshiftVersion?: string) {
  const [cpuArchitectures, setCpuArchitectures] = React.useState<SupportLevels>();
  const { addAlert } = useAlerts();

  const fetchArchitectures = React.useCallback(
    async (openshiftVersion?: string) => {
      try {
        if (openshiftVersion) {
          const { data: architectures } = await NewFeatureSupportLevelsAPI.listArchitectures(
            openshiftVersion,
          );
          setCpuArchitectures(architectures);
        } else setCpuArchitectures({});
      } catch (e) {
        setCpuArchitectures({});
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve cpu architectures',
            message: getApiErrorMessage(e),
          }),
        );
      }
    },
    [addAlert],
  );

  React.useEffect(() => {
    void fetchArchitectures(openshiftVersion);
  }, [openshiftVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cpuArchitectures,
  };
}
