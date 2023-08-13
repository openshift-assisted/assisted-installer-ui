import * as React from 'react';
import { DropdownItem } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type ChangeHostnameActionProps = {
  onChangeHostname: VoidFunction;
};

export const ChangeHostnameAction: React.FC<ChangeHostnameActionProps> = ({ onChangeHostname }) => {
  const { t } = useTranslation();
  return <DropdownItem onClick={onChangeHostname}>{t('ai:Change hostname')}</DropdownItem>;
};

type DeleteHostActionProps = {
  onDeleteHost: VoidFunction;
};

export const DeleteHostAction: React.FC<DeleteHostActionProps> = ({ onDeleteHost }) => {
  const { t } = useTranslation();
  return <DropdownItem onClick={onDeleteHost}>{t('ai:Delete')}</DropdownItem>;
};
