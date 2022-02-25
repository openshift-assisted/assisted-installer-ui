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

type MassDeleteHostModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  hosts: Host[];
  // eslint-disable-next-line
  onDelete: (host: Host) => Promise<any>;
};

const MassDeleteHostModal: React.FC<MassDeleteHostModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  hosts,
  children,
}) => {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<{ title: string; message: string }>();
  const onClick = async () => {
    setError(undefined);
    const i = 0;
    try {
      for (const host of hosts) {
        setProgress((100 * (i + 1)) / hosts.length);
        await onDelete(host);
      }
      setProgress(null);
      onClose();
    } catch (err) {
      setError({
        title: 'Failed to delete host',
        message: err?.message || 'An error occured while deleting hosts',
      });
      setProgress(null);
    }
  };

  return (
    <Modal
      aria-label="Delete hosts dialog"
      title="Delete hosts"
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
            You are deleting multiple resources. All resources listed below will be deleted if you
            continue. This action cannot be undone.
          </StackItem>
          <StackItem>{children}</StackItem>
          <StackItem>
            <ModalProgress error={error} progress={progress} />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button onClick={onClick} isDisabled={progress !== null} variant={ButtonVariant.danger}>
          Delete hosts
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={progress !== null}>
          Cancel
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default MassDeleteHostModal;
