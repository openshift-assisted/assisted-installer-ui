import { Alert } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import { getErrorMessage } from '@openshift-assisted/common/utils';

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
