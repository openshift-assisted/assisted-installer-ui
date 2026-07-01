import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { ErrorState } from '../../../common';
import { BackButton } from '../ui';

export const ClusterPageError = () => (
  <PageSection hasBodyWrapper={false} isFilled>
    <ErrorState
      title="Failed to retrieve the default configuration"
      actions={[<BackButton key={'cancel'} to={'..'} />]}
    />
  </PageSection>
);
