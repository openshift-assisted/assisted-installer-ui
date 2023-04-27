import { Alert } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const ValidationsRunningAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert
      variant="info"
      isInline
      title={t(
        'ai:Validations are running. If they take more than 2 minutes, please attend to the alert below.',
      )}
    />
  );
};

export default ValidationsRunningAlert;
