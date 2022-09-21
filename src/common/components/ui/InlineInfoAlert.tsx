import { Alert, AlertProps } from '@patternfly/react-core';
import React from 'react';

export const InlineInfoAlert = (props: AlertProps) => (
  <Alert variant={'info'} isInline {...props} />
);
