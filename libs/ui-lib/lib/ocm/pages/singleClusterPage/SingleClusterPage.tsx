import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '../../../common';
import { AssistedInstallerHeader } from '../../components';
import { ClusterPageGeneric } from '../clusterPage';

export const SingleClusterPage = ({
  clusterId,
  resetModal,
}: {
  clusterId: string;
  resetModal: React.ReactNode;
}) => (
  <AlertsContextProvider>
    <PageSection hasBodyWrapper={false} isFilled>
      <AssistedInstallerHeader />
    </PageSection>
    <ClusterPageGeneric clusterId={clusterId} resetModal={resetModal} />
  </AlertsContextProvider>
);
