import React from 'react';
import { Provider } from 'react-redux';
import { storeDay1 } from '../../store';
import { useSelector } from 'react-redux';

import {
  AlertsContextProvider,
  FeatureGateContextProvider,
  FeatureListType,
} from '../../../common';
import ClusterProperties from './ClusterProperties';
import { Grid } from '@patternfly/react-core';
import { selectCurrentClusterState } from '../../store/slices/current-cluster/selectors';

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
      <AlertsContextProvider>
        <Grid className="pf-u-mt-md">
          <ClusterProperties cluster={cluster} externalMode />
        </Grid>
      </AlertsContextProvider>
    </FeatureGateContextProvider>
  );
};

const Wrapper: React.FC<AssistedInstallerExtraDetailCardProps> = (props) => (
  <Provider store={storeDay1}>
    <AlertsContextProvider>
      <AssistedInstallerExtraDetailCard {...props} />
    </AlertsContextProvider>
  </Provider>
);

export default Wrapper;
