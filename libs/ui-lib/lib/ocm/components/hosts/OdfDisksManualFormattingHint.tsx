import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';

const OdfDisksManualFormattingHint = () => {
  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title="Make sure you format all non-installation disks"
    >
      All non-installation disks will be used for local storage and must be formatted before the
      storage operator's installation. To view and format available disks, expand each host row in
      the table.
    </Alert>
  );
};

export default OdfDisksManualFormattingHint;
