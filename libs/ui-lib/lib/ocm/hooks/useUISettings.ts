import React from 'react';
import { Cluster } from '@openshift-assisted/types/./assisted-installer-service';
import { UISettingService, UISettingsValues } from '../services';
import { ClustersAPI } from '../services/apis';

const useUISettings = (clusterId?: Cluster['id']) => {
  const [uiSettings, setUISettings] = React.useState<UISettingsValues>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  const updateUISettings = React.useCallback(
    async (newSettings: UISettingsValues) => {
      if (clusterId) {
        const updatedSettings = { ...uiSettings, ...newSettings };
        try {
          await UISettingService.update(clusterId, updatedSettings);
          setUISettings(updatedSettings);
        } catch (e) {
          throw new Error();
        }
      }
    },
    [clusterId, uiSettings],
  );

  React.useEffect(() => {
    const handleUISettingsError = async () => {
      if (clusterId) {
        try {
          const { data: customManifests } = await ClustersAPI.getManifests(clusterId);

          const mockUISettings: UISettingsValues = {
            addCustomManifests: !!customManifests.length,
            customManifestsAdded: !!customManifests.length,
          };

          setUISettings(mockUISettings);
        } catch (error) {
          setError('Failed to retrieve cluster custom manifests information');
        }
      }
    };

    const fetchUISettings = async () => {
      if (clusterId) {
        try {
          const settings = await UISettingService.fetch(clusterId);
          setUISettings(settings);
        } catch (e) {
          await handleUISettingsError();
        }
      } else {
        setUISettings({});
      }
      setLoading(false);
    };

    if (!uiSettings) {
      void fetchUISettings();
    }
  }, [clusterId, setUISettings, uiSettings]);

  const returnValue = React.useMemo(
    () => ({ uiSettings, loading, error, updateUISettings }),
    [uiSettings, loading, error, updateUISettings],
  );

  return returnValue;
};

export default useUISettings;
