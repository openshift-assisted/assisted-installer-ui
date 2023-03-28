import React from 'react';
import { SupportLevels, useAlerts } from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import NewFeatureSupportLevelsAPI from '../services/apis/NewFeatureSupportLevelsAPI';

export default function useSupportLevels(openshiftVersion?: string, cpuArchitecture?: string) {
  const [features, setFeatures] = React.useState<SupportLevels>();
  const { addAlert } = useAlerts();

  const fetchFeatures = React.useCallback(
    async (openshiftVersion?: string, cpuArchitecture?: string) => {
      try {
        if (openshiftVersion) {
          const { data: features } = await NewFeatureSupportLevelsAPI.featuresSupportLevel(
            openshiftVersion,
            cpuArchitecture,
          );
          setFeatures(features);
        } else setFeatures({});
      } catch (e) {
        setFeatures({});
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve feature by Openhift Version',
            message: getApiErrorMessage(e),
          }),
        );
      }
    },
    [addAlert],
  );

  React.useEffect(() => {
    if (!features) {
      void fetchFeatures(openshiftVersion, cpuArchitecture);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    features,
  };
}
