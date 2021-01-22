import React from 'react';
import { CodeIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';

export enum DeveloperPreviewPosition {
  default,
  inline,
  inlineRight,
}

const DeveloperPreview: React.FC<{ position?: DeveloperPreviewPosition; className?: string }> = ({
  position = DeveloperPreviewPosition.inlineRight,
  className = '',
}) => {
  let clsName = className;
  switch (position) {
    case DeveloperPreviewPosition.inlineRight:
      clsName += ' assisted-ui-float-right';
      break;
    case DeveloperPreviewPosition.inline:
      clsName += ' assisted-ui-display-inline';
      break;
  }

  return (
    <div className={clsName}>
      <CodeIcon color={warningColor.value} />
      &nbsp;Developer Preview
    </div>
  );
};

export default DeveloperPreview;
