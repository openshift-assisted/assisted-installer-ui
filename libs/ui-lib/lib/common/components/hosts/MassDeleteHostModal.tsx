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

import ModalProgress from '../ui/ModalProgress';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { getErrorMessage } from '../../utils';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type MassDeleteHostModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  hosts: Host[];
  // eslint-disable-next-line
  onDelete: (host: Host) => Promise<any>;
  reloadCluster?: VoidFunction;
  children?: React.ReactNode;
};

const MassDeleteHostModal = ({
  isOpen,
  onClose,
  onDelete,
  reloadCluster,
  hosts,
  children,
}: MassDeleteHostModalProps) => {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<{ title: string; message: string }>();
  const { t } = useTranslation();
  const onClick = async () => {
    setError(undefined);
    const i = 0;

    try {
      for (const host of hosts) {
        setProgress((100 * (i + 1)) / hosts.length);
        await onDelete(host);
      }
      setProgress(null);
      reloadCluster && reloadCluster();
      onClose();
    } catch (e) {
      setError({
        title: t('ai:Failed to delete host'),
        message: getErrorMessage(e),
      });
      setProgress(null);
    }
  };
  return (
    <Modal
      aria-label={t('ai:Remove hosts dialog')}
      title={t('ai:Remove hosts?')}
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="mass-delete-modal"
      variant="medium"
      titleIconVariant="warning"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>{t('ai:All of the listed hosts will be removed.')}</StackItem>
          <StackItem>{children}</StackItem>
          <StackItem>
            <ModalProgress error={error} progress={progress} />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          onClick={() => void onClick()}
          isDisabled={progress !== null}
          variant={ButtonVariant.danger}
        >
          {t('ai:Remove hosts')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={progress !== null}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default MassDeleteHostModal;
