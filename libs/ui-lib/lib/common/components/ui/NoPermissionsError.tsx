import React from 'react';
import { EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { global_disabled_color_100 as iconColor } from '@patternfly/react-tokens/dist/js/global_disabled_color_100';

const NoPermissionsError = () => (
  <EmptyState id="not-found">
    <EmptyStateBody>
      <EmptyStateIcon icon={ExclamationTriangleIcon} color={iconColor.value} />
      <Title headingLevel="h2">Access permissions needed</Title>
      <EmptyStateBody>
        To create a cluster using the Assisted Installer, ask your organization administrator to
        adjust your permissions.
      </EmptyStateBody>
    </EmptyStateBody>
  </EmptyState>
);

export default NoPermissionsError;
