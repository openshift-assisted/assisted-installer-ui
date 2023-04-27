import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import type { LocationState } from 'history';
import type { ButtonProps } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import React from 'react';

export type BackButtonProps = {
  to: LinkProps<LocationState>['to'];
  variant?: ButtonProps['variant'];
};
export const BackButton = ({ to, variant = 'secondary' }: BackButtonProps) => (
  <Button variant={variant} component={(props) => <Link to={to} {...props} />}>
    Back
  </Button>
);
