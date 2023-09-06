import { Alert } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../common/utils';

const ProvisioningConfigErrorAlert = ({ error }: { error: unknown }) => {
  const { t } = useTranslation();
  if (!error) {
    return null;
  }
  return (
    <Alert title={t('ai:Failed to get Provisioning Configuration')} variant="danger" isInline>
      {getErrorMessage(error)}
    </Alert>
  );
};

export default ProvisioningConfigErrorAlert;
