import React from 'react';
import { Alert, AlertVariant, List, ListItem, Stack, StackItem } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const OcmTNADisclaimer = () => {
  const { t } = useTranslation();
  const generalSNOFacts = (
    <>
      <ListItem>
        {t('ai:Two nodes control plane OpenShift must include an additional arbiter node.')}
      </ListItem>
    </>
  );

  return (
    <Alert
      variant={AlertVariant.info}
      title={t('ai:Requirements for Two Node control plane OpenShift')}
      isInline
    >
      <Stack hasGutter>
        <StackItem>
          <List>{generalSNOFacts}</List>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default OcmTNADisclaimer;
