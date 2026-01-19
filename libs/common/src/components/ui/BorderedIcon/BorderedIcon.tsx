import React from 'react';
import { IconComponentProps } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons/dist/js/icons/download-icon';

export const getPadding = (size: IconComponentProps['size']) => {
  switch (size) {
    case 'sm':
      return '0.3em';
    case 'md':
      return '1.5em';
    case 'lg':
      return '2em';
    case 'xl':
      return '3em';
    default:
      return '1em';
  }
};

export const getVerticalAlign = (size: IconComponentProps['size']) => {
  switch (size) {
    case 'sm':
      return '-0.3em';
    case 'md':
      return '-1.5em';
    case 'lg':
      return '-2em';
    case 'xl':
      return '-3em';
    default:
      return '-1em';
  }
};

type BorderedIconProps = {
  children: React.ReactElement<React.ComponentProps<typeof DownloadIcon>>;
  iconSize?: IconComponentProps['size'];
};

const BorderedIcon = ({ children, iconSize = 'sm' }: BorderedIconProps) => {
  const style: React.CSSProperties = {
    padding: `${getPadding(iconSize)}`,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: '#D2D2D2',
    boxSizing: 'content-box',
    verticalAlign: `${getVerticalAlign(iconSize)}`,
  };
  return React.cloneElement(children, { style });
};

export default BorderedIcon;
