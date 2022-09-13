import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type FormatDiskWarningProps = {
  someDisksAreSkipFormatting?: boolean;
};

const FormatDiskWarning = ({ someDisksAreSkipFormatting }: FormatDiskWarningProps) => {
  const { t } = useTranslation();
  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title={
        someDisksAreSkipFormatting
          ? t('ai:Some bootable disks are set to skip formatting')
          : t(
              'ai:All bootable disks will be formatted during installation. Make sure to backup any sensitive data.',
            )
      }
    >
      {someDisksAreSkipFormatting
        ? t("ai:Make sure those disks don't interrupt the boot order of the hosts.")
        : ''}
    </Alert>
  );
};

export default FormatDiskWarning;
