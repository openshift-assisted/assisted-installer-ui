import React from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, Icon, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

type PopoverIconProps = PopoverProps & {
  variant?: ButtonProps['variant'];
  component?: ButtonProps['component'];
  IconComponent?: React.ComponentClass<SVGIconProps>;
  noVerticalAlign?: boolean;
  buttonClassName?: string;
  buttonOuiaId?: string;
  buttonStyle?: React.CSSProperties;
};

const PopoverIcon: React.FC<PopoverIconProps> = ({
  component,
  variant = 'plain',
  IconComponent = OutlinedQuestionCircleIcon,
  noVerticalAlign = false,
  buttonClassName,
  buttonOuiaId,
  buttonStyle,
  ...props
}) => (
  <Popover {...props}>
    <Button
      component={component}
      variant={variant}
      onClick={(e) => e.preventDefault()}
      className={classNames('pf-v5-c-form__group-label-help', 'pf-v5-u-p-0', buttonClassName)}
      ouiaId={buttonOuiaId}
      style={buttonStyle}
    >
      <Icon isInline={noVerticalAlign}>
        <IconComponent />
      </Icon>
    </Button>
  </Popover>
);

export default PopoverIcon;
