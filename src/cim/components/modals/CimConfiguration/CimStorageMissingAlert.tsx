import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

export const CimStorageMissingAlert: React.FC<{
  docStorageUrl: string;
  storageOperatorUrl: string;
}> = ({ docStorageUrl, storageOperatorUrl }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const contentWorkaround = (
    <>
      {t('ai:Learn more about storage class')}&nbsp;&nbsp;
      <ExternalLinkAltIcon />
    </>
  );

  const actionLinks: React.ReactNode[] = [
    <AlertActionLink
      key="install-storage-operator"
      onClick={() => history.push(storageOperatorUrl)}
    >
      {t('ai:Install storage operator')}
    </AlertActionLink>,
    <AlertActionLink key="storage-class" onClick={() => window.open(docStorageUrl, '_blank')}>
      {contentWorkaround as unknown as string}
    </AlertActionLink>,
  ];

  return (
    <Alert
      title={t('ai:Must create a storage class')}
      variant={AlertVariant.warning}
      isInline
      actionLinks={actionLinks}
    >
      {t(
        'ai:In order to configure the host inventory settings, you must create a storage class. We recommend installing OpenShift Data Foundation operator, but you can use any storage operator.',
      )}
    </Alert>
  );
};
