import React from 'react';
import { EmptyState, EmptyStateBody, Title } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

const NoPermissionsError = () => (
  <EmptyState id="not-found" icon={ExclamationTriangleIcon}>
    <EmptyStateBody>
      <Title headingLevel="h2">Access permissions needed</Title>
      <EmptyStateBody>
        To create a cluster using the Assisted Installer, ask your organization administrator to
        adjust your permissions.
      </EmptyStateBody>
    </EmptyStateBody>
  </EmptyState>
);

export default NoPermissionsError;
