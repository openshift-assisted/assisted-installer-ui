import useSWR from 'swr';
import React, { PropsWithChildren } from 'react';
import FeatureSupportLevelContext, {
  DefaultFeatureSupportLevelData,
} from '../../common/contexts/FeatureSupportLevelContext';
import { handleApiError } from '../api/utils';
import { FeatureSupportLevels } from '../../common';
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
  const fetcher = () => FeatureSupportLevelsAPI.list().then((res) => res.data);
  const { data: featureSupportLevels, error } = useSWR<FeatureSupportLevels>(
    FeatureSupportLevelsAPI.makeBaseURI(),
    fetcher,
    { errorRetryCount: 0, revalidateOnFocus: false },
  );
  const isLoading = !featureSupportLevels && !error;

  const supportLevelData = React.useMemo(() => {
    if (!featureSupportLevels || error) {
      return new DefaultFeatureSupportLevelData();
    }
    console.log(
      new FeatureSupportLevelData(featureSupportLevels, openshiftVersion, clusterFeatureUsage),
    );
    return new FeatureSupportLevelData(featureSupportLevels, openshiftVersion, clusterFeatureUsage);
  }, [error, clusterFeatureUsage, openshiftVersion, featureSupportLevels]);

  React.useEffect(() => {
    if (error) {
      //handling api error is enough, no need for a blocking alert in the UI since the application can work well without the support level information
      handleApiError(error);
    }
  }, [error]);

  return (
    <FeatureSupportLevelContext.Provider value={supportLevelData}>
      {isLoading ? loadingUi : children}
    </FeatureSupportLevelContext.Provider>
  );
};

export default FeatureSupportLevelProvider;
