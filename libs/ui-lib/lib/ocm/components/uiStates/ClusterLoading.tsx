import { PageSection } from '@patternfly/react-core';
import { LoadingState } from '../../../common';
import React from 'react';

export const ClusterLoading = () => (
  <PageSection hasBodyWrapper={false} isFilled>
    <LoadingState />
  </PageSection>
);
