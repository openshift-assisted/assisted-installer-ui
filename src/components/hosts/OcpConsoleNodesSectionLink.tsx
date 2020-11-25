import React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { getOcpConsoleNodesPage } from '../../config';
import { Button, ButtonVariant } from '@patternfly/react-core';

const OcpConsoleNodesSectionLink: React.FC<{
  id?: string;
  ocpConsoleUrl?: string;
  title?: string;
}> = ({ id, ocpConsoleUrl, title = 'OpenShift console' }) =>
  ocpConsoleUrl ? (
    <Button
      variant={ButtonVariant.link}
      onClick={() =>
        window.open(getOcpConsoleNodesPage(ocpConsoleUrl), '_blank', 'noopener noreferrer')
      }
      id={id}
    >
      {title} <ExternalLinkAltIcon />
    </Button>
  ) : null;

export default OcpConsoleNodesSectionLink;
