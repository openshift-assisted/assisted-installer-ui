import React from 'react';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

const NoPermissionsError = () => (
  <EmptyState
    id="not-found"
    icon={() => (
      <ExclamationTriangleIcon style={{ color: 'var(--pf-v6-global--warning-color--100)' }} /> //CODEMODs TODO: verify this color token
    )}
    titleText="Access permissions needed"
    headingLevel="h2"
  >
    <EmptyStateBody>
      To create a cluster using the Assisted Installer, ask your organization administrator to
      adjust your permissions.
    </EmptyStateBody>
  </EmptyState>
);

export default NoPermissionsError;
