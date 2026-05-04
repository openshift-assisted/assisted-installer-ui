import React from 'react';
import { useTranslation } from '../../../hooks';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { RED_HAT_CNI_SUPPORT_MATRIX_LINK } from '../../../config';
import { ExternalLink } from '../../ui';

export const ThirdPartyCNIBanner = () => {
  const { t } = useTranslation();

  return (
    <StackItem>
      <Alert variant={AlertVariant.warning} isInline title={t('ai:Third-party CNI')}>
        <Stack hasGutter>
          <StackItem>
            {t(
              'ai:Third-party CNIs require uploading CNI manifests. Please verify you have the required manifests and that the chosen CNI is compatible with your platform and OpenShift version.',
            )}
          </StackItem>
          <StackItem>
            <ExternalLink href={RED_HAT_CNI_SUPPORT_MATRIX_LINK}>
              {t('ai:Red Hat CNI Support Matrix')}
            </ExternalLink>
          </StackItem>
        </Stack>
      </Alert>
    </StackItem>
  );
};
