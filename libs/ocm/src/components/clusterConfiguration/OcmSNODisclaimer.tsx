import React from 'react';
import { Alert, AlertVariant, List, ListItem } from '@patternfly/react-core';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';

type OcmSNODisclaimerProps = {
  snoExpansionSupported?: boolean;
};
const OcmSNODisclaimer = ({ snoExpansionSupported = false }: OcmSNODisclaimerProps) => {
  const { t } = useTranslation();

  return (
    <Alert
      variant={AlertVariant.info}
      title={t('ai:Limitations for using Single Node OpenShift')}
      isInline
    >
      <List>
        <ListItem>
          {t(
            'ai:Installing SNO will result in an OpenShift deployment that is not highly available.',
          )}
        </ListItem>
        {!snoExpansionSupported && (
          <ListItem>
            {t('ai:Currently, adding additional machines to your cluster is not supported.')}
          </ListItem>
        )}
      </List>
    </Alert>
  );
};

export default OcmSNODisclaimer;
