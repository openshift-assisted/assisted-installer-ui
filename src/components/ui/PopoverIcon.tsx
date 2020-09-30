import React from 'react';
import { Popover } from '@patternfly/react-core';
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
    <button onClick={(e) => e.preventDefault()} className="pf-c-form__group-label-help">
      <IconComponent noVerticalAlign />
    </button>
  </Popover>
);

export default PopoverIcon;
