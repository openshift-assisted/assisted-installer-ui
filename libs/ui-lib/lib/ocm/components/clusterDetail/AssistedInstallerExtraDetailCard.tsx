import React from 'react';
import { Provider } from 'react-redux';
import { storeDay1 } from '../../store';
import { useSelector } from 'react-redux';

import { AlertsContextProvider, CpuArchitecture, FeatureListType } from '../../../common';
import ClusterProperties from './ClusterProperties';
import { Grid } from '@patternfly/react-core';
import { NewFeatureSupportLevelProvider } from '../featureSupportLevels';
import useInfraEnv from '../../hooks/useInfraEnv';
import { usePullSecret } from '../../hooks';
import { selectCurrentClusterState } from '../../store/slices/current-cluster/selectors';
import { useFeatureDetection } from '../../hooks/use-feature-detection';
import { OpenShiftVersionsContextProvider } from '../clusterWizard/OpenShiftVersionsContext';

type AssistedInstallerExtraDetailCardProps = {
  allEnabledFeatures: FeatureListType;
};

const AssistedInstallerExtraDetailCard: React.FC<AssistedInstallerExtraDetailCardProps> = ({
  allEnabledFeatures,
}) => {
  useFeatureDetection(allEnabledFeatures);
  const { data: cluster } = useSelector(selectCurrentClusterState);
  const pullSecret = usePullSecret();
  const { infraEnv } = useInfraEnv(
    cluster?.id ? cluster?.id : '',
    cluster?.cpuArchitecture
      ? (cluster.cpuArchitecture as CpuArchitecture)
      : CpuArchitecture.USE_DAY1_ARCHITECTURE,
    cluster?.name,
    pullSecret,
    cluster?.openshiftVersion,
  );

  if (!cluster || cluster.status === 'adding-hosts') {
    return null;
  }

  return (
    <AlertsContextProvider>
      <NewFeatureSupportLevelProvider
        loadingUi={<div />}
        cluster={cluster}
        cpuArchitecture={infraEnv?.cpuArchitecture as CpuArchitecture}
        openshiftVersion={cluster.openshiftVersion}
        platformType={cluster.platform?.type}
      >
        <Grid className="pf-v6-u-mt-md">
          <ClusterProperties cluster={cluster} externalMode />
        </Grid>
      </NewFeatureSupportLevelProvider>
    </AlertsContextProvider>
  );
};

const Wrapper: React.FC<AssistedInstallerExtraDetailCardProps> = (props) => {
  return (
    <Provider store={storeDay1}>
      <AlertsContextProvider>
        <OpenShiftVersionsContextProvider>
          <AssistedInstallerExtraDetailCard {...props} />
        </OpenShiftVersionsContextProvider>
      </AlertsContextProvider>
    </Provider>
  );
};

export default Wrapper;
