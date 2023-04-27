import React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { SupportedPlatformType } from '../../../../common';

import { integrationPlatformLinks } from '../../clusterWizard/ClusterPlatformIntegrationHint';

const PlatformIntegrationNote = ({ platformType }: { platformType: SupportedPlatformType }) => {
  const integrationPlatformLink = integrationPlatformLinks[platformType];
  return (
    <p>
      <ExclamationTriangleIcon color={warningColor.value} size="sm" /> You will need to modify your
      platform configuration after cluster installation is completed.{' '}
      <a
        href={integrationPlatformLink || ''}
        target="_blank"
        rel="noopener noreferrer"
        data-ouia-component-id="vm-integration-kb-page"
      >
        Learn more <i className="fas fa-external-link-alt" />
      </a>
    </p>
  );
};

export default PlatformIntegrationNote;
