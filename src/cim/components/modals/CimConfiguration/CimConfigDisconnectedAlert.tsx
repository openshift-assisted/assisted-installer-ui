import * as React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

export const CimConfigDisconnectedAlert: React.FC<{
  docDisconnectedUrl: string;
}> = ({ docDisconnectedUrl }) => {
  const { t } = useTranslation();

  return (
    <Alert
      title={
        <Trans t={t}>
          ai:To configure for disconnected environments,{' '}
          <a href={docDisconnectedUrl} target="_blank" rel="noreferrer">
            view documentation <ExternalLinkAltIcon />
          </a>
        </Trans>
      }
      variant={AlertVariant.info}
      isInline
    />
  );
};
