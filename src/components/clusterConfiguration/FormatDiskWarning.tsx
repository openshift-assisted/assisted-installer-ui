import React from 'react';
import { Text } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';

const FormatDiskWarning = () => (
  <Text component="p">
    <ExclamationTriangleIcon className="status-icon" color={warningColor.value} size="sm" />
    &nbsp;Note that all bootable disks will be formatted when the installation starts.
  </Text>
);

export default FormatDiskWarning;
