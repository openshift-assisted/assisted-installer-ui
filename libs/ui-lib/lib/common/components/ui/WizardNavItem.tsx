import React, { PropsWithChildren, ReactNode } from 'react';
import { WizardNavItem, WizardNavItemProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import UiIcon from './UiIcon';

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
        <UiIcon
          status="danger"
          className="wizard-nav-item-warning-icon"
          icon={<ExclamationCircleIcon />}
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
