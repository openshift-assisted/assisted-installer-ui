import React from 'react';
import {
	Button,
	ButtonVariant
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type DeleteHostModalProps = {
  hostname?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
};

const DeleteHostModal = ({ isOpen, hostname, onClose, onDelete }: DeleteHostModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('ai:Remove host?')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      titleIconVariant="warning"
      actions={[
        <Button
          data-testid="delete-host-submit"
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onDelete}
        >
          {t('ai:Remove host')}
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
          {t('ai:Cancel')}
        </Button>,
      ]}
    >
      {t('ai:Host {{hostname}} will be removed', { hostname: hostname || '' })}
    </Modal>
  );
};

export default DeleteHostModal;
