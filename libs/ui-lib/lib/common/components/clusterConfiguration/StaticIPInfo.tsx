import React from 'react';
import { Alert, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { getOCPStaticIPDocLink } from '../../config/docs_links';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const StaticIPInfo = ({ docVersion }: { docVersion?: string }) => {
  const { t } = useTranslation();
  return (
    <Alert
      title={t(
        'ai:To use static network configuration, follow the steps listed in the documentation.',
      )}
      isInline
      variant="info"
    >
      <Button
        variant="link"
        icon={<ExternalLinkAltIcon />}
        iconPosition="right"
        isInline
        onClick={() =>
          window.open(getOCPStaticIPDocLink(docVersion), '_blank', 'noopener,noreferrer')
        }
      >
        {t('ai:View documentation')}
      </Button>
    </Alert>
  );
};
