import React from 'react';
import { Alert, AlertVariant, List, ListComponent, ListItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom-v5-compat';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';
import { architectureData, CpuArchitecture, SupportedCpuArchitecture } from '../../../common';

const NoAgentsAlert = ({ cpuArchitecture }: { cpuArchitecture: CpuArchitecture }) => {
  const { t } = useTranslation();
  return (
    <Alert
      variant={AlertVariant.warning}
      title={t('ai:No available hosts with {{cpuArchitecture}} architecture were found', {
        cpuArchitecture: architectureData[cpuArchitecture as SupportedCpuArchitecture].label,
      })}
      isInline
    >
      {t(
        'ai:The cluster can not be installed yet because there are no available hosts with {{cpuArchitecture}} architecture found. To continue:',
        { cpuArchitecture: architectureData[cpuArchitecture as SupportedCpuArchitecture].label },
      )}
      <br />
      <List component={ListComponent.ol}>
        <ListItem>
          <Trans t={t} cpuArchitecture={cpuArchitecture}>
            ai:Add hosts with{' '}
            {{
              cpuArchitecture: architectureData[cpuArchitecture as SupportedCpuArchitecture].label,
            }}{' '}
            architecture to an{' '}
            <Link to="/multicloud/infrastructure/environments">infrastructure environment</Link>
          </Trans>
        </ListItem>
        <ListItem>
          {t('ai:Continue configuration by editing this cluster and utilize the newly added hosts')}
        </ListItem>
      </List>
    </Alert>
  );
};

export default NoAgentsAlert;
