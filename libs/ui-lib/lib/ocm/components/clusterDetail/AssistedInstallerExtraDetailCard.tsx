import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { useSelector } from 'react-redux';

import {
  AlertsContextProvider,
  CpuArchitecture,
  FeatureGateContextProvider,
  FeatureListType,
} from '../../../common';
import ClusterProperties from './ClusterProperties';
import { selectCurrentClusterState } from '../../selectors';
import { Grid } from '@patternfly/react-core';
import { NewFeatureSupportLevelProvider } from '../newFeatureSupportLevels';
import useInfraEnv from '../../hooks/useInfraEnv';
import { usePullSecret } from '../../hooks';

type AssistedInstallerExtraDetailCardProps = {
  allEnabledFeatures: FeatureListType;
};

const AssistedInstallerExtraDetailCard: React.FC<AssistedInstallerExtraDetailCardProps> = ({
  allEnabledFeatures,
}) => {
  const { data: cluster } = useSelector(selectCurrentClusterState);
  const pullSecret = usePullSecret();
  const { infraEnv } = useInfraEnv(
    cluster?.id ? cluster?.id : '',
    cluster?.cpuArchitecture ? (cluster.cpuArchitecture as CpuArchitecture) : CpuArchitecture.x86,
    cluster?.name,
    pullSecret,
    cluster?.openshiftVersion,
  );

  if (!cluster || cluster.status === 'adding-hosts') {
    return null;
  }

  return (
    <FeatureGateContextProvider features={allEnabledFeatures}>
      <AlertsContextProvider>
        <NewFeatureSupportLevelProvider
          loadingUi={<div />}
          cluster={cluster}
          cpuArchitecture={infraEnv?.cpuArchitecture}
          openshiftVersion={cluster.openshiftVersion}
        >
          <Grid className="pf-u-mt-md">
            <ClusterProperties cluster={cluster} externalMode />
          </Grid>
        </NewFeatureSupportLevelProvider>
      </AlertsContextProvider>
    </FeatureGateContextProvider>
  );
};

const Wrapper: React.FC<AssistedInstallerExtraDetailCardProps> = (props) => (
  <Provider store={store}>
    <AlertsContextProvider>
      <AssistedInstallerExtraDetailCard {...props} />
    </AlertsContextProvider>
  </Provider>
);

export default Wrapper;
