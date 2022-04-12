import React from 'react';
import { DownloadIcon, IconSize } from '@patternfly/react-icons';

export const getPadding = (size: IconSize | keyof typeof IconSize) => {
  switch (size) {
    case IconSize.sm:
      return '0.3em';
    case IconSize.md:
      return '1.5em';
    case IconSize.lg:
      return '2em';
    case IconSize.xl:
      return '3em';
    default:
      return '1em';
  }
};

export const getVerticalAlign = (size: IconSize | keyof typeof IconSize) => {
  switch (size) {
    case IconSize.sm:
      return '-0.3em';
    case IconSize.md:
      return '-1.5em';
    case IconSize.lg:
      return '-2em';
    case IconSize.xl:
      return '-3em';
    default:
      return '-1em';
  }
};

type BorderedIconProps = {
  children: React.ReactElement<React.ComponentProps<typeof DownloadIcon>>;
  iconSize?: IconSize;
};

const BorderedIcon = ({ children, iconSize = IconSize.sm }: BorderedIconProps) => {
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
