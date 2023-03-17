import { Alert } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { AgentK8sResource } from '../../types';

const SpecSyncErrAlert = ({ agent }: { agent: AgentK8sResource }) => {
  const { t } = useTranslation();
  return (
    <Alert variant="danger" isInline title={t('ai:Host specification sync error')}>
      {agent.status?.conditions?.find((c) => c.type === 'SpecSynced')?.message}
    </Alert>
  );
};

export default SpecSyncErrAlert;
