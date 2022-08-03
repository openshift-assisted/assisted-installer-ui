import React from 'react';
import { Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';

interface PopoverHelperIconProps extends PopoverProps {
  ouiaId?: string;
}

const PopoverHelperIcon = ({ ouiaId, ...props }: PopoverHelperIconProps) => (
  <Popover {...props}>
    <OutlinedQuestionCircleIcon
      noVerticalAlign
      data-ouia-component-id={ouiaId}
      onClick={(e) => e.preventDefault()}
    />
  </Popover>
);

export default PopoverHelperIcon;
