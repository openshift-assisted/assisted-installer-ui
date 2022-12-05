import * as React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

export const CimIsMissingAlert: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Alert
      isInline
      variant={AlertVariant.warning}
      title={t('ai:Can not manage hosts until Central Infrastructure Management is set up.')}
    />
  );
};
