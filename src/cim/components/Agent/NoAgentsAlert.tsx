import React from 'react';
import { Alert, AlertVariant, List, ListComponent, ListItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

const NoAgentsAlert = () => (
  <Alert variant={AlertVariant.warning} title="No available hosts were found" isInline>
    The cluster can not be installed yet because there are no available hosts found. To continue:
    <br />
    <List component={ListComponent.ol}>
      <ListItem>
        Add hosts to an <Link to="/multicloud/infra-environments">infrastructure environment</Link>
      </ListItem>
      <ListItem>
        Continue configuration by editing this cluster and utilize the newly added hosts
      </ListItem>
    </List>
  </Alert>
);

export default NoAgentsAlert;
