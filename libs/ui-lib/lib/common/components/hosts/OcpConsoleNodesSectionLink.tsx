import React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { AddHostsContext } from '../AddHosts/AddHostsContext';
import { getOcpConsoleNodesPage } from '../../config';

const OcpConsoleNodesSectionLink: React.FC<{
  id?: string;
  title?: string;
}> = ({ id, title = 'OpenShift console' }) => {
  const { ocpConsoleUrl } = React.useContext(AddHostsContext) || {};
  if (!ocpConsoleUrl) {
    return null;
  }
  return (
    <Button icon={<ExternalLinkAltIcon />}
      variant={ButtonVariant.link}
      onClick={() =>
        window.open(getOcpConsoleNodesPage(ocpConsoleUrl), '_blank', 'noopener noreferrer')
      }
      id={id}
    >
      {title} 
    </Button>
  );
};

export default OcpConsoleNodesSectionLink;
