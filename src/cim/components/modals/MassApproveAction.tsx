import * as React from 'react';
import { DropdownItem } from '@patternfly/react-core';
import { AgentK8sResource } from '../../types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type MassApproveActionProps = {
  onApprove: VoidFunction;
  selectedAgents: AgentK8sResource[];
};

const MassApproveAction: React.FC<MassApproveActionProps> = ({ onApprove, selectedAgents }) => {
  const { t } = useTranslation();
  const disabledDescription = selectedAgents.every((a) => a.spec.approved)
    ? t('ai:All selected hosts are already approved.')
    : undefined;
  return (
    <DropdownItem
      onClick={onApprove}
      isDisabled={!!disabledDescription}
      description={disabledDescription}
    >
      {t('ai:Approve')}
    </DropdownItem>
  );
};

export default MassApproveAction;
