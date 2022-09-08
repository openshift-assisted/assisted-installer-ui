import React from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

type PopoverIconProps = PopoverProps & {
  variant?: ButtonProps['variant'];
  component?: ButtonProps['component'];
  IconComponent?: React.ComponentClass<SVGIconProps>;
  noVerticalAlign?: boolean;
  buttonClassName?: string;
  buttonOuiaId?: string;
};

const PopoverIcon: React.FC<PopoverIconProps> = ({
  component,
  variant = 'plain',
  IconComponent = OutlinedQuestionCircleIcon,
  noVerticalAlign = false,
  buttonClassName,
  buttonOuiaId,
  ...props
}) => (
  <Popover {...props}>
    <Button
      component={component}
      variant={variant}
      onClick={(e) => e.preventDefault()}
      className={classNames('pf-c-form__group-label-help', 'pf-u-p-0', buttonClassName)}
      ouiaId={buttonOuiaId}
    >
      <IconComponent noVerticalAlign={noVerticalAlign} />
    </Button>
  </Popover>
);

export default PopoverIcon;
