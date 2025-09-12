import * as React from 'react';
import { Label, Popover } from '@patternfly-6/react-core';
import { InfoCircleIcon } from '@patternfly-6/react-icons';

const PreviewBadge = () => (
  <Popover
    bodyContent={
      <>
        <p>
          Preview refers to early access features or functionalities that are under active
          development and not yet fully supported for production environments.
        </p>
        <p>
          This feature is made available to allow users to test new functionalities, provide
          feedback, and help shape the future development of the feature.
        </p>
        <p>
          Preview features have limitations on support compared to fully released features. They are
          not intended for production workloads and are not covered by standard Red Hat Customer
          Portal case management.
        </p>
        <p>
          This Preview feature is still in development and may undergo changes, or even be removed,
          before or during their official release.
        </p>
      </>
    }
    position="left"
    withFocusTrap={false}
  >
    <Label style={{ cursor: 'pointer' }} color="orange" icon={<InfoCircleIcon />}>
      Preview
    </Label>
  </Popover>
);

export default PreviewBadge;
