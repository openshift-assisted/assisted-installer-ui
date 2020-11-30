import React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { AddBareMetalHostsContext } from '../AddBareMetalHosts/AddBareMetalHostsContext';
import { getOcpConsoleNodesPage } from '../../config';

const OcpConsoleNodesSectionLink: React.FC<{
  id?: string;
  title?: string;
}> = ({ id, title = 'OpenShift console' }) => {
  const { ocpConsoleUrl } = React.useContext(AddBareMetalHostsContext);
  if (!ocpConsoleUrl) {
    return null;
  }
  return (
    <Button
      variant={ButtonVariant.link}
      onClick={() =>
        window.open(getOcpConsoleNodesPage(ocpConsoleUrl), '_blank', 'noopener noreferrer')
      }
      id={id}
    >
      {title} <ExternalLinkAltIcon />
    </Button>
  );
};

export default OcpConsoleNodesSectionLink;
