import React from 'react';
import { DownloadIcon } from '@patternfly/react-icons';
import { global_Color_200 as greyColor } from '@patternfly/react-tokens';

const style = {
  padding: '.3em',
  borderRadius: '50%',
  border: '1px solid',
  borderColor: greyColor.value,
  boxSizing: 'content-box',
  verticalAlign: '-1.125em',
};

type BorderedIconProps = {
  children: React.ReactElement<React.ComponentProps<typeof DownloadIcon>>;
};

const BorderedIcon = ({ children }: BorderedIconProps) => React.cloneElement(children, { style });

export default BorderedIcon;
