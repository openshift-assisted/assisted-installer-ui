import React from 'react';
import { Tooltip, RadioProps, TooltipProps } from '@patternfly/react-core';
import RadioField from './RadioField';
import { Optional } from '../../../types/typescriptExtensions';

type RadioFieldWithTooltipProps = Optional<RadioProps, 'id'> & { tooltipProps: TooltipProps };

const RadioFieldWithTooltip = ({
  tooltipProps,
  ...radioFieldProps
}: RadioFieldWithTooltipProps) => {
  return (
    <Tooltip {...tooltipProps}>
      <RadioField {...radioFieldProps} />
    </Tooltip>
  );
};

export default RadioFieldWithTooltip;
