import React from 'react';
import { CodeIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';

const DeveloperPreview = () => (
  <div>
    <CodeIcon color={warningColor.value} />
    &nbsp;Developer Preview
  </div>
);

export default DeveloperPreview;
