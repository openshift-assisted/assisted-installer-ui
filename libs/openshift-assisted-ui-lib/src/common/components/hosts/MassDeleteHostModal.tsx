import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import ModalProgress from '../ui/ModalProgress';
import { Host } from '../../api';
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
      aria-label={t('ai:Delete hosts dialog')}
      title={t('ai:Delete hosts')}
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="mass-delete-modal"
      variant="medium"
      titleIconVariant="warning"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            {t(
              'ai:You are deleting multiple resources. All resources listed below will be deleted if you continue. This action cannot be undone.',
            )}
          </StackItem>
          <StackItem>{children}</StackItem>
          <StackItem>
            <ModalProgress error={error} progress={progress} />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button onClick={onClick} isDisabled={progress !== null} variant={ButtonVariant.danger}>
          {t('ai:Delete hosts')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={progress !== null}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default MassDeleteHostModal;
