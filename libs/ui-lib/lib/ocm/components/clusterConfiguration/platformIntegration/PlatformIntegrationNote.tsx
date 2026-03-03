import React from 'react';
import { Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { SupportedPlatformType } from '../../../../common';
import { ExternalPlatformLinks } from './constants';

const PlatformIntegrationNote = ({ platformType }: { platformType: SupportedPlatformType }) => {
  const integrationPlatformLink = ExternalPlatformLinks[platformType];
  return (
    <p>
      <Icon status="warning">
        <ExclamationTriangleIcon />
      </Icon>{' '}
      You will need to modify your platform configuration after cluster installation is completed.{' '}
      {!!integrationPlatformLink && (
        <a
          href={integrationPlatformLink || ''}
          target="_blank"
          rel="noopener noreferrer"
          data-ouia-component-id="vm-integration-kb-page"
        >
          Learn more <i className="fas fa-external-link-alt" />
        </a>
      )}
    </p>
  );
};

export default PlatformIntegrationNote;
