import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { LoadingState } from '../../../common';
import React from 'react';

const ClusterLoading = () => (
  <PageSection variant={PageSectionVariants.light} isFilled>
    <LoadingState />
  </PageSection>
);

export default ClusterLoading;
