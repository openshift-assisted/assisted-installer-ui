import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { useSelector } from 'react-redux';

import { FeatureGateContextProvider, FeatureListType } from '../../../common';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import ClusterProperties from './ClusterProperties';
import { selectCurrentClusterState } from '../../selectors';
import { Grid } from '@patternfly/react-core';

type AssistedInstallerExtraDetailCardProps = {
  allEnabledFeatures: FeatureListType;
};

const AssistedInstallerExtraDetailCard: React.FC<AssistedInstallerExtraDetailCardProps> = ({
  allEnabledFeatures,
}) => {
  const { data: cluster } = useSelector(selectCurrentClusterState);

  if (!cluster || cluster.status === 'adding-hosts') {
    return null;
  }

  return (
    <FeatureGateContextProvider features={allEnabledFeatures}>
      <FeatureSupportLevelProvider loadingUi={<div />} cluster={cluster}>
        <Grid className="pf-u-mt-md">
          <ClusterProperties cluster={cluster} externalMode />
        </Grid>
      </FeatureSupportLevelProvider>
    </FeatureGateContextProvider>
  );
};

const Wrapper: React.FC<AssistedInstallerExtraDetailCardProps> = (props) => (
  <Provider store={store}>
    <AssistedInstallerExtraDetailCard {...props} />
  </Provider>
);

export default Wrapper;
