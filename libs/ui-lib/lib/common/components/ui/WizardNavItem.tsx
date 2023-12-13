import React, { PropsWithChildren, ReactNode } from 'react';
import { WizardNavItem, WizardNavItemProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';

const getNavItemContent = (
  content: ReactNode,
  isValid: () => boolean,
  isDisabled?: boolean,
  isCurrent?: boolean,
): ReactNode => {
  if (!isDisabled && !isCurrent && !isValid()) {
    return (
      <>
        {content}
        <ExclamationCircleIcon
          className="wizard-nav-item-warning-icon"
          color={dangerColor.value}
          size="sm"
        />
      </>
    );
  }
  return content;
};

type NavItemProps = PropsWithChildren<WizardNavItemProps & { isValid?: () => boolean }>;
const NavItem = ({ isValid = () => true, children, ...props }: NavItemProps) => {
  const { content, isDisabled, isCurrent } = props;

  return (
    <WizardNavItem {...props} content={getNavItemContent(content, isValid, isDisabled, isCurrent)}>
      {children}
    </WizardNavItem>
  );
};

export default NavItem;
