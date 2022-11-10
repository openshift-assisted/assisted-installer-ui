import React from 'react';
import { Button, ButtonVariant, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../common';
import { isSingleClusterMode, routeBasePath } from '../../config';

export const getErrorStateActions = () => {
  if (isSingleClusterMode()) {
    return [];
  }

  return [
    <Button
      key="cancel"
      variant={ButtonVariant.secondary}
      component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
    >
      Back
    </Button>,
  ];
};

export const ClusterUiError = () => (
  <PageSection variant={PageSectionVariants.light} isFilled>
    <ErrorState
      title="Failed to retrieve the default configuration"
      actions={getErrorStateActions()}
    />
  </PageSection>
);
