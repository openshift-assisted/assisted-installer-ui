import * as React from 'react';
import {
	Button,
	ButtonVariant,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalBoxBody,
	ModalBoxFooter
} from '@patternfly/react-core/deprecated';

import { useTranslation } from '../../../../../../common/hooks/use-translation-wrapper';

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
      title={t('ai:Remove bond?')}
      isOpen={isOpen}
      onClose={onCancel}
      hasNoBodyWrapper
      id="remove-bond-modal"
      variant="medium"
      titleIconVariant="warning"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>{t('ai:The bond associated with the host will be removed.')}</StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button onClick={onConfirm} variant={ButtonVariant.danger}>
          {t('ai:Remove bond')}
        </Button>
        <Button onClick={onCancel} variant={ButtonVariant.secondary}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default BondDeleteModalModal;
