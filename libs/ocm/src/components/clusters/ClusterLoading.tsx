import { PageSection } from '@patternfly/react-core';
import { LoadingState } from '@openshift-assisted/common';
import React from 'react';

const ClusterLoading = () => (
  <PageSection hasBodyWrapper={false} isFilled>
    <LoadingState />
  </PageSection>
);

export default ClusterLoading;
