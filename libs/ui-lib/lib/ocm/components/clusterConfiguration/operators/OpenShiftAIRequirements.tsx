import React from 'react';
import { List, ListItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { OPENSHIFT_AI_REQUIREMENTS_LINK } from '../../../../common';

const OpenShiftAIRequirements = () => {
  return (
    <>
      <List>
        <ListItem>At least two worker nodes.</ListItem>
        <ListItem>
          Each worker node requires 32 additional GiB of memory and 8 additional CPUs.
        </ListItem>
      </List>
      <a href={OPENSHIFT_AI_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
        Learn more <ExternalLinkAltIcon />.
      </a>
    </>
  );
};

export default OpenShiftAIRequirements;
