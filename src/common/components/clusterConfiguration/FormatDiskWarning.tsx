import React from 'react';
import { Text } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const FormatDiskWarning = () => {
  const { t } = useTranslation();
  return (
    <Text component="p">
      <ExclamationTriangleIcon className="status-icon" color={warningColor.value} size="sm" />
      &nbsp;{t('ai:All bootable disks will be formatted during installation')}
    </Text>
  );
};

export default FormatDiskWarning;
