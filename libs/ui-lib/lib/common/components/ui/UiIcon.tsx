import React, { ReactElement } from 'react';
import { Icon, IconComponentProps } from '@patternfly/react-core';

export type UiIconProps = {
  size?: IconComponentProps['size'];
  status?: IconComponentProps['status'] | undefined;
  color?: string;
  icon?: ReactElement;
  className?: string;
};

const UiIcon: React.FC<UiIconProps> = (props) => {
  return (
    <>
      <Icon
        size={props.size ? props.size : 'md'}
        status={props.status}
        className={props.className}
        color={props.color}
      >
        {props.icon}
      </Icon>
    </>
  );
};

export default UiIcon;
