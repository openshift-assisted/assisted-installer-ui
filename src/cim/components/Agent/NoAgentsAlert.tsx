import React from 'react';
import { Alert, AlertVariant, List, ListComponent, ListItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const NoAgentsAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert variant={AlertVariant.warning} title="No available hosts were found" isInline>
      {t(
        'ai:The cluster can not be installed yet because there are no available hosts found. To continue:',
      )}
      <br />
      <List component={ListComponent.ol}>
        <ListItem>
          {t('ai:Add hosts to an')}{' '}
          <Link to="/multicloud/infrastructure/environments">
            {' '}
            {t('ai:infrastructure environment')}
          </Link>
        </ListItem>
        <ListItem>
          {t('ai:Continue configuration by editing this cluster and utilize the newly added hosts')}
        </ListItem>
      </List>
    </Alert>
  );
};

export default NoAgentsAlert;
