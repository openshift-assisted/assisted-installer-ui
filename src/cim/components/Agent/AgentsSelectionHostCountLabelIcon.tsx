import React from 'react';
import PopoverIcon from '../../../common/components/ui/PopoverIcon';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const AgentsSelectionHostCountLabelIcon = () => {
  const { t } = useTranslation();
  return (
    <PopoverIcon
      position="right"
      bodyContent={t('ai:Total count of hosts to be included in the cluster.')}
    />
  );
};

export default AgentsSelectionHostCountLabelIcon;
