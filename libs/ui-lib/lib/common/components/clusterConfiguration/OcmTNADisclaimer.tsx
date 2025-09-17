import React from 'react';
import { Alert, AlertVariant, List, ListItem } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const OcmTNADisclaimer = () => {
  const { t } = useTranslation();

  return (
    <Alert
      variant={AlertVariant.info}
      title={t('ai:Requirements for Two Node control plane OpenShift')}
      isInline
    >
      <List>
        <ListItem>
          {t('ai:Two nodes control plane OpenShift must include an additional arbiter node.')}
        </ListItem>
      </List>
    </Alert>
  );
};

export default OcmTNADisclaimer;
