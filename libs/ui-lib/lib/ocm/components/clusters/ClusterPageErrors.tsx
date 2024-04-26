import React from 'react';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { ErrorState } from '../../../common';
import { BackButton } from '../ui/Buttons/BackButton';

export const ClusterUiError = () => (
  <PageSection variant={PageSectionVariants.light} isFilled>
    <ErrorState
      title="Failed to retrieve the default configuration"
      actions={[<BackButton key={'cancel'} to={'..'} />]}
    />
  </PageSection>
);
