import React, { PropsWithChildren, ReactNode } from 'react';
import { Icon, WizardNavItem, WizardNavItemProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

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
        <Icon status="danger" className="wizard-nav-item-warning-icon">
          <ExclamationCircleIcon />
        </Icon>
      </>
    );
  }
  return content;
};

type NavItemProps = PropsWithChildren<WizardNavItemProps & { isValid?: () => boolean }>;
const NavItem = ({ isValid = () => true, children, ...props }: NavItemProps) => {
  const { content, isDisabled, isCurrent } = props;

  return (
    <WizardNavItem
      {...props}
      content={getNavItemContent(content, isValid, isDisabled, isCurrent)}
      data-testid="cluster-wizard-navitem"
    >
      {children}
    </WizardNavItem>
  );
};

export default NavItem;
