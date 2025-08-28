import * as React from 'react';
import { Button } from '@patternfly-6/react-core';
import { ExternalLinkAltIcon } from '@patternfly-6/react-icons';

const ExternalLink = ({ href, children }: React.PropsWithChildren<{ href: string }>) => (
  <Button
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    icon={<ExternalLinkAltIcon />}
    iconPosition="end"
    variant="link"
    isInline
    component="a"
  >
    {children}
  </Button>
);

export default ExternalLink;
