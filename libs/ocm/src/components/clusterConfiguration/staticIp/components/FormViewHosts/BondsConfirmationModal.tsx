import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';

type BondDeleteModalModalProps = {
  isOpen: boolean;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
};

const BondDeleteModalModal = ({ isOpen, onConfirm, onCancel }: BondDeleteModalModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      aria-label={t('ai:Remove bond dialog')}
      isOpen={isOpen}
      onClose={onCancel}
      id="remove-bond-modal"
      variant="medium"
    >
      <ModalHeader title={t('ai:Remove bond?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{t('ai:The bond associated with the host will be removed.')}</StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onConfirm} variant={ButtonVariant.danger}>
          {t('ai:Remove bond')}
        </Button>
        <Button onClick={onCancel} variant={ButtonVariant.secondary}>
          {t('ai:Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BondDeleteModalModal;
