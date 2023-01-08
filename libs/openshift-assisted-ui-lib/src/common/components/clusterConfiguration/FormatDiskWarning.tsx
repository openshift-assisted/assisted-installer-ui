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
          ? t('ai:There may be issues with the boot order')
          : t(
              'ai:All bootable disks will be formatted during installation. Make sure to backup any sensitive data.',
            )
      }
    >
      {someDisksAreSkipFormatting
        ? t(
            'ai:You have opted out of formatting bootable disks on some hosts. To ensure the hosts reboot into the expected installation disk, manual user intervention may be required during OpenShift installation.',
          )
        : ''}
    </Alert>
  );
};

export default FormatDiskWarning;
