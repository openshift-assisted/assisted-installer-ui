import React, { PropsWithChildren } from 'react';
import { Button, ButtonProps, ButtonVariant } from '@patternfly/react-core';

export const InlineLink = ({ children, ...otherProps }: PropsWithChildren<ButtonProps>) => (
  <Button variant={ButtonVariant.link} isInline {...otherProps}>
    {children}
  </Button>
);
