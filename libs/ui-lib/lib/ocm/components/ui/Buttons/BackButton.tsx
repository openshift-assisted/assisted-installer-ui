import { Link, LinkProps } from 'react-router-dom-v5-compat';
import type { ButtonProps } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import React from 'react';

export type BackButtonProps = {
  to: LinkProps['to'];
  variant?: ButtonProps['variant'];
};
export const BackButton = ({ to, variant = 'secondary' }: BackButtonProps) => (
  <Button variant={variant} component={(props) => <Link to={to} {...props} />}>
    Back
  </Button>
);
