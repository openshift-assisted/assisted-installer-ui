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
        <ListItem>At least one supported GPU. Currently only NVIDIA GPUs are supported.</ListItem>
        <ListItem>
          Nodes that have NVIDIA GPUs installed need to have secure boot disabled.
        </ListItem>
      </List>
      Bundle operators:
      <List>
        <ListItem>OpenShift Data Foundation</ListItem>
        <ListItem>Node Feature Discovery</ListItem>
        <ListItem>NVIDIA GPU</ListItem>
        <ListItem>Pipelines</ListItem>
        <ListItem>Service Mesh</ListItem>
        <ListItem>Serverless</ListItem>
        <ListItem>Authorino</ListItem>
      </List>
      <a href={OPENSHIFT_AI_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
        Learn more <ExternalLinkAltIcon />.
      </a>
    </>
  );
};

export default OpenShiftAIRequirements;
