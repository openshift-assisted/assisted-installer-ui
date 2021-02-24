import React from 'react';
import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

type PopoverIconProps = PopoverProps & {
  IconComponent?: React.ComponentClass<SVGIconProps>;
};

const PopoverIcon: React.FC<PopoverIconProps> = ({
  IconComponent = OutlinedQuestionCircleIcon,
  ...props
}) => (
  <Popover {...props}>
    <Button
      variant={ButtonVariant.link}
      onClick={(e) => e.preventDefault()}
      className="pf-c-form__group-label-help"
    >
      <IconComponent noVerticalAlign />
    </Button>
  </Popover>
);

export default PopoverIcon;
