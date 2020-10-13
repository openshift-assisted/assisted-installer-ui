import React from 'react';
import { CodeIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';

export enum DeveloperPreviewPosition {
  default,
  inlineRight,
}

const DeveloperPreview: React.FC<{ position?: DeveloperPreviewPosition }> = ({
  position = DeveloperPreviewPosition.inlineRight,
}) => {
  let className = '';
  if (position === DeveloperPreviewPosition.inlineRight) {
    className = 'pf-u-float-right';
  }

  return (
    <div className={className}>
      <CodeIcon color={warningColor.value} />
      &nbsp;Developer Preview
    </div>
  );
};

export default DeveloperPreview;
