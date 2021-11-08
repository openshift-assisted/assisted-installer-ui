import useSWR from 'swr';
import React, { PropsWithChildren } from 'react';
import FeatureSupportLevelContext, {
  EmptyFeatureSupportLevelData,
} from '../../common/contexts/FeatureSupportLevelContext';
import { getErrorMessage, handleApiError } from '../api/utils';
import { FeatureSupportLevels, useAlerts } from '../../common';
import { FeatureSupportLevelsAPI } from '../services/api';
import FeatureSupportLevelData from './FeatureSupportLevelData';

export type SupportLevelProviderProps = PropsWithChildren<{
  clusterFeatureUsage?: string;
  openshiftVersion?: string;
  loadingUi: React.ReactNode;
}>;

export const FeatureSupportLevelProvider = ({
  children,
  loadingUi,
  clusterFeatureUsage,
  openshiftVersion,
}: SupportLevelProviderProps) => {
  const alerts = useAlerts();
  const fetcher = () => FeatureSupportLevelsAPI.list().then((res) => res.data);
  const { data: globalSupportLevel, error } = useSWR<FeatureSupportLevels>(
    FeatureSupportLevelsAPI.makeBaseURI(),
    fetcher,
    { errorRetryCount: 0, revalidateOnFocus: false },
  );
  const isLoading = !globalSupportLevel && !error;

  const supportLevelData = React.useMemo(() => {
    if (!globalSupportLevel || error) {
      return new EmptyFeatureSupportLevelData();
    }
    return new FeatureSupportLevelData(globalSupportLevel, openshiftVersion, clusterFeatureUsage);
  }, [clusterFeatureUsage, openshiftVersion, globalSupportLevel, error]);

  React.useEffect(() => {
    if (error) {
      const alertTitle = 'Failed to retrieve feature support levels';
      if (alerts.alerts.find((alert) => alert.title === alertTitle)) {
        //TODO(brotman): solve multiple error issues in alerts context provider
        return;
      }
      alerts.addAlert({
        title: alertTitle,
        message: getErrorMessage(error),
      });
      handleApiError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <FeatureSupportLevelContext.Provider value={supportLevelData}>
      {isLoading ? loadingUi : children}
    </FeatureSupportLevelContext.Provider>
  );
};

export default FeatureSupportLevelProvider;
