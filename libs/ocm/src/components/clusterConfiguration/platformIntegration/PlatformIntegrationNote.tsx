import React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { UiIcon, SupportedPlatformType } from '@openshift-assisted/common';
import { ExternalPlatformLinks } from './constants';

const PlatformIntegrationNote = ({ platformType }: { platformType: SupportedPlatformType }) => {
  const integrationPlatformLink = ExternalPlatformLinks[platformType];
  return (
    <p>
      <UiIcon status="warning" icon={<ExclamationTriangleIcon />} /> You will need to modify your
      platform configuration after cluster installation is completed.{' '}
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
