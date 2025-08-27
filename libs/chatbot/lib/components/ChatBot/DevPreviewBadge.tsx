import * as React from 'react';
import { Button, Label, Popover, Stack, StackItem } from '@patternfly-6/react-core';
import { ExternalLinkAltIcon, InfoCircleIcon } from '@patternfly-6/react-icons';

const DevPreviewBadge = () => (
  <Popover
    bodyContent={
      <Stack hasGutter>
        <StackItem>
          Developer preview features are not intended to be used in production environments. The
          clusters deployed with the developer preview features are considered to be development
          clusters and are not supported through the Red Hat Customer Portal case management system.
        </StackItem>
        <StackItem>
          <Button
            href="https://access.redhat.com/support/offerings/devpreview"
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
            variant="link"
            isInline
          >
            Learn more
          </Button>
        </StackItem>
      </Stack>
    }
    position="left"
    withFocusTrap={false}
  >
    <Label style={{ cursor: 'pointer' }} color="orange" icon={<InfoCircleIcon />}>
      Developer Preview
    </Label>
  </Popover>
);

export default DevPreviewBadge;
