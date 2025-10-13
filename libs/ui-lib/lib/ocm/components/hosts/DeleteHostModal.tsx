import React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
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
    >
      <ModalHeader title={t('ai:Remove host?')} titleIconVariant="warning" />
      <ModalBody>
        {t('ai:Host {{hostname}} will be removed', { hostname: hostname || '' })}
      </ModalBody>
      <ModalFooter>
        <Button
          data-testid="delete-host-submit"
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onDelete}
        >
          {t('ai:Remove host')}
        </Button>
        <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
          {t('ai:Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteHostModal;
