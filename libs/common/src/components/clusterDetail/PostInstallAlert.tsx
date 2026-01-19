import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { ExternalLink } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type PostInstallAlertProps = {
  link: string;
};

const PostInstallAlert = ({ link }: PostInstallAlertProps) => {
  const { t } = useTranslation();
  return (
    <Alert
      variant="warning"
      isInline
      data-testid="alert-modify-platform-config"
      title={
        <p>
          {t(
            "ai:Modify your platform configuration to access your platform's features directly in OpenShift.",
          )}{' '}
          <ExternalLink href={link}>{t('ai:Learn more about configuration.')}</ExternalLink>
        </p>
      }
    />
  );
};

export default PostInstallAlert;
