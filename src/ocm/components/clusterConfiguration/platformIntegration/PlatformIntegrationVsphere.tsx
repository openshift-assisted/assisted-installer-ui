import React from 'react';
import { List, ListItem, Title } from '@patternfly/react-core';
import { VSPHERE_CONFIG_LINK } from '../../../../common';

const PlatformIntegrationVsphere = () => {
  return (
    <>
      <Title headingLevel="h6">Requirements</Title>
      <List>
        <ListItem>A network connection between vSphere and the installed OCP.</ListItem>
        <ListItem>
          Ensure clusterSet <code>disk.enableUUID</code> is set to <code>true</code> inside of
          vSphere
        </ListItem>
      </List>
      <a href={VSPHERE_CONFIG_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more about vSphere platform integration'}
      </a>
    </>
  );
};

export default PlatformIntegrationVsphere;
