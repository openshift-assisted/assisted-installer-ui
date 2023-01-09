import React from 'react';
import { Alert, AlertVariant, Text, TextContent, TextVariants } from '@patternfly/react-core';

const Hint = () => (
  <TextContent>
    <Text component={TextVariants.p}>
      All non-installation disks will be used for local storage and must be formatted before the
      storage operator's installation. To view and format available disks, expand each host row in
      the table.
    </Text>
  </TextContent>
);

const OdfDisksManualFormattingHint = () => {
  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title="Make sure you format all non-installation disks"
    >
      <Hint />
    </Alert>
  );
};

export default OdfDisksManualFormattingHint;
